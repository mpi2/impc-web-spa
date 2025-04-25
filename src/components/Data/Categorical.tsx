import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Col, Row } from "react-bootstrap";
import Card from "../../components/Card";
import SortableTable from "../SortableTable";
import CategoricalBarPlot from "./Plots/CategoricalBarPlot";
import { formatPValue, getDownloadData } from "@/utils";
import { capitalize, sortBy } from "lodash";
import ChartSummary from "./ChartSummary/ChartSummary";
import { GeneralChartProps } from "@/models";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import StatisticalAnalysisDownloadLink from "./StatisticalAnalysisDownloadLink";
import { DownloadData } from "..";
import { fetchDatasetFromS3 } from "@/api-service";
import { getZygosityLabel } from "@/components/Data/Utils";

const filterChartSeries = (zygosity: string, seriesArray: Array<any>) => {
  if (zygosity === "hemizygote") {
    return seriesArray.filter((c) => c.sex === "male");
  }
  const validExperimentalSeries = seriesArray.filter(
    (c) => c.sampleGroup === "experimental" && c.value > 0,
  );
  const validExperimentalSeriesSexes = validExperimentalSeries.map(
    (c) => c.sex,
  );
  const controlSeries = seriesArray.filter(
    (c) =>
      c.sampleGroup === "control" &&
      validExperimentalSeriesSexes.includes(c.sex),
  );
  return sortBy(
    [...controlSeries, ...validExperimentalSeries],
    "sex",
    "sampleGroup",
  );
};

const Categorical = ({
  datasetSummary,
  isVisible,
  children,
}: GeneralChartProps) => {
  const { data } = useQuery({
    queryKey: [
      "dataset",
      datasetSummary.parameterName,
      datasetSummary.datasetId,
    ],
    queryFn: () => fetchDatasetFromS3(datasetSummary["datasetId"]),
    select: (response) => {
      const series: Array<any> = [];
      const index = {};
      const categories = [];
      let allData = [];
      response.series.forEach((s) => {
        if (!index[s.specimenSex]) index[s.specimenSex] = {};
        if (!index[s.specimenSex][s.sampleGroup]) {
          index[s.specimenSex][s.sampleGroup] = { total: 0 };
        }
        s.observations.forEach((o) => {
          if (!index[s.specimenSex][s.sampleGroup][o.category]) {
            index[s.specimenSex][s.sampleGroup][o.category] = 0;
          }
          index[s.specimenSex][s.sampleGroup].total += 1;
          index[s.specimenSex][s.sampleGroup][o.category] += 1;
          if (!categories.includes(o.category)) categories.push(o.category);
        });
      });

      Object.keys(index).forEach((sex) =>
        Object.keys(index[sex]).forEach((sampleGroup) => {
          allData.push({
            sex,
            sampleGroup:
              sampleGroup == "experimental"
                ? datasetSummary["zygosity"]
                : sampleGroup,
            categoriesData: index[sex][sampleGroup],
          });
          categories.forEach((category) => {
            const count = index[sex][sampleGroup][category] || 0;
            const total = index[sex][sampleGroup].total;
            series.push({
              sex,
              sampleGroup,
              category,
              value: (count / total) * 100,
            });
          });
        }),
      );
      allData = sortBy(allData, ["sex", "sampleGroup"]);
      return {
        categories,
        series: filterChartSeries(datasetSummary.zygosity, series),
        originalData: response,
        dataBySex: allData,
      };
    },
    enabled: isVisible,
    placeholderData: { series: [] },
  });

  const combinedPValue =
    formatPValue(
      datasetSummary["statisticalMethod"]["attributes"][
        "genotypeEffectPValue"
      ] ?? datasetSummary.reportedPValue,
    ) || "N/A";
  const maleKoEffectPValue =
    formatPValue(
      datasetSummary["statisticalMethod"]["attributes"]["maleKoEffectPValue"],
    ) || "N/A";
  const femaleKoEffectPValue =
    formatPValue(
      datasetSummary["statisticalMethod"]["attributes"]["femaleKoEffectPValue"],
    ) || "N/A";

  return (
    <>
      <ChartSummary datasetSummary={datasetSummary} />
      <Row>
        <Col lg={8}>
          <Card>
            <CategoricalBarPlot
              series={data?.series}
              zygosity={datasetSummary["zygosity"]}
            />
          </Card>
        </Col>
        {!!children && <Col lg={12}>{children}</Col>}
        <Col lg={4}>
          <Card>
            <h2>Results of statistical analysis</h2>
            <Alert variant="green">
              <p className="mb-0">
                <strong>Combined Male and Female P value</strong>
              </p>
              <p>{combinedPValue}</p>
              <p className="mb-0">
                <strong>Males only</strong>
              </p>
              <p>{maleKoEffectPValue}</p>
              <p className="mb-0">
                <strong>Females only</strong>
              </p>
              <p> {femaleKoEffectPValue}</p>
              <p className="mb-0">
                <strong>Classification</strong>
              </p>
              <p>{datasetSummary["classificationTag"]}</p>
            </Alert>
          </Card>
        </Col>
        <Col lg={12}>
          <Card>
            <h2>Counts by sample type</h2>
            <SortableTable
              headers={[
                { width: 4, label: "Sample type / Category", disabled: true },
              ].concat(
                data.dataBySex
                  .map(
                    ({ sex, sampleGroup }) =>
                      `${capitalize(sex)} ${getZygosityLabel(
                        datasetSummary.zygosity,
                        sampleGroup,
                      )}`,
                  )
                  .map((c) => {
                    return { width: 2, label: c, disabled: true };
                  }),
              )}
            >
              {data.categories.map((category, index) => {
                return (
                  <tr key={`${category}_${index}`}>
                    <td>{category}</td>
                    {data.dataBySex.map(
                      ({ sex, sampleGroup, categoriesData }) => (
                        <td key={`${sampleGroup}_${sex}_${category}`}>
                          {categoriesData[category] || 0}
                        </td>
                      ),
                    )}
                  </tr>
                );
              })}
            </SortableTable>
          </Card>
        </Col>
        <Col lg={6}>
          <Card>
            <h2>Statistical method</h2>
            <p>{datasetSummary["statisticalMethod"]["name"]}</p>
            {datasetSummary.resourceName === "3i" && (
              <>
                <span>Supplied as data</span>
                <span>
                  <Link
                    className="link primary"
                    href="https://www.immunophenotype.org/threei/#/methods/statistical-design"
                    target="_blank"
                  >
                    Statistical design
                  </Link>
                  &nbsp;
                  <FontAwesomeIcon
                    icon={faExternalLinkAlt}
                    className="grey"
                    size="xs"
                  />
                </span>
              </>
            )}
            {datasetSummary.resourceName === "pwg" && (
              <>
                <span>Supplied as data</span>
                <span>
                  <Link
                    className="link primary"
                    href="https://www.mousephenotype.org/publications/data-supporting-impc-papers/pain/"
                    target="_blank"
                  >
                    Pain sensitivity publication
                  </Link>
                </span>
              </>
            )}
          </Card>
        </Col>
        <Col lg={6}>
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
        </Col>

        <Col>
          <Card>
            <h2>Experimental data download</h2>
            <p>
              {data && data.originalData && (
                <DownloadData
                  {...getDownloadData(datasetSummary, data.originalData)}
                />
              )}
            </p>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Categorical;
