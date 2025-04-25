import { Dataset } from "@/models";
import { useEffect, useMemo, useState } from "react";
import { useRelatedParametersQuery } from "@/hooks/related-parameters.query";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Colors,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { ViolinController, Violin } from "@sgratzl/chartjs-chart-boxplot";
import { Card } from "@/components";
import LoadingProgressBar from "@/components/LoadingProgressBar";
import ChartSummary from "@/components/Data/ChartSummary/ChartSummary";
import { useMultipleS3DatasetsQuery } from "@/hooks";
import quartileLinesPlugin from "@/utils/chart/violin-quartile-lines.plugin";
import { Col, Form, Row } from "react-bootstrap";
import SortableTable from "@/components/SortableTable";
import StatisticalMethodTable from "@/components/Data/StatisticalMethodTable";
import { generateSummaryStatistics } from "@/utils/chart";
import { chartLoadingIndicatorChannel } from "@/eventChannels";
import displayTooltipLabelMultiline from "@/shared/chart-js-plugins/boxplot-tooltip-label-multiline";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ViolinController,
  Violin,
  Colors,
);

const parameterList = [
  "IMPC_ACS_033_001", // % PP1
  "IMPC_ACS_034_001", // % PP2
  "IMPC_ACS_035_001", // % PP3
  "IMPC_ACS_036_001", // % PP4
  "IMPC_ACS_037_001", // % Global
];

const labels = {
  IMPC_ACS_033_001: "% PP1",
  IMPC_ACS_034_001: "% PP2",
  IMPC_ACS_035_001: "% PP3",
  IMPC_ACS_036_001: "% PP4",
};

type PPIProps = {
  datasetSummaries: Array<Dataset>;
  onNewSummariesFetched: (missingSummaries: Array<any>) => void;
  activeDataset: Dataset;
};

const PPI = (props: PPIProps) => {
  const { datasetSummaries, activeDataset, onNewSummariesFetched } = props;
  const [viewScatterPoints, setViewScatterPoints] = useState(false);

  const { datasets, datasetsAreLoading } = useRelatedParametersQuery(
    datasetSummaries,
    parameterList,
    onNewSummariesFetched,
  );

  const { results, hasLoadedAllData } = useMultipleS3DatasetsQuery(
    "PPI",
    datasets,
  );

  useEffect(() => {
    chartLoadingIndicatorChannel.emit(
      "toggleIndicator",
      !hasLoadedAllData || datasetsAreLoading,
    );
  }, [hasLoadedAllData, datasetsAreLoading]);

  const parseData = (series: Array<any>, sex: string, sampleGroup: string) => {
    const data = series?.find(
      (serie) => serie.sampleGroup === sampleGroup && serie.specimenSex === sex,
    );
    return data?.observations.map((d) => +d.dataPoint).sort() || [];
  };

  const chartDatasets = useMemo(() => {
    return parameterList
      .filter((param) => param !== "IMPC_ACS_037_001")
      .map((param) => datasets.find((d) => d.parameterStableId === param))
      .filter(Boolean)
      .map((dataset) => {
        const matchingRes = results.find(
          (r) => r.datasetId === dataset.datasetId,
        );
        return {
          ...matchingRes,
          label: labels[dataset.parameterStableId],
        };
      })
      .filter(Boolean)
      .map((result) => {
        return {
          type: "violin" as const,
          label: result.label,
          data: [
            parseData(result.series, "male", "experimental"),
            parseData(result.series, "male", "control"),
            parseData(result.series, "female", "experimental"),
            parseData(result.series, "female", "control"),
          ],
          itemRadius: viewScatterPoints ? 2 : 0,
          padding: 100,
          outlierRadius: 5,
        };
      });
  }, [datasets, results, viewScatterPoints]);

  const chartLabels = useMemo(() => {
    const zygosity = datasets?.[0]?.zygosity;
    const zygLabel = zygosity === "heterozygote" ? "Het" : "Hom";
    return [`Male ${zygLabel}`, `Male WT`, `Female ${zygLabel}`, `Female WT`];
  }, [datasets]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: displayTooltipLabelMultiline,
        },
      },
    },
  };

  const chartData = {
    labels: chartLabels,
    datasets: chartDatasets,
  };

  const activeDatasetResult = results.find(
    (r) => r.datasetId === activeDataset.datasetId,
  );
  const activeDatasetStatistics = !!activeDatasetResult
    ? generateSummaryStatistics(activeDataset, activeDatasetResult.series)
    : [];

  return (
    <>
      <ChartSummary datasetSummary={activeDataset} />
      <Card>
        <h2>Statistical information</h2>
        <Row>
          <Col lg={6}>
            <SortableTable
              headers={[
                { width: 5, label: "", disabled: true },
                { width: 2, label: "Mean", disabled: true },
                { width: 2, label: "Stddev", disabled: true },
                { width: 3, label: "# Samples", disabled: true },
              ]}
            >
              {activeDatasetStatistics.map((stats) => (
                <tr>
                  <td>{stats.label}</td>
                  <td>{stats.mean}</td>
                  <td>{stats.stddev}</td>
                  <td>{stats.count}</td>
                </tr>
              ))}
            </SortableTable>
          </Col>
          <Col lg={6}>
            <StatisticalMethodTable
              datasetSummary={activeDataset}
              onlyDisplayTable
            />
          </Col>
        </Row>
      </Card>
      <Card>
        <div>
          {hasLoadedAllData ? (
            <>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Form.Check // prettier-ignore
                  type="switch"
                  id="custom-switch"
                  label="Show scattered points"
                  onChange={() =>
                    setViewScatterPoints((prevState) => !prevState)
                  }
                  checked={viewScatterPoints}
                />
              </div>
              <div id="chart" style={{ position: "relative", height: "400px" }}>
                <Chart
                  type="violin"
                  data={chartData}
                  options={chartOptions}
                  plugins={[quartileLinesPlugin]}
                />
              </div>
              <div>
                <div>
                  <div style={{ display: "inline-block" }}>
                    Top
                    <hr
                      style={{
                        border: "none",
                        borderTop: "3px dotted #000",
                        height: "3px",
                        width: "30px",
                        display: "inline-block",
                        margin: "0 0 0 0.5rem",
                        opacity: 1,
                      }}
                    />
                    &nbsp;line: 75th percentile
                  </div>
                  <br />
                  <div style={{ display: "inline-block" }}>
                    Middle
                    <hr
                      style={{
                        border: "none",
                        borderTop: "3px dashed #000",
                        height: "3px",
                        width: "30px",
                        display: "inline-block",
                        margin: "0 0 0 0.5rem",
                        opacity: 1,
                      }}
                    />
                    &nbsp;line: 50th percentile
                  </div>
                  <br />
                  <div style={{ display: "inline-block" }}>
                    Bottom
                    <hr
                      style={{
                        border: "none",
                        borderTop: "3px dotted #000",
                        height: "3px",
                        width: "30px",
                        display: "inline-block",
                        margin: "0 0 0 0.5rem",
                        opacity: 1,
                      }}
                    />
                    &nbsp;line: 25th percentile
                  </div>
                  <br />
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        backgroundColor: "#CCC",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                      }}
                    />
                    : mean value
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <LoadingProgressBar />
            </div>
          )}
        </div>
      </Card>
    </>
  );
};

export default PPI;
