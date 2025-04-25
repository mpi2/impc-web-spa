import { Alert, Col, Row } from "react-bootstrap";
import SortableTable from "../SortableTable";
import { formatAlleleSymbol } from "@/utils";
import PieChart from "../PieChart";
import styles from "./styles.module.scss";
import { useQuery } from "@tanstack/react-query";
import ChartSummary from "./ChartSummary/ChartSummary";
import { mutantChartColors, wildtypeChartColors } from "@/utils/chart";
import { GeneralChartProps } from "@/models";
import StatisticalAnalysisDownloadLink from "./StatisticalAnalysisDownloadLink";
import { fetchDatasetFromS3 } from "@/api-service";
import { Card } from "@/components";

const EmbryoViability = ({ datasetSummary, isVisible }: GeneralChartProps) => {
  const allele = formatAlleleSymbol(datasetSummary["alleleSymbol"]);

  const embryoViavilityParametersMap = {
    IMPC_EVL_001: {
      wildtype: {
        dead: "IMPC_EVL_011_001",
        total: "IMPC_EVL_007_001",
        defect: "IMPC_EVL_015_001",
        live: "IMPC_EVL_026_001",
      },
      homozygote: {
        dead: "IMPC_EVL_013_001",
        total: "IMPC_EVL_009_001",
        defect: "IMPC_EVL_017_001",
        live: "IMPC_EVL_027_001",
      },
      heterozygote: {
        dead: "IMPC_EVL_012_001",
        total: "IMPC_EVL_008_001",
        defect: "IMPC_EVL_016_001",
        live: "IMPC_EVL_025_001",
      },
      na: {
        dead: "IMPC_EVL_010_001",
        total: "IMPC_EVL_002_001",
        defect: "IMPC_EVL_014_001",
        live: "IMPC_EVL_024_001",
      },
      reabsorptions: "IMPC_EVL_018_001",
      litterSize: "IMPC_EVL_021_001",
    },
    IMPC_EVM_001: {
      wildtype: {
        dead: "IMPC_EVM_008_001",
        total: "IMPC_EVM_004_001",
        defect: "IMPC_EVM_012_001",
        live: "IMPC_EVM_026_001",
      },
      homozygote: {
        dead: "IMPC_EVM_010_001",
        total: "IMPC_EVM_006_001",
        defect: "IMPC_EVM_014_001",
        live: "IMPC_EVM_027_001",
      },
      heterozygote: {
        dead: "IMPC_EVM_009_001",
        total: "IMPC_EVM_005_001",
        defect: "IMPC_EVM_013_001",
        live: "IMPC_EVM_025_001",
      },
      na: {
        dead: "IMPC_EVM_007_001",
        total: "IMPC_EVM_023_001",
        defect: "IMPC_EVM_011_001",
        live: "IMPC_EVM_024_001",
      },
      reabsorptions: "IMPC_EVM_015_001",
      litterSize: "IMPC_EVM_019_001",
    },
    IMPC_EVO_001: {
      wildtype: {
        dead: "IMPC_EVO_009_001",
        total: "IMPC_EVO_005_001",
        defect: "IMPC_EVO_013_001",
        live: "IMPC_EVO_026_001",
      },
      homozygote: {
        dead: "IMPC_EVO_011_001",
        total: "IMPC_EVO_007_001",
        defect: "IMPC_EVO_015_001",
        live: "IMPC_EVO_027_001",
      },
      heterozygote: {
        dead: "IMPC_EVO_010_001",
        total: "IMPC_EVO_006_001",
        defect: "IMPC_EVO_014_001",
        live: "IMPC_EVO_025_001",
      },
      na: {
        dead: "IMPC_EVO_008_001",
        total: "IMPC_EVO_004_001",
        defect: "IMPC_EVO_012_001",
        live: "IMPC_EVO_024_001",
      },
      reabsorptions: "IMPC_EVO_016_001",
      litterSize: "IMPC_EVO_017_001",
    },
    IMPC_EVP_001: {
      wildtype: {
        dead: "IMPC_EVP_008_001",
        total: "IMPC_EVP_023_001",
        defect: "IMPC_EVP_012_001",
        live: "IMPC_EVP_026_001",
      },
      homozygote: {
        dead: "IMPC_EVP_010_001",
        total: "IMPC_EVP_006_001",
        defect: "IMPC_EVP_014_001",
        live: "IMPC_EVP_027_001",
      },
      heterozygote: {
        dead: "IMPC_EVP_009_001",
        total: "IMPC_EVP_005_001",
        defect: "IMPC_EVP_013_001",
        live: "IMPC_EVP_025_001",
      },
      na: {
        dead: "IMPC_EVP_007_001",
        total: "IMPC_EVP_004_001",
        defect: "IMPC_EVP_011_001",
        live: "IMPC_EVP_024_001",
      },
      reabsorptions: "IMPC_EVP_015_001",
      litterSize: "IMPC_EVP_016_001",
    },
  };

  const viabilityParameterMap =
    embryoViavilityParametersMap[datasetSummary["procedureStableId"]];

  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["dataset", datasetSummary["datasetId"]],
    queryFn: () => fetchDatasetFromS3(datasetSummary["datasetId"]),
    enabled: isVisible,
  });

  if (isLoading) return <Card>Loading...</Card>;

  if (isError)
    return (
      <Card>
        <Alert>
          This phenotype call was made by our Phenotyiping Center experts,
          currently we don't have any supporting data for this call.
        </Alert>
      </Card>
    );

  const totalCountData = [
    {
      label: "Total Embryos WTs",
      value: data.series.find(
        (d) => d.parameterStableId == viabilityParameterMap?.wildtype.total,
      )?.dataPoint,
    },
    {
      label: "Total Embryos Homozygotes",
      value: data.series.find(
        (d) => d.parameterStableId == viabilityParameterMap?.homozygote.total,
      )?.dataPoint,
    },
    {
      label: "Total Embryos Heterozygotes",
      value: data.series.find(
        (d) => d.parameterStableId == viabilityParameterMap?.heterozygote.total,
      )?.dataPoint,
    },
  ].filter((d) => d.value != 0);

  return (
    <>
      <ChartSummary
        title={`${datasetSummary["geneSymbol"]} ${datasetSummary["parameterName"]} data`}
        datasetSummary={datasetSummary}
        additionalContent={
          <Alert variant="primary">
            <p>Please note:</p>
            <ul>
              <li>
                data for different colonies will be presented separately (e.g.
                different alleles; same allele but different background strain;
                same allele but in different phenotyping centers)
              </li>
              <li>
                phenotype calls are made when a statistically significant
                abnormal phenotype is detected (that is, preweaning lethality or
                absence of expected number of homozygote pups based on Mendelian
                ratios)
              </li>
            </ul>
          </Alert>
        }
      >
        <p>
          A {datasetSummary["procedureName"]} phenotypic assay was performed on
          a mutant strain carrying the {allele[0]}
          <sup>{allele[1]}</sup> allele. The charts below show the proportion of
          wild type, heterozygous, and homozygous offspring.
        </p>
      </ChartSummary>
      <Row>
        <Col lg={6}>
          <Card>
            <h2 className="primary">Total counts (dead and live)</h2>
            <div className={styles.chartWrapper}>
              <PieChart
                data={totalCountData}
                chartColors={[
                  wildtypeChartColors.halfOpacity,
                  mutantChartColors.halfOpacity,
                  "rgba(119,119,119, 0.5)",
                ]}
              />
            </div>
          </Card>
        </Col>
        <Col lg={6}>
          <Card>
            <SortableTable
              headers={[
                { width: 6, label: "", disabled: true },
                { width: 1, label: "WT", disabled: true },
                { width: 1, label: "Het", disabled: true },
                { width: 1, label: "Hom", disabled: true },
                { width: 1, label: "Total", disabled: true },
              ]}
            >
              <tr>
                <td>Total</td>
                <td>
                  {
                    data.series.find(
                      (d) =>
                        d.parameterStableId ==
                        viabilityParameterMap?.wildtype.total,
                    )?.dataPoint
                  }
                </td>
                <td>
                  {
                    data.series.find(
                      (d) =>
                        d.parameterStableId ==
                        viabilityParameterMap?.heterozygote.total,
                    )?.dataPoint
                  }
                </td>
                <td>
                  {" "}
                  {
                    data.series.find(
                      (d) =>
                        d.parameterStableId ==
                        viabilityParameterMap?.homozygote.total,
                    )?.dataPoint
                  }
                </td>
                <td>
                  {" "}
                  {
                    data.series.find(
                      (d) =>
                        d.parameterStableId == viabilityParameterMap?.na.total,
                    )?.dataPoint
                  }
                </td>
              </tr>
              <tr>
                <td>Dead</td>
                <td>
                  {
                    data.series.find(
                      (d) =>
                        d.parameterStableId ==
                        viabilityParameterMap?.wildtype.dead,
                    )?.dataPoint
                  }
                </td>
                <td>
                  {
                    data.series.find(
                      (d) =>
                        d.parameterStableId ==
                        viabilityParameterMap?.heterozygote.dead,
                    )?.dataPoint
                  }
                </td>
                <td>
                  {
                    data.series.find(
                      (d) =>
                        d.parameterStableId ==
                        viabilityParameterMap?.homozygote.dead,
                    )?.dataPoint
                  }
                </td>
                <td>
                  {
                    data.series.find(
                      (d) =>
                        d.parameterStableId == viabilityParameterMap?.na.dead,
                    )?.dataPoint
                  }
                </td>
              </tr>
              <tr>
                <td>Gross defects at dissection (alive or dead)</td>
                <td>
                  {
                    data.series.find(
                      (d) =>
                        d.parameterStableId ==
                        viabilityParameterMap?.wildtype.defect,
                    )?.dataPoint
                  }
                </td>
                <td>
                  {
                    data.series.find(
                      (d) =>
                        d.parameterStableId ==
                        viabilityParameterMap?.heterozygote.defect,
                    )?.dataPoint
                  }
                </td>
                <td>
                  {
                    data.series.find(
                      (d) =>
                        d.parameterStableId ==
                        viabilityParameterMap?.homozygote.defect,
                    )?.dataPoint
                  }
                </td>
                <td>
                  {
                    data.series.find(
                      (d) =>
                        d.parameterStableId == viabilityParameterMap?.na.defect,
                    )?.dataPoint
                  }
                </td>
              </tr>
            </SortableTable>
            <div>
              <p>
                Number of Reabsorptions:{" "}
                {
                  data.series.find(
                    (d) =>
                      d.parameterStableId ==
                      viabilityParameterMap?.reabsorptions,
                  )?.dataPoint
                }
              </p>
              <p>
                Average litter size:{" "}
                {data.series.find(
                  (d) =>
                    d.parameterStableId == viabilityParameterMap?.litterSize,
                )?.dataPoint || "Not supplied"}
              </p>
            </div>
          </Card>
        </Col>
        <Col>
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
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default EmbryoViability;
