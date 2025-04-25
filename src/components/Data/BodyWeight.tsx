import { Col, Form, Row, Table } from "react-bootstrap";
import Card from "@/components/Card";
import ChartSummary from "./ChartSummary/ChartSummary";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  LineWithErrorBarsController,
  PointWithErrorBar,
} from "chartjs-chart-error-bars";
import { useEffect, useMemo, useState } from "react";
import { mutantChartColors, wildtypeChartColors } from "@/utils/chart";
import { BodyWeightLinePlot } from "./Plots/BodyWeightLinePlot";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LineWithErrorBarsController,
  PointWithErrorBar,
);
const clone = (obj) => JSON.parse(JSON.stringify(obj));

const getPointStyle = (key: string) => {
  if (key.includes("WT")) {
    return key.includes("Female") ? "triangle" : "rectRot";
  } else {
    return key.includes("Female") ? "rect" : "circle";
  }
};

const BodyWeightChart = ({ datasetSummary }) => {
  const [viewOnlyRangeForMutant, setViewOnlyRangeForMutant] = useState(true);

  const data = useMemo(() => {
    const result = {};
    const datasetClone = clone(datasetSummary);
    datasetClone.chartData?.forEach((point) => {
      let label = point.sex === "male" ? "Male" : "Female";
      label +=
        point.sampleGroup === "control"
          ? " WT"
          : point.zygosity === "homozygote"
            ? " Hom."
            : " Het.";
      if (result[label] === undefined) {
        result[label] = [];
      }
      const ageInWeeks = Number.parseInt(point.ageInWeeks);
      if (ageInWeeks > 0) {
        result[label].push({
          y: parseFloat(point.mean.toPrecision(5)),
          x: ageInWeeks,
          yMin: parseFloat((point.mean - point.std).toPrecision(5)),
          yMax: parseFloat((point.mean + point.std).toPrecision(5)),
          ageInWeeks: ageInWeeks,
          count: point.count,
        });
      }
    });
    Object.keys(result).forEach((key) => {
      result[key] = result[key].toSorted(
        (p1, p2) => p1.ageInWeeks - p2.ageInWeeks,
      );
    });
    return result;
  }, [datasetSummary]);

  const getOrderedColumns = () => {
    return Object.keys(data).sort();
  };

  const getMaxAge = (absoluteAge: boolean): number => {
    if (data) {
      return Object.keys(data)
        .filter((key) =>
          viewOnlyRangeForMutant && !absoluteAge ? !key.includes("WT") : true,
        )
        .map((key) => data[key])
        .reduce((age, datasetValues) => {
          const maxAgeByDataset = datasetValues.at(-1).ageInWeeks;
          return maxAgeByDataset > age ? maxAgeByDataset : age;
        }, 0);
    }
    return 0;
  };

  const getMinAge = (): number => {
    if (data) {
      return Object.keys(data)
        .filter((key) => (viewOnlyRangeForMutant ? !key.includes("WT") : true))
        .map((key) => data[key])
        .reduce((age, datasetValues) => {
          const maxAgeByDataset = datasetValues.at(0).ageInWeeks;
          return maxAgeByDataset < age ? maxAgeByDataset : age;
        }, Number.MAX_SAFE_INTEGER);
    }
    return 0;
  };

  const getValuesForRow = (week: number) => {
    return getOrderedColumns()
      .map((key) => data[key])
      .map((dataset) => {
        const value = dataset.find((point) => point.ageInWeeks === week);
        return value === undefined
          ? "-"
          : `${value.y.toFixed(6)} (${value.count})`;
      });
  };

  const generateDataset = (data: Array<any>, labels: Array<number>) => {
    return labels.map((label) => {
      const pointToAdd = data.find((point) => point.ageInWeeks === label);
      return !!pointToAdd
        ? pointToAdd
        : {
            ageInWeeks: label,
            count: 0,
            x: label,
            y: null,
            yMax: 0,
            yMin: 0,
          };
    });
  };

  const processData = () => {
    const maxAge = getMaxAge(false);
    const minAge = getMinAge();
    const weekLabels = Array.from(
      { length: maxAge },
      (_, index) => minAge + index,
    );
    const datasets = getOrderedColumns().map((key) => {
      const dataSetColor = key.includes("WT")
        ? wildtypeChartColors.halfOpacity
        : mutantChartColors.halfOpacity;
      return {
        label: key,
        data: generateDataset(data[key], weekLabels),
        borderColor: dataSetColor,
        backgroundColor: dataSetColor,
        errorBarColor: dataSetColor,
        errorBarWhiskerColor: dataSetColor,
        pointStyle: getPointStyle(key),
        spanGaps: true,
      };
    });
    return {
      datasets,
      labels: weekLabels,
    };
  };

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index" as const,
        axis: "y" as const,
      },
      scales: {
        y: {
          min: 0,
          max: 50,
          title: {
            display: true,
            text: "Mass (g)",
          },
        },
        x: {
          grid: {
            display: false,
          },
          title: {
            display: true,
            text: "Age - rounded to nearest week",
          },
        },
      },
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: { usePointStyle: true },
        },
        tooltip: {
          usePointStyle: true,
          title: { padding: { top: 10 } },
          mode: "x",
          callbacks: {
            title: (ctx) => `Age - Rounded To Nearest Week ${ctx?.[0]?.label}`,
            label: (ctx) =>
              `${ctx.dataset.label} (count: ${ctx.raw.count}) Mass: ${ctx.raw.y}g SD: ${ctx.raw.yMin}-${ctx.raw.yMax}`,
          },
        },
      },
    }),
    [],
  );

  const maxAge = getMaxAge(true);
  const chartData = useMemo(
    () => processData(),
    [data, viewOnlyRangeForMutant],
  );

  return (
    <>
      <ChartSummary
        datasetSummary={datasetSummary}
        displayPValueStatement={false}
        displayAssociatedPhenotype={false}
      />
      <Row>
        <Col lg={12}>
          <Card style={{ position: "sticky", top: 0, zIndex: 1 }}>
            <div style={{ position: "relative", height: "400px" }}>
              {!!data && (
                <>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Form.Check // prettier-ignore
                      type="switch"
                      id="custom-switch"
                      label="View data within mutants data range"
                      onChange={() =>
                        setViewOnlyRangeForMutant(!viewOnlyRangeForMutant)
                      }
                      checked={viewOnlyRangeForMutant}
                    />
                  </div>
                  <BodyWeightLinePlot options={chartOptions} data={chartData} />
                </>
              )}
            </div>
          </Card>
          <Card>
            {!!data && (
              <Table striped>
                <thead>
                  <tr>
                    <th>Week</th>
                    {getOrderedColumns().map((label) => (
                      <th key={label}>{label + " (count)"}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...Array(maxAge)].map((week, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      {getValuesForRow(i + 1).map((value) => (
                        <td>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default BodyWeightChart;
