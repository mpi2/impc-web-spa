import { Alert, Col, Row } from "react-bootstrap";
import Card from "../../components/Card";
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
import { sortBy } from "lodash";

const Viability = ({ datasetSummary, isVisible }: GeneralChartProps) => {
  const allele = formatAlleleSymbol(datasetSummary["alleleSymbol"]);

  const viabilityOneParametersMap = {
    both: {
      homozygote: "IMPC_VIA_006_001",
      heterozygote: "IMPC_VIA_005_001",
      wildtype: "IMPC_VIA_004_001",
      na: "IMPC_VIA_003_001",
    },
    male: {
      homozygote: "IMPC_VIA_009_001",
      heterozygote: "IMPC_VIA_008_001",
      wildtype: "IMPC_VIA_007_001",
      na: "IMPC_VIA_010_001",
    },
    female: {
      homozygote: "IMPC_VIA_013_001",
      heterozygote: "IMPC_VIA_012_001",
      wildtype: "IMPC_VIA_011_001",
      na: "IMPC_VIA_014_001",
    },
  };

  const viabilityTwoParametersMap = {
    both: {
      homozygote: "IMPC_VIA_060_001",
      heterozygote: "IMPC_VIA_059_001",
      wildtype: "IMPC_VIA_058_001",
      na: "IMPC_VIA_057_001",
    },
    male: {
      homozygote: "IMPC_VIA_053_001",
      heterozygote: "IMPC_VIA_052_001",
      wildtype: "IMPC_VIA_049_001",
      hemizygote: "IMPC_VIA_055_001",
      na: "IMPC_VIA_061_001",
    },
    female: {
      homozygote: "IMPC_VIA_054_001",
      heterozygote: "IMPC_VIA_052_001",
      wildtype: "IMPC_VIA_050_001",
      anzygote: "IMPC_VIA_056_001",
      na: "IMPC_VIA_062_001",
    },
  };

  const viabilityParameterMap =
    datasetSummary.procedureStableId === "IMPC_VIA_002"
      ? viabilityTwoParametersMap
      : viabilityOneParametersMap;

  const { data, isLoading, error, isError } = useQuery({
    queryKey: [
      "dataset",
      datasetSummary.parameterName,
      datasetSummary.datasetId,
    ],
    queryFn: () => fetchDatasetFromS3(datasetSummary["datasetId"]),
    enabled: isVisible,
  });

  if (isError)
    return (
      <Card>
        <Alert>
          This phenotype call was made by our Phenotyiping Center experts,
          currently we don't have any supporting data for this call.
        </Alert>
      </Card>
    );

  const totalCountData = sortBy(
    [
      {
        label: "Total WTs",
        value: data?.series.find(
          (d) => d.parameterStableId == viabilityParameterMap.both.wildtype,
        )?.dataPoint,
      },
      {
        label: "Total Homozygotes",
        value: data?.series.find(
          (d) => d.parameterStableId == viabilityParameterMap.both.homozygote,
        )?.dataPoint,
      },
      {
        label: "Total Heterozygotes",
        value: data?.series.find(
          (d) => d.parameterStableId == viabilityParameterMap.both.heterozygote,
        )?.dataPoint,
      },
    ].filter((d) => d.value != 0),
    ["label"],
  );

  const maleCountData = sortBy(
    [
      {
        label: "Total Male WT",
        value: data?.series.find(
          (d) => d.parameterStableId == viabilityParameterMap.male.wildtype,
        )?.dataPoint,
      },
      {
        label: "Total Male Heterozygous",
        value: data?.series.find(
          (d) => d.parameterStableId == viabilityParameterMap.male.heterozygote,
        )?.dataPoint,
      },
      {
        label: "Total Male Homozygous",
        value: data?.series.find(
          (d) => d.parameterStableId == viabilityParameterMap.male.homozygote,
        )?.dataPoint,
      },
    ].filter((d) => d.value != 0),
    ["label"],
  );

  const femaleCountData = sortBy(
    [
      {
        label: "Total Female WT",
        value: data?.series.find(
          (d) => d.parameterStableId == viabilityParameterMap.female.wildtype,
        )?.dataPoint,
      },
      {
        label: "Total Female Heterozygous",
        value: data?.series.find(
          (d) =>
            d.parameterStableId == viabilityParameterMap.female.heterozygote,
        )?.dataPoint,
      },
      {
        label: "Total Female Homozygous",
        value: data?.series.find(
          (d) => d.parameterStableId == viabilityParameterMap.female.homozygote,
        )?.dataPoint,
      },
    ].filter((d) => d.value != 0),
    ["label"],
  );

  return (
    <>
      <ChartSummary
        title={
          <>
            <i>{datasetSummary["geneSymbol"]}</i>{" "}
            {datasetSummary["parameterName"]} data
          </>
        }
        datasetSummary={datasetSummary}
        displayPValueStatement={false}
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
          a mutant strain carrying the&nbsp;
          <i>
            {allele[0]}
            <sup>{allele[1]}</sup>
          </i>
          &nbsp;allele. The charts below show the proportion of wild type,
          heterozygous, and homozygous offspring.
        </p>
      </ChartSummary>
      <Row>
        <Col lg={4}>
          <Card>
            <h2 className="primary">Total counts (male and female)</h2>
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
        <Col lg={4}>
          <Card>
            <h2 className="primary">Male counts</h2>
            <div className={styles.chartWrapper}>
              <PieChart
                data={maleCountData}
                chartColors={[
                  wildtypeChartColors.halfOpacity,
                  mutantChartColors.halfOpacity,
                  "rgba(119,119,119, 0.5)",
                ]}
              />
            </div>
          </Card>
        </Col>
        <Col lg={4}>
          <Card>
            <h2 className="primary">Female counts</h2>
            <div className={styles.chartWrapper}>
              <PieChart
                data={femaleCountData}
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
                { width: 6, label: "Sex", disabled: true },
                { width: 1, label: "WT", disabled: true },
                { width: 1, label: "Het", disabled: true },
                { width: 1, label: "Hom", disabled: true },
                { width: 1.2, label: "Hemi ¹", disabled: true },
                { width: 1, label: "Total", disabled: true },
              ]}
            >
              <tr>
                <td>Male and female</td>
                <td>
                  {
                    data?.series.find(
                      (d) =>
                        d.parameterStableId ==
                        viabilityParameterMap.both.wildtype,
                    )?.dataPoint
                  }
                </td>
                <td>
                  {
                    data?.series.find(
                      (d) =>
                        d.parameterStableId ==
                        viabilityParameterMap.both.heterozygote,
                    )?.dataPoint
                  }
                </td>
                <td>
                  {" "}
                  {
                    data?.series.find(
                      (d) =>
                        d.parameterStableId ==
                        viabilityParameterMap.both.homozygote,
                    )?.dataPoint
                  }
                </td>
                <td></td>
                <td>
                  {
                    data?.series.find(
                      (d) =>
                        d.parameterStableId == viabilityParameterMap.both.na,
                    )?.dataPoint
                  }
                </td>
              </tr>
              <tr>
                <td>Male</td>
                <td>
                  {
                    data?.series.find(
                      (d) =>
                        d.parameterStableId ==
                        viabilityParameterMap.male.wildtype,
                    )?.dataPoint
                  }
                </td>
                <td>
                  {
                    data?.series.find(
                      (d) =>
                        d.parameterStableId ==
                        viabilityParameterMap.male.heterozygote,
                    )?.dataPoint
                  }
                </td>
                <td>
                  {
                    data?.series.find(
                      (d) =>
                        d.parameterStableId ==
                        viabilityParameterMap.male.homozygote,
                    )?.dataPoint
                  }
                </td>
                <td></td>
                <td>
                  {
                    data?.series.find(
                      (d) =>
                        d.parameterStableId == viabilityParameterMap.male.na,
                    )?.dataPoint
                  }
                </td>
              </tr>
              <tr>
                <td>Female</td>
                <td>
                  {
                    data?.series.find(
                      (d) =>
                        d.parameterStableId ==
                        viabilityParameterMap.female.wildtype,
                    )?.dataPoint
                  }
                </td>
                <td>
                  {
                    data?.series.find(
                      (d) =>
                        d.parameterStableId ==
                        viabilityParameterMap.female.heterozygote,
                    )?.dataPoint
                  }
                </td>
                <td>
                  {
                    data?.series.find(
                      (d) =>
                        d.parameterStableId ==
                        viabilityParameterMap.female.homozygote,
                    )?.dataPoint
                  }
                </td>
                <td>N/A</td>
                <td>
                  {
                    data?.series.find(
                      (d) =>
                        d.parameterStableId == viabilityParameterMap.female.na,
                    )?.dataPoint
                  }
                </td>
              </tr>
            </SortableTable>
            {datasetSummary?.procedureStableId === "IMPC_VIA_001" && (
              <div style={{ fontSize: "85%", flex: "1 0 100%" }}>
                <span>
                  ¹ This Viability procedure (IMPC_VIA_001) does not allow
                  reporting of hemizyous males specifically. This is addressed
                  in the second version (IMPC_VIA_002). Hemizygous males are
                  either reported as homozygous males or the numbers can be
                  derived from the total.
                </span>
              </div>
            )}
          </Card>
        </Col>
        <Col lg={6}>
          <Card>
            <h2>Statistical analysis API access</h2>
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

export default Viability;
