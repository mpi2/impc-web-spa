import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Col, Row } from "react-bootstrap";
import Card from "../Card";
import SortableTable from "../SortableTable";
import UnidimensionalBoxPlot from "./Plots/UnidimensionalBoxPlot";
import UnidimensionalScatterPlot from "./Plots/UnidimensionalScatterPlot";
import { formatPValue, getDownloadData } from "@/utils";
import ChartSummary from "./ChartSummary/ChartSummary";
import { GeneralChartProps } from "@/models";
import { capitalize } from "lodash";
import StatisticalMethodTable from "./StatisticalMethodTable";
import StatisticalAnalysisDownloadLink from "./StatisticalAnalysisDownloadLink";
import { DownloadData } from "..";
import { getZygosityLabel } from "@/components/Data/Utils";
import { useUnidimensionalDataQuery } from "@/hooks";
import { useMemo } from "react";

type ChartSeries = {
  data: Array<any>;
  sampleGroup: "control" | "experimental";
  sex: "male" | "female";
};

const Unidimensional = ({
  datasetSummary,
  isVisible,
  children,
}: GeneralChartProps) => {
  const updateSummaryStatistics = (chartSeries: Array<ChartSeries>) => {
    const zygosity = datasetSummary.zygosity;
    return chartSeries.map((serie) => {
      const { sampleGroup, sex } = serie;
      const sampleGroupKey = sampleGroup === "control" ? "Control" : "Mutant";
      const meanKey = `${sex}${sampleGroupKey}Mean`;
      const stddevKey = `${sex}${sampleGroupKey}Sd`;
      const countKey = `${sex}${sampleGroupKey}Count`;
      return {
        label: `${capitalize(sex)} ${getZygosityLabel(zygosity, sampleGroup)}`,
        mean: datasetSummary.summaryStatistics?.[meanKey]?.toFixed(3) || 0,
        stddev: datasetSummary.summaryStatistics?.[stddevKey]?.toFixed(3) || 0,
        count: datasetSummary.summaryStatistics?.[countKey] || 0,
      };
    });
  };

  const { data, isLoading, error, isError } = useUnidimensionalDataQuery(
    datasetSummary.parameterName,
    datasetSummary.datasetId,
    datasetSummary.zygosity,
    isVisible,
  );

  const summaryStatistics = useMemo(
    () => updateSummaryStatistics(data.chartSeries),
    [data],
  );

  const combinedPValue =
    formatPValue(
      datasetSummary["statisticalMethod"]["attributes"][
        "genotypeEffectPValue"
      ] ?? datasetSummary.reportedPValue,
    ) || "N/A";

  const femalePValue =
    formatPValue(
      datasetSummary["statisticalMethod"]["attributes"]["femaleKoEffectPValue"],
    ) || "N/A";

  const malePValue =
    formatPValue(
      datasetSummary["statisticalMethod"]["attributes"]["maleKoEffectPValue"],
    ) || "N/A";

  return (
    <>
      <ChartSummary datasetSummary={datasetSummary} />
      <Row>
        <Col lg={12}>
          <Card>
            <Row>
              <Col lg={4}>
                <div className="text-center">
                  {datasetSummary["parameterName"]} / Box plot
                </div>
                <div>
                  {" "}
                  <UnidimensionalBoxPlot
                    series={data?.chartSeries || []}
                    zygosity={datasetSummary.zygosity}
                    parameterName={datasetSummary["parameterName"]}
                    unit={datasetSummary["unit"]["x"]}
                  />
                </div>
              </Col>
              <Col lg={8}>
                <div className="text-center">
                  {datasetSummary["parameterName"]} / Scatter plot
                </div>
                <div>
                  <UnidimensionalScatterPlot
                    scatterSeries={data?.chartSeries || []}
                    lineSeries={data?.lineSeries || []}
                    zygosity={datasetSummary["zygosity"]}
                    parameterName={datasetSummary["parameterName"]}
                    unit={datasetSummary["unit"]["x"]}
                  />
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <Row>
        {!!children && <Col lg={12}>{children}</Col>}
        <Col lg={6}>
          <Card>
            <h2>Results of statistical analysis</h2>

            <Alert variant="green">
              <p className="mb-0">
                <strong>Genotype P value</strong>
              </p>
              <p>{combinedPValue}</p>
              <p className="mb-0">
                <strong>Genotype*Female P value</strong>
              </p>
              <p>{femalePValue}</p>
              <p className="mb-0">
                <strong>Genotype*Male P value</strong>
              </p>
              <p>{malePValue}</p>
              <p className="mb-0">
                <strong>Classification</strong>
              </p>
              <p>{datasetSummary["classificationTag"]}</p>
            </Alert>
          </Card>
        </Col>
        <Col lg={6}>
          <Card>
            <h2>Summary statistics of all data in the dataset</h2>
            <SortableTable
              data-testid="summary-statistics-table"
              headers={[
                { width: 5, label: "", disabled: true },
                { width: 2, label: "Mean", disabled: true },
                { width: 2, label: "Stddev", disabled: true },
                { width: 3, label: "# Samples", disabled: true },
              ]}
            >
              {summaryStatistics.map((stats) => (
                <tr>
                  <td>{stats.label}</td>
                  <td>{stats.mean}</td>
                  <td>{stats.stddev}</td>
                  <td>{stats.count}</td>
                </tr>
              ))}
            </SortableTable>
          </Card>
        </Col>
        <Col lg={6}>
          <StatisticalMethodTable datasetSummary={datasetSummary} />
        </Col>
        <Col lg={6}>
          <Card>
            <h2>Windowing parameters</h2>
            <a
              className="link"
              href="https://www.mousephenotype.org/help/data-visualization/chart-pages/"
            >
              {" "}
              View documentation about soft windowing{" "}
              <FontAwesomeIcon icon={faChevronRight} />
            </a>
            <SortableTable
              headers={[
                { width: 8, label: "Parameter", disabled: true },
                { width: 4, label: "Value", disabled: true },
              ]}
            >
              <tr>
                <td>Sharpness (k) </td>
                <td>
                  {datasetSummary["softWindowing"]["shape"]
                    ? datasetSummary["softWindowing"]["shape"].toFixed(3)
                    : "N/A"}
                </td>
              </tr>
              <tr>
                <td>Bandwidth (l)</td>
                <td>{datasetSummary["softWindowing"]["bandwidth"]}</td>
              </tr>
            </SortableTable>
          </Card>
          <Card>
            <h2>Statistical analysis API access</h2>
            <p>
              <StatisticalAnalysisDownloadLink
                datasetSummary={datasetSummary}
                type="statistical-result"
              />
            </p>
            <p>
              <StatisticalAnalysisDownloadLink
                datasetSummary={datasetSummary}
                type="genotype-phenotype"
              />
            </p>
            <p>
              <StatisticalAnalysisDownloadLink
                datasetSummary={datasetSummary}
                type="phenstat-data"
                data={data ? data.originalData : null}
              />
            </p>
          </Card>
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

export default Unidimensional;
