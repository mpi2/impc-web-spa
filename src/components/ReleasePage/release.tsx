"use client";
import { Col, Container, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleQuestion,
  faExternalLink,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Suspense, useMemo, ReactNode, PropsWithChildren } from "react";
import Markdown from "react-markdown";
import { NumberCell, PlainTextCell, SmartTable } from "@/components/SmartTable";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Card, Search } from "@/components";
import { groupBy, uniq } from "lodash";
import { maybe } from "acd-utils";
import Link from "next/link";
import moment from "moment";
import remarkBreaks from "remark-breaks";
import {
  DataQualityCheck,
  ProdStatusByCenter,
  ReleaseMetadata,
  SampleCounts,
  StatusCount,
} from "@/models/release";
import { CallsTrendChart, DataPointsTrendChart } from "@/components";
import { SortType } from "@/models";
import styles from "./styles.module.scss";
import classNames from "classnames";

const listOfPastReleases = [
  "22.1",
  "22.0",
  "21.1",
  "21.0",
  "20.1",
  "20.0",
  "19.1",
  "19.0",
  "18.0",
  "17.0",
  "16.0",
  "15.1",
  "15.0",
  "14.0",
  "13.0",
  "12.0",
  "11.0",
  "10.1",
  "10.0",
  "9.2",
  "9.1",
  "8.0",
  "7.0",
  "6.1",
  "6.0",
  "5.0",
  "4.3",
  "4.2",
  "4.0",
  "3.4",
  "3.3",
  "3.2",
  "3.1",
  "3.0",
  "2.0",
  "1.1",
  "1.0",
];

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors
);

const ValueWrapper = (
  props: PropsWithChildren<{ additionalValue: boolean }>,
) => {
  return props.additionalValue ? (
    <div>{props.children}</div>
  ) : (
    <>{props.children}</>
  );
};

const valuePair = (
  key: string,
  value: string | number,
  enableJustify: boolean = false,
  additionalValueEl?: ReactNode,
) => {
  return (
    <div
      className={classNames({
        [styles.valuePairJustified]: enableJustify,
        [styles.withAdditionalElement]: !!additionalValueEl,
      })}
    >
      <span className="grey">{key}: </span>
      <ValueWrapper additionalValue={!!additionalValueEl}>
        {typeof value === "number" ? (
          <strong>{value.toLocaleString()}</strong>
        ) : (
          <strong>{value}</strong>
        )}
        {additionalValueEl}
      </ValueWrapper>
    </div>
  );
};

type Props = {
  releaseMetadata: ReleaseMetadata;
};

const phenotypingStatuses = [
  "phenotyping registered",
  "rederivation complete",
  "phenotyping started",
  "phenotyping all data sent",
  "phenotyping finished",
];

const genotypingStatuses = [
  "plan created",
  "plan abandoned",
  "mouse allele modification aborted",
  "mouse allele modification registered",
  "attempt in progress",
  "micro-injection in progress",
  "chimeras/founder obtained",
  "rederivation started",
  "rederivation complete",
  "cre excision started",
  "cre excision complete",
  "genotype in progress",
  "mouse allele modification genotype confirmed",
  "genotype confirmed",
  "phenotype attempt registered",
];

const ReleaseNotesPage = (props: Props) => {
  const { releaseMetadata } = props;

  const dataReleaseVersion = releaseMetadata.dataReleaseVersion;
  const summaryCounts = releaseMetadata.summaryCounts;

  const linesTableDefaultSort: SortType = useMemo(
    () => ["phenotypingCentre", "asc"],
    []
  );
  const experimentalDataDefaultSort: SortType = useMemo(
    () => ["count", "desc"],
    []
  );

  const unescapeReleaseNotes = (value: string) => {
    return value
      .replaceAll('"', "")
      .replaceAll("\\n", " \n")
      .replaceAll("\\t", "")
      .replaceAll("- ", "* ");
  };
  const formatDate = (date: string) => {
    const dateObj = moment(date, "DD-MM-YYYY").toDate();
    return dateObj.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const findZygosityCount = (zygosity, p) => {
    return p.counts.find((count) => count.zygosity === zygosity)?.count || 0;
  };
  const getProductionStatusByType = (
    statusArray,
    type: string
  ): Array<StatusCount> => {
    const counts = statusArray
      .find((s) => s.statusType === type)
      .counts.filter(
        (count) =>
          count.status !== null &&
          !count.status.includes("Aborted") &&
          !count.status.includes("Abandoned")
      );
    const mouseAlleleModificationCount =
      counts.find(
        (c) => c.status === "Mouse Allele Modification Genotype Confirmed"
      )?.count || 0;
    return counts
      .filter(
        (c) => c.status !== "Mouse Allele Modification Genotype Confirmed"
      )
      .map((s) => {
        return {
          ...s,
          count:
            s.status === "Genotype Confirmed"
              ? s.count + mouseAlleleModificationCount
              : s.count,
          status: s.status,
          originalStatus: s.status,
        };
      });
  };

  const getProcedureCount = (
    type: "Early adult" | "Late adult" | "Embryo",
    procedure
  ): number => {
    const embryoLifeStages = ["Embryo", "E18.5", "E9.5", "E15.5", "E12.5"];
    switch (type) {
      case "Early adult":
      case "Late adult":
        return procedure.counts.find((c) => c.lifeStage === type)?.count || 0;
      case "Embryo":
        return (
          procedure.counts.find((c) => embryoLifeStages.includes(c.lifeStage))
            ?.count || 0
        );
    }
  };

  const getSortedProcedures = () => {
    return releaseMetadata.phenotypeAssociationsByProcedure.sort(
      ({ procedure_name: p1 }, { procedure_name: p2 }) => {
        const embryoRegex = /E(\d+).5/;
        const p1IsEmbryoProd = p1.match(embryoRegex);
        const p2IsEmbryoProd = p2.match(embryoRegex);
        if (!p1IsEmbryoProd && !p2IsEmbryoProd) {
          return p1.localeCompare(p2);
        } else if (!!p1IsEmbryoProd && !p2IsEmbryoProd) {
          return -1;
        } else if (!p1IsEmbryoProd && !!p2IsEmbryoProd) {
          return 1;
        } else {
          const p1EmbryoStage = Number.parseInt(p1IsEmbryoProd[1], 10);
          const p2EmbryoStage = Number.parseInt(p2IsEmbryoProd[1], 10);
          return p1EmbryoStage - p2EmbryoStage;
        }
      }
    );
  };

  const generateProdByCenterData = (
    data: Array<ProdStatusByCenter>,
    type: string
  ) => {
    const dataByType = getProductionStatusByType(data, type);
    const statuses =
      type === "phenotyping" ? phenotypingStatuses : genotypingStatuses;
    const labels: Array<string> = uniq(
      dataByType
        .sort((a, b) => labelsByPhenotypeStatus(statuses, a, b))
        .map((s) => s.status)
    );
    const datasets = Object.values(groupBy(dataByType, "centre")).map(
      (centerData) => {
        return {
          label: centerData[0].centre,
          data: labels.map((label) => {
            return maybe(centerData.find((d) => d.status === label))
              .map((status) => status.count)
              .getOrElse(0);
          }),
        };
      }
    );
    return {
      labels,
      datasets,
    };
  };

  const phenotypeAssociationsOpts = {
    maintainAspectRatio: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: "Number of genotype-phenotype associations",
        },
      },
    },
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
    interaction: {
      mode: "index" as const,
    },
  };

  const labelsByPhenotypeStatus = (
    orderArray: Array<string>,
    a: { status: string; count: number },
    b: { status: string; count: number }
  ) => {
    return orderArray.indexOf(a.status.toLocaleLowerCase()) >
      orderArray.indexOf(b.status.toLocaleLowerCase())
      ? 1
      : -1;
  };
  const phenotypeAssociationsData = useMemo(
    () => ({
      labels: releaseMetadata.phenotypeAnnotations.map(
        (phenotype) => phenotype.topLevelPhenotype
      ),
      datasets: [
        {
          label: "Homozygote",
          data: releaseMetadata.phenotypeAnnotations.map(
            findZygosityCount.bind(null, "homozygote")
          ),
          backgroundColor: "rgb(119, 119, 119)",
        },
        {
          label: "Heterozygote",
          data: releaseMetadata.phenotypeAnnotations.map(
            findZygosityCount.bind(null, "heterozygote")
          ),
          backgroundColor: "rgb(9, 120, 161)",
        },
        {
          label: "Hemizygote",
          data: releaseMetadata.phenotypeAnnotations.map(
            findZygosityCount.bind(null, "hemizygote")
          ),
          backgroundColor: "rgb(239, 123, 11)",
        },
      ],
    }),
    [releaseMetadata.phenotypeAnnotations]
  );

  const overallProdStatusOptions = {
    scales: {
      y: { title: { display: true, text: "Number of genes" } },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  const prodByCenterStatusOptions = {
    scales: {
      x: { stacked: true },
      y: { stacked: true, title: { display: true, text: "Number of genes" } },
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  const esCellNullOverallProductionStatusChart = useMemo(
    () => ({
      labels: getProductionStatusByType(
        releaseMetadata.productionStatusOverall,
        "productionESCellNull"
      )
        .sort((a, b) => labelsByPhenotypeStatus(genotypingStatuses, a, b))
        .map((c) => c.status),
      datasets: [
        {
          label: "",
          data: getProductionStatusByType(
            releaseMetadata.productionStatusOverall,
            "productionESCellNull"
          )
            .sort((a, b) => labelsByPhenotypeStatus(genotypingStatuses, a, b))
            .map((c) => c.count),
          backgroundColor: "rgb(239, 123, 11)",
        },
      ],
    }),
    [releaseMetadata.productionStatusOverall]
  );

  const esCellConditionalOverallProductionStatusChart = useMemo(
    () => ({
      labels: getProductionStatusByType(
        releaseMetadata.productionStatusOverall,
        "productionESCellConditional"
      )
        .sort((a, b) => labelsByPhenotypeStatus(genotypingStatuses, a, b))
        .map((c) => c.status),
      datasets: [
        {
          label: "",
          data: getProductionStatusByType(
            releaseMetadata.productionStatusOverall,
            "productionESCellConditional"
          )
            .sort((a, b) => labelsByPhenotypeStatus(genotypingStatuses, a, b))
            .map((c) => c.count),
          backgroundColor: "rgb(239, 123, 11)",
        },
      ],
    }),
    [releaseMetadata.productionStatusOverall]
  );

  const crisprNullOverallProductionStatusChart = useMemo(
    () => ({
      labels: getProductionStatusByType(
        releaseMetadata.productionStatusOverall,
        "productionCrisprNull"
      )
        .sort((a, b) => labelsByPhenotypeStatus(genotypingStatuses, a, b))
        .map((c) => c.status),
      datasets: [
        {
          label: "",
          data: getProductionStatusByType(
            releaseMetadata.productionStatusOverall,
            "productionCrisprNull"
          )
            .sort((a, b) => labelsByPhenotypeStatus(genotypingStatuses, a, b))
            .map((c) => c.count),
          backgroundColor: "rgb(239, 123, 11)",
        },
      ],
    }),
    [releaseMetadata.productionStatusOverall]
  );

  const crisprConditionalOverallProductionStatusChart = useMemo(
    () => ({
      labels: getProductionStatusByType(
        releaseMetadata.productionStatusOverall,
        "productionCrisprConditional"
      )
        .sort((a, b) => labelsByPhenotypeStatus(genotypingStatuses, a, b))
        .map((c) => c.status),
      datasets: [
        {
          label: "",
          data: getProductionStatusByType(
            releaseMetadata.productionStatusOverall,
            "productionCrisprConditional"
          )
            .sort((a, b) => labelsByPhenotypeStatus(genotypingStatuses, a, b))
            .map((c) => c.count),
          backgroundColor: "rgb(239, 123, 11)",
        },
      ],
    }),
    [releaseMetadata.productionStatusOverall]
  );

  const phenotypingStatusChartData = useMemo(
    () => ({
      labels: getProductionStatusByType(
        releaseMetadata.productionStatusOverall,
        "phenotyping"
      )
        .sort((a, b) => labelsByPhenotypeStatus(phenotypingStatuses, a, b))
        .map((c) => c.status),
      datasets: [
        {
          label: "",
          data: getProductionStatusByType(
            releaseMetadata.productionStatusOverall,
            "phenotyping"
          )
            .sort((a, b) => labelsByPhenotypeStatus(phenotypingStatuses, a, b))
            .map((c) => c.count),
          backgroundColor: "rgb(239, 123, 11)",
        },
      ],
    }),
    [releaseMetadata.productionStatusOverall]
  );

  const esCellNullByCenterChartData = useMemo(
    () =>
      generateProdByCenterData(
        releaseMetadata.productionStatusByCenter,
        "productionESCellNull"
      ),
    [releaseMetadata.productionStatusByCenter]
  );

  const esCellConditionalByCenterChartData = useMemo(
    () =>
      generateProdByCenterData(
        releaseMetadata.productionStatusByCenter,
        "productionESCellConditional"
      ),
    [releaseMetadata.productionStatusByCenter]
  );

  const crisprNullByCenterChartData = useMemo(
    () =>
      generateProdByCenterData(
        releaseMetadata.productionStatusByCenter,
        "productionCrisprNull"
      ),
    [releaseMetadata.productionStatusByCenter]
  );

  const crisprConditionalByCenterChartData = useMemo(
    () =>
      generateProdByCenterData(
        releaseMetadata.productionStatusByCenter,
        "productionCrisprConditional"
      ),
    [releaseMetadata.productionStatusByCenter]
  );

  const phenotypingProdByCenterChartData = useMemo(
    () =>
      generateProdByCenterData(
        releaseMetadata.productionStatusByCenter,
        "phenotyping"
      ),
    [releaseMetadata.productionStatusByCenter]
  );

  const phenotypeCallsByProdOpts = {
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        title: { display: true, text: "Number of phenotype calls" },
      },
    },
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
    interaction: {
      mode: "index" as const,
    },
  };

  const phenotypeCallsByProdData = useMemo(
    () => ({
      labels: getSortedProcedures().map(
        (phenotype) => phenotype["procedure_name"]
      ),
      datasets: [
        {
          label: "Early Adult",
          data: getSortedProcedures().map(
            getProcedureCount.bind(null, "Early adult")
          ),
          backgroundColor: "rgb(119, 119, 119)",
        },
        {
          label: "Late Adult",
          data: getSortedProcedures().map(
            getProcedureCount.bind(null, "Late adult")
          ),
          backgroundColor: "rgb(9, 120, 161)",
        },
        {
          label: "Embryo",
          data: getSortedProcedures().map(
            getProcedureCount.bind(null, "Embryo")
          ),
          backgroundColor: "rgb(239, 123, 11)",
        },
      ],
    }),
    [releaseMetadata.phenotypeAssociationsByProcedure]
  );

  const excludedDatatypes = [
    "time_series",
    "image_record",
    "text",
    "ontological",
  ];

  const dataQualityChecks = useMemo(
    () =>
      releaseMetadata.dataQualityChecks.map(({ dataType, count }) => ({
        count,
        dataType: `${dataType.replace("_", " ")} ${
          excludedDatatypes.includes(dataType) ? "*" : ""
        }`,
      })),
    [releaseMetadata]
  );

  return (
    <>
      <Suspense>
        <Search />
      </Suspense>
      <Container style={{ maxWidth: 1240 }} className="page">
        <Card>
          <p
            className="small caps mb-2 primary"
            style={{ letterSpacing: "0.1rem" }}
          >
            RELEASE NOTES
          </p>
          <h1 className="h1 mb-2">
            IMPC Data Release {dataReleaseVersion} Notes
          </h1>
          <p className="grey mb-3">
            {formatDate(releaseMetadata.dataReleaseDate)}
          </p>

          <Row className="mb-4">
            <Col lg={6}>
              <h3 className="mb-0 mt-3 mb-2">Summary</h3>
              {valuePair(
                "Number of phenotyped genes",
                summaryCounts[dataReleaseVersion].phenotypedGenes,
                true
              )}
              {valuePair(
                "Number of phenotyped mutant lines",
                summaryCounts[dataReleaseVersion].phenotypedLines,
                true,
                <Link
                  href="https://www.mousephenotype.org/help/mouse-production/faqs/what-is-a-phenotyped-line/"
                  className="btn"
                  aria-label="What is a line?"
                  target="_blank"
                >
                  <FontAwesomeIcon icon={faCircleQuestion} size="xl" />
                </Link>,
              )}
              {valuePair(
                "Number of phenotype calls",
                summaryCounts[dataReleaseVersion].phentoypeCalls,
                true
              )}
            </Col>
            <Col lg={6}>
              <h3 className="mb-0 mt-3 mb-2">Data access</h3>
              <div className="mb-1">
                <a
                  href="https://www.mousephenotype.org/help/non-programmatic-data-access"
                  className="link orange-dark "
                >
                  FTP interface&nbsp;
                  <FontAwesomeIcon
                    icon={faExternalLink}
                    size="sm"
                    className="grey"
                  />
                </a>
              </div>
              <div>
                <a
                  href="https://www.mousephenotype.org/help/programmatic-data-access"
                  className="link orange-dark"
                >
                  RESTful interfaces&nbsp;
                  <FontAwesomeIcon
                    icon={faExternalLink}
                    size="sm"
                    className="grey"
                  />
                </a>
              </div>
            </Col>
          </Row>

          {valuePair(
            "Statistical package",
            `${releaseMetadata.statisticalAnalysisPackage.name} (${releaseMetadata.statisticalAnalysisPackage.version})`
          )}
          {valuePair(
            "Genome Assembly",
            `${releaseMetadata.genomeAssembly.species} (${releaseMetadata.genomeAssembly.version})`
          )}

          <h3 className="mb-0 mt-5 mb-2">Highlights</h3>
          <Markdown remarkPlugins={[remarkBreaks]}>
            {unescapeReleaseNotes(releaseMetadata.dataReleaseNotes)}
          </Markdown>
        </Card>
        <Card>
          <h2>
            Total number of lines and specimens in DR {dataReleaseVersion}
          </h2>
          <SmartTable<SampleCounts>
            data={releaseMetadata.sampleCounts}
            displayPaginationControls={false}
            defaultSort={linesTableDefaultSort}
            pagination={{
              totalItems: releaseMetadata.sampleCounts.length,
              onPageChange: () => {},
              onPageSizeChange: () => {},
              page: 0,
              pageSize: releaseMetadata.sampleCounts.length,
              sortInternally: true,
            }}
            columns={[
              {
                width: 1,
                label: "Phenotyping Center",
                field: "phenotypingCentre",
                cmp: <NumberCell />,
              },
              {
                width: 1,
                label: "Mutant Lines",
                field: "mutantLines",
                cmp: <NumberCell />,
              },
              {
                width: 1,
                label: "Baseline Mice",
                field: "controlSpecimens",
                cmp: <NumberCell />,
              },
              {
                width: 1,
                label: "Mutant Mice",
                field: "mutantSpecimens",
                cmp: <NumberCell />,
              },
            ]}
          />
        </Card>
        <Card>
          <h2>Experimental data and quality checks</h2>
          <SmartTable<DataQualityCheck>
            data={dataQualityChecks}
            defaultSort={experimentalDataDefaultSort}
            columns={[
              {
                width: 1,
                label: "Data Type",
                field: "dataType",
                cmp: <PlainTextCell />,
              },
              {
                width: 1,
                label: "QC Passed Data Points",
                field: "count",
                cmp: <NumberCell />,
              },
            ]}
          />
          <span className="small">* Excluded from statistical analysis.</span>
        </Card>
        <Card>
          <h2>Distribution of phenotype annotations</h2>
          <div style={{ position: "relative", height: "600px" }}>
            <Bar
              options={phenotypeAssociationsOpts}
              data={phenotypeAssociationsData}
            />
          </div>
        </Card>
        <Card>
          <h2>Production status</h2>
          <h3>Overall</h3>

          <Row className="mb-4">
            <Col lg={6}>
              <h4>ES Cell Null Lines</h4>
              <div style={{ position: "relative", height: "400px" }}>
                <Bar
                  options={overallProdStatusOptions}
                  data={esCellNullOverallProductionStatusChart}
                />
              </div>
            </Col>
            <Col lg={6}>
              <h4>ES Cell Conditional Lines</h4>
              <div style={{ position: "relative", height: "400px" }}>
                <Bar
                  options={overallProdStatusOptions}
                  data={esCellConditionalOverallProductionStatusChart}
                />
              </div>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col lg={6}>
              <h4>Crispr Null Lines</h4>
              <div style={{ position: "relative", height: "400px" }}>
                <Bar
                  options={overallProdStatusOptions}
                  data={crisprNullOverallProductionStatusChart}
                />
              </div>
            </Col>
            <Col lg={6}>
              <h4>Crispr Conditional Lines</h4>
              <div style={{ position: "relative", height: "400px" }}>
                <Bar
                  options={overallProdStatusOptions}
                  data={crisprConditionalOverallProductionStatusChart}
                />
              </div>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col>
              <h4>Phenotyping</h4>
              <div style={{ position: "relative", height: "400px" }}>
                <Bar
                  options={overallProdStatusOptions}
                  data={phenotypingStatusChartData}
                />
              </div>
            </Col>
          </Row>

          <h3>By Center</h3>

          <Row className="mb-4">
            <Col lg={6}>
              <h4>ES Cell Null Lines</h4>
              <div style={{ position: "relative", height: "400px" }}>
                <Bar
                  options={prodByCenterStatusOptions}
                  data={esCellNullByCenterChartData}
                />
              </div>
            </Col>
            <Col lg={6}>
              <h4>ES Cell Conditional Lines</h4>
              <div style={{ position: "relative", height: "400px" }}>
                <Bar
                  options={prodByCenterStatusOptions}
                  data={esCellConditionalByCenterChartData}
                />
              </div>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col lg={6}>
              <h4>Crispr Null Lines</h4>
              <div style={{ position: "relative", height: "400px" }}>
                <Bar
                  options={prodByCenterStatusOptions}
                  data={crisprNullByCenterChartData}
                />
              </div>
            </Col>
            <Col lg={6}>
              <h4>Crispr Conditional Lines</h4>
              <div style={{ position: "relative", height: "400px" }}>
                <Bar
                  options={prodByCenterStatusOptions}
                  data={crisprConditionalByCenterChartData}
                />
              </div>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col>
              <h4>Phenotyping</h4>
              <div style={{ position: "relative", height: "400px" }}>
                <Bar
                  options={prodByCenterStatusOptions}
                  data={phenotypingProdByCenterChartData}
                />
              </div>
            </Col>
          </Row>

          <p>
            More charts and status information are available from our mouse
            tracking service <a className="link orange-dark">GenTaR</a>.
          </p>
        </Card>
        <Card>
          <h2>Phenotype associations</h2>
          <div style={{ position: "relative", height: "600px" }}>
            <Bar
              options={phenotypeCallsByProdOpts}
              data={phenotypeCallsByProdData}
            />
          </div>
        </Card>
        <Card>
          <h2>Trends</h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <b>Genes/Mutant Lines/MP Calls</b>
            <span className="small grey">By Data Release</span>
          </div>
          <div style={{ position: "relative", height: "400px" }}>
            <CallsTrendChart data={releaseMetadata.summaryCounts} />
          </div>
          <div
            className="mt-4"
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <b>Data Points by Data Release</b>
          </div>
          <div style={{ position: "relative", height: "400px" }}>
            <DataPointsTrendChart data={releaseMetadata.dataPointCount} />
          </div>
        </Card>
        <Card>
          <h2>Previous releases</h2>
          <ul>
            {listOfPastReleases.map((releaseVersion) => (
              <li key={releaseVersion} style={{ marginBottom: "1rem" }}>
                <Link
                  className="link primary"
                  target="_blank"
                  href={
                    parseFloat(releaseVersion) <= 21.1
                      ? `https://previous-releases-reports.s3.eu-west-2.amazonaws.com/release-${releaseVersion}.pdf`
                      : `/release/${releaseVersion}`
                  }
                >
                  Release {releaseVersion} notes&nbsp;
                  <FontAwesomeIcon
                    icon={faExternalLinkAlt}
                    className="grey"
                    size="xs"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </Container>
    </>
  );
};

export default ReleaseNotesPage;
