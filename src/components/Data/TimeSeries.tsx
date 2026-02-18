import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  BarController,
} from "chart.js";
import { Col, Form, Row, Table } from "react-bootstrap";
import Card from "@/components/Card";
import ChartSummary from "./ChartSummary/ChartSummary";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { useEffect, useState } from "react";
import { mutantChartColors, wildtypeChartColors } from "@/utils/chart";
import { Chart } from "react-chartjs-2";
import errorbarsPlugin from "@/utils/chart/errorbars.plugin";
import DownloadData from "../DownloadData";
import { getDownloadData } from "@/utils";
import { GeneralChartProps } from "@/models";
import { fetchDatasetFromS3 } from "@/api-service";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  BarController,
);

type ChartSeries = {
  originalData: any;
  data: Array<any>;
  sampleGroup: "control" | "experimental";
  sex: "male" | "female";
};

const getPointStyle = (key: string) => {
  if (key.includes("WT")) {
    return key.includes("Female") ? "triangle" : "rectRot";
  } else {
    return key.includes("Female") ? "rect" : "circle";
  }
};

const getLabel = (sex, zygosity, sampleGroup) => {
  const labelSex = sex[0].toUpperCase() + sex.slice(1);
  const labelZyg =
    zygosity === "homozygote"
      ? "HOM"
      : zygosity === "hemizygote"
        ? "HEM"
        : "HET";
  const labelGroup = sampleGroup == "experimental" ? labelZyg : "WT";
  const order = labelGroup !== "WT" ? 1 : 2;
  const label = `${labelSex} ${labelGroup}`;
  return label;
};

// Function to group data by a property
const groupBy = (data, key) => {
  return data.reduce((result, item) => {
    (result[item[key]] = result[item[key]] || []).push(item);
    return result;
  }, {});
};

const calculateStats = (groupedData, valueKey, windowSize = 1) => {
  return groupedData.map((group) => {
    // Calculate average
    const avg =
      group.values.reduce((sum, item) => sum + item[valueKey], 0) /
      group.values.length;

    // Calculate standard deviation
    const sd = Math.sqrt(
      group.values.reduce(
        (sum, item) => sum + Math.pow(item[valueKey] - avg, 2),
        0,
      ) / group.values.length,
    );

    return {
      group: group.key,
      average: avg,
      standardDeviation: sd,
      values: group.values,
    };
  });
};

const countSpecimens = (series, sex: string, sampleGroup: string) => {
  const selectedSeries = series.find(
    (s) => s.sampleGroup === sampleGroup && s.specimenSex === sex,
  );
  if (!selectedSeries) return 0;
  return new Set(selectedSeries.observations.map((d) => d.specimenId)).size;
};

const TimeSeries = ({
  datasetSummary,
  isVisible,
  children,
}: GeneralChartProps) => {
  const [viewSMA, setViewSMA] = useState(false);
  useEffect(() => {
    setViewSMA(datasetSummary.procedureStableId.includes("CAL"));
  }, []);

  const getLineSeries = (dataSeries, sex, sampleGroup, zygosity) => {
    if (!dataSeries) {
      return null;
    }

    const seriesData =
      dataSeries.find(
        (p) => p.sampleGroup === sampleGroup && p.specimenSex === sex,
      )?.["observations"] || [];

    const groupedData = groupBy(seriesData, "discretePoint");

    const data = calculateStats(
      Object.keys(groupedData).map((key) => ({
        key,
        values: groupedData[key],
      })),
      "dataPoint",
    )
      .map((p) => {
        const p2 = { ...p };
        p2.x = +p.group;
        p2.y = p.average;
        p2.yMin = p.average - p.standardDeviation;
        p2.yMax = p.average + p.standardDeviation;
        return p2;
      })
      .sort((a, b) => a.x - b.x);

    const smaData = calculateSMA(seriesData)
      .map((p) => {
        const p2 = { ...p };
        p2.x = +p.discretePoint;
        p2.y = p.value;
        return p2;
      })
      .sort((a, b) => a.x - b.x);
    const label = getLabel(sex, zygosity, sampleGroup);

    return {
      label,
      type: "line" as const,
      sex,
      sampleGroup,
      data: data,
      originalData: data,
      smaData,
      borderColor: label.includes("WT")
        ? wildtypeChartColors.halfOpacity
        : mutantChartColors.halfOpacity,
      backgroundColor: label.includes("WT")
        ? wildtypeChartColors.halfOpacity
        : mutantChartColors.halfOpacity,
      pointStyle: getPointStyle(label),
    };
  };

  function calculateSMA(data) {
    // Sort the data by the discretePoint field
    data.sort((a, b) => a.discretePoint - b.discretePoint);

    // Initialize variables
    let smaData = [];
    let sum = 0;
    let count = 0;
    let currentHour = null;

    // Loop through the data
    data.forEach((point) => {
      const hour = Math.floor(point.discretePoint);

      // If a new hour begins, calculate the average for the previous hour
      if (hour !== currentHour) {
        if (currentHour !== null) {
          const average = sum / count;
          smaData.push({ discretePoint: currentHour, value: average });
        }
        currentHour = hour;
        sum = 0;
        count = 0;
      }

      // Add the dataPoint to the sum and increment the count
      sum += point.dataPoint;
      count++;
    });

    // Calculate the average for the last hour
    if (count > 0) {
      const average = sum / count;
      smaData.push({ discretePoint: currentHour, value: average });
    }

    return smaData;
  }

  const filterChartSeries = (zygosity: string, seriesArray: Array<any>) => {
    if (zygosity === "hemizygote") {
      return seriesArray.filter((c) => c.sex === "male");
    }
    const validExperimentalSeries = seriesArray.filter(
      (c) => c.sampleGroup === "experimental" && c.data.length > 0,
    );
    const validExperimentalSeriesSexes = validExperimentalSeries.map(
      (c) => c.sex,
    );
    const controlSeries = seriesArray.filter(
      (c) =>
        c.sampleGroup === "control" &&
        validExperimentalSeriesSexes.includes(c.sex),
    );
    return [...controlSeries, ...validExperimentalSeries];
  };

  const updateSummaryStatistics = (chartSeries: Array<ChartSeries>) => {
    const zygosity = datasetSummary.zygosity;
    return chartSeries.map((serie) => {
      const { sampleGroup, sex } = serie;
      const sampleGroupKey = sampleGroup === "control" ? "Control" : "Mutant";
      const meanKey = `${sex}${sampleGroupKey}Mean`;
      const stddevKey = `${sex}${sampleGroupKey}Sd`;
      return {
        label: `${_.capitalize(sex)} ${
          sampleGroup === "control" ? "Control" : _.capitalize(zygosity)
        }`,
        mean: datasetSummary.summaryStatistics?.[meanKey].toFixed(3) || 0,
        stddev: datasetSummary.summaryStatistics?.[stddevKey].toFixed(3) || 0,
        count:
          new Set(
            serie.originalData
              .flatMap((d) => d.values)
              .map((v) => v.specimenId),
          ).size || 0,
      };
    });
  };
  const { data, isLoading, error, isError } = useQuery({
    queryKey: [
      "dataset",
      datasetSummary.parameterName,
      datasetSummary.datasetId,
    ],
    queryFn: () => fetchDatasetFromS3(datasetSummary["datasetId"]),
    select: (response) => {
      const dataSeries = response.series;
      const isCategorical = dataSeries[0].observations[0].category !== null;

      const femaleWTPoints = getLineSeries(
        dataSeries,
        "female",
        "control",
        datasetSummary.zygosity,
      );
      const maleWTPoints = getLineSeries(
        dataSeries,
        "male",
        "control",
        datasetSummary.zygosity,
      );
      const femaleHomPoints = getLineSeries(
        dataSeries,
        "female",
        "experimental",
        datasetSummary.zygosity,
      );
      const maleHomPoints = getLineSeries(
        dataSeries,
        "male",
        "experimental",
        datasetSummary.zygosity,
      );
      const chartSeries = filterChartSeries(datasetSummary.zygosity, [
        femaleWTPoints,
        maleWTPoints,
        femaleHomPoints,
        maleHomPoints,
      ]);

      const summaryStatistics = !isCategorical
        ? updateSummaryStatistics(chartSeries)
        : null;

      const labels = Array.from(
        new Set(chartSeries.flatMap((s) => s.data.map((d) => d.x))),
      ).sort((a, b) => (a < b ? -1 : 1));

      const smaLabels = Array.from(
        new Set(chartSeries.flatMap((s) => s.smaData.map((d) => d.x))),
      ).sort((a, b) => (a < b ? -1 : 1));

      return {
        labels,
        smaLabels,
        chartSeries,
        summaryStatistics,
        computedCounts: {
          summaryStatistics: {
            femaleMutantCount: countSpecimens(
              dataSeries,
              "female",
              "experimental",
            ),
            maleMutantCount: countSpecimens(dataSeries, "male", "experimental"),
            femaleControlCount: countSpecimens(dataSeries, "female", "control"),
            maleControlCount: countSpecimens(dataSeries, "male", "control"),
          },
        },
        originalData: response,
        isCategorical,
      };
    },
    enabled: isVisible,
  });

  const getTableData = (chartSeries) => {
    const indexByTimePoint = chartSeries
      .flatMap((s) =>
        s.originalData.map((d) => {
          return { ...d, id: s.label };
        }),
      )
      .reduce((indexByTimePoint, item) => {
        indexByTimePoint[item.group] = indexByTimePoint[item.group]
          ? indexByTimePoint[item.group]
          : {};
        indexByTimePoint[item.group][item.id] = indexByTimePoint[item.group][
          item.id
        ]
          ? indexByTimePoint[item.group][item.id]
          : {};
        indexByTimePoint[item.group][item.id]["avg"] = item.y;
        indexByTimePoint[item.group][item.id]["count"] = new Set(
          item.values.map((v) => v.specimenId),
        ).size;
        return indexByTimePoint;
      }, {});

    const timePoints = Object.keys(indexByTimePoint).sort((a, b) => a - b);

    const rows = timePoints.map((timePoint) => {
      return [timePoint].concat(
        chartSeries.map((s) =>
          indexByTimePoint[timePoint][s.label]
            ? indexByTimePoint[timePoint][s.label]
            : null,
        ),
      );
    });
    return {
      headers: [datasetSummary["unit"]["x"] || "Time point"].concat(
        chartSeries.map((s) => s.label),
      ),
      rows,
    };
  };

  const getCategoricalTableData = (series, parameterStableId: string) => {
    if (!series) return;

    const isICSPassiveRotationParameter =
      parameterStableId === "ICS_ROT_003_001";
    // Flatten the observations from the series
    const observations = series.flatMap((s) =>
      s.observations.map((o) => ({
        sampleGroup: s.sampleGroup,
        specimenSex: s.specimenSex,
        discretePoint: o.discretePoint,
        category: o.category,
      })),
    );

    // Group the observations by a composite key
    const compositeGroup = _.groupBy(
      observations,
      (item) =>
        `${item.sampleGroup}-${item.specimenSex}-${item.discretePoint}-${item.category}`,
    );

    // Create header labels and a mapping from composite keys to header indices
    const groupToHeaderIndex = {};
    const headers = [
      ...new Set(
        Object.keys(compositeGroup).map((k) => {
          const [sampleGroup, specimenSex, discretePoint, category] =
            k.split("-");
          const label = getLabel(
            specimenSex,
            datasetSummary.zygosity,
            sampleGroup,
          );
          groupToHeaderIndex[k] = label;
          return label;
        }),
      ),
    ];

    // Sort headers alphabetically
    headers.sort((a, b) => (a < b ? -1 : 1));

    // Define increments and categories
    const increments = [1, 2, 3];
    const categories = isICSPassiveRotationParameter
      ? ["yes", "no"]
      : ["f", "j", "p"];

    // Generate the cross product of increments and categories
    const crossProductConcat = increments.flatMap((a) =>
      categories.map((b) => `${a}-${b}`),
    );

    // Define a display mapping for categories
    const categoryDisplay = isICSPassiveRotationParameter
      ? {
          yes: "Yes",
          no: "No",
        }
      : {
          f: "Falling",
          j: "Jumping",
          p: "Passive rotation",
        };
    // Generate rows for the table
    const rows = crossProductConcat.map((g) => {
      const [increment, category] = g.split("-");
      const row = [increment, categoryDisplay[category]];

      // Fill the row with the appropriate data from the composite group
      headers.forEach((header) => {
        const keys = Object.keys(groupToHeaderIndex).filter(
          (k) => groupToHeaderIndex[k] === header,
        );
        keys.forEach((key) => {
          if (key && key.endsWith(`${increment}-${category}`)) {
            row.push(compositeGroup[key].length);
          }
        });
        if (
          keys.filter((k) => k.endsWith(`${increment}-${category}`)).length ===
          0
        )
          row.push(0);
      });

      return row;
    });

    // Return the table data
    return {
      headers: ["Increment", "Category"].concat(headers),
      rows: rows,
    };
  };

  const tableData = data?.isCategorical
    ? getCategoricalTableData(
        data.originalData.series,
        datasetSummary.parameterStableId,
      )
    : getTableData(data?.chartSeries || []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index" as const,
      axis: "y" as const,
    },
    scales: {
      y: {
        title: {
          display: true,
          text: datasetSummary["unit"]["y"],
        },
      },
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: datasetSummary["unit"]["x"],
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
        callbacks: {},
      },
    },
  };
  const chartPlugins = [errorbarsPlugin];

  return (
    <>
      {" "}
      <ChartSummary
        datasetSummary={
          data
            ? Object.assign({}, datasetSummary, data.computedCounts)
            : datasetSummary
        }
        displayPValueStatement={false}
        displayAssociatedPhenotype={false}
      />
      <Row>
        {data && !data.isCategorical && (
          <Col lg={12}>
            <Card>
              <div style={{ position: "relative", height: "400px" }}>
                {datasetSummary.procedureStableId.includes("CAL") ? (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Form.Check // prettier-ignore
                      type="switch"
                      id="custom-switch"
                      label="View as Simple Moving Averages"
                      onChange={() => setViewSMA(!viewSMA)}
                      checked={viewSMA}
                    />
                  </div>
                ) : null}
                <Chart
                  type="bar"
                  options={chartOptions}
                  data={{
                    datasets: data.chartSeries.map((s) => {
                      return { ...s, data: !viewSMA ? s.data : s.smaData };
                    }),
                    labels: !viewSMA ? data.labels : data.smaLabels,
                  }}
                  plugins={chartPlugins}
                />
              </div>
            </Card>
          </Col>
        )}
        <Col lg={12}>
          <Card>
            {data && !data.isCategorical && (
              <Table striped>
                <thead>
                  <tr>
                    {tableData.headers.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((col, i) => (
                        <td key={i}>
                          {col
                            ? typeof col == "string"
                              ? col
                              : `${col["avg"]} (${col["count"]})`
                            : null}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
            {data && data.isCategorical && (
              <Table striped>
                <thead>
                  <tr>
                    {" "}
                    {tableData.headers.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((col, i) => (
                        <td key={i}>{col}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </Col>
        {!!children && <Col lg={12}>{children}</Col>}
        <Col>
          <Card>
            <h2>Experimental data download</h2>
            {data && (
              <DownloadData
                {...getDownloadData(datasetSummary, data?.originalData)}
              />
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default TimeSeries;
