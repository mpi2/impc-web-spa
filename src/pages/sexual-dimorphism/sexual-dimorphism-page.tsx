"use client";

import { Breadcrumb, Col, Container, Row } from "react-bootstrap";
import data from "../../mocks/data/landing-pages/sexual-dimorphism.json";
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  TimeScale,
} from "chart.js";
import {
  BoxPlotController,
  BoxAndWiskers,
} from "@sgratzl/chartjs-chart-boxplot";
import { Chart } from "react-chartjs-2";
import {
  faArrowUpLong,
  faArrowDownLong,
  faMars,
  faVenus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import {
  AlleleSymbol,
  Card,
  PieChart,
  PublicationDataAlert,
  Search,
} from "@/components";
import { Suspense } from "react";
import displayTooltipLabelMultiline from "@/shared/chart-js-plugins/boxplot-tooltip-label-multiline";

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Legend,
  Tooltip,
  BoxPlotController,
  BoxAndWiskers,
  CategoryScale,
);

const GeneLink = ({ gene }) => {
  return (
    <Link className="primary link" href={`/genes/${gene.mgiGeneAccessionId}`}>
      <AlleleSymbol symbol={gene.alleleSymbol} withLabel={false} />
    </Link>
  );
};

const SexualDimorphismLandingPage = () => {
  const getBackgroundColor = (label: string) => {
    return label.includes("WT")
      ? "rgba(212, 17, 89, 0.2)"
      : "rgba(26, 133, 255, 0.2)";
  };

  const getBorderColor = (label: string) => {
    return label.includes("WT")
      ? "rgba(212, 17, 89, 0.7)"
      : "rgba(26, 133, 255, 0.5)";
  };
  const prepareData = (rawData) => {
    return {
      labels: rawData.map((d) => d.label),
      datasets: [
        {
          type: "boxplot" as const,
          borderWidth: 2,
          itemRadius: 0,
          padding: 100,
          data: rawData.map((d) => d.values),
          backgroundColor: (d) => getBackgroundColor(rawData[d.index].label),
          borderColor: (d) => getBorderColor(rawData[d.index].label),
        },
      ],
    };
  };

  return (
    <>
      <Suspense>
        <Search />
      </Suspense>
      <Container className="page" style={{ lineHeight: 2 }}>
        <Card>
          <div className="subheading">
            <Breadcrumb>
              <Breadcrumb.Item active>Home</Breadcrumb.Item>
              <Breadcrumb.Item active>IMPC data collections</Breadcrumb.Item>
              <Breadcrumb.Item active>Sexual Dimorphism Data</Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <h1 className="mb-4 mt-2">
            <strong>IMPC Sexual Dimorphism Data</strong>
          </h1>
          <PublicationDataAlert dataReleaseVersion="4.2">
            <p>This publication page originally used the Data Release 4.2</p>
          </PublicationDataAlert>
          <Container>
            <Row>
              <Col xs={12}>
                <p>
                  IMPC data demonstrates the effect of sex on many phenotypes,
                  supporting the importance of including males and females in
                  biomedical research.
                </p>
                <ul>
                  <li>
                    Press releases:{" "}
                    <a
                      className="primary link"
                      href="http://www.bbc.co.uk/programmes/b08vwn6w"
                    >
                      BBC Radio 4 - "inside Science"
                    </a>
                    &nbsp;|&nbsp;
                    <a
                      className="primary link"
                      href="https://www.newscientist.com/article/2138671-research-on-male-animals-prevents-women-from-getting-best-drugs/"
                    >
                      New Scientist
                    </a>
                    &nbsp;|&nbsp;
                    <a
                      className="primary link"
                      href="http://www.dailymail.co.uk/wires/reuters/article-4640316/Sexual-equality-medical-research-long-overdue-study-finds.html"
                    >
                      Daily Mail
                    </a>
                    &nbsp;|&nbsp;
                    <a
                      className="primary link"
                      href="https://www.sciencedaily.com/releases/2017/06/170626124505.htm"
                    >
                      Science Daily
                    </a>
                    &nbsp;|&nbsp;
                    <a
                      className="primary link"
                      href="http://fortune.com/2017/06/26/sexual-bias-medical-research/"
                    >
                      Fortune
                    </a>
                    &nbsp;|&nbsp;
                    <a
                      className="primary link"
                      href="//www.mousephenotype.org/news/study-of-unprecedented-size-reveals-how-sex-blindspot-could-misdirect-medical-research/"
                    >
                      IMPC
                    </a>
                    &nbsp;|&nbsp;
                    <a
                      className="primary link"
                      href="http://www.ebi.ac.uk/about/news/press-releases/sexual-dimorphism-dilemma"
                    >
                      EMBL-EBI
                    </a>
                    &nbsp;|&nbsp;
                    <a
                      className="primary link"
                      href="http://www.sanger.ac.uk/news/view/study-reveals-how-sex-blindspot-could-misdirect-medical-research"
                    >
                      Sanger
                    </a>
                  </li>
                  <li>
                    <a
                      className="primary link"
                      href="https://zenodo.org/record/260398#.WVIkChPys-c"
                    >
                      Supporting material to enable replicable analysis
                    </a>
                  </li>
                  <li>
                    <a
                      className="primary link"
                      href="https://www.nature.com/articles/ncomms15475"
                    >
                      Publication: Nature Communications 26 June 2017
                    </a>
                  </li>
                </ul>
              </Col>
            </Row>
          </Container>
        </Card>
        <Card>
          <h1>
            <strong>Sexual dimorphism in 14,250 wildtype mice</strong>
          </h1>
          <Row>
            <Col xs={6}>
              <div
                style={{ position: "relative", width: "100%", height: "300px" }}
              >
                {data && (
                  <PieChart
                    title="Categorical"
                    data={data.wildtypeCategorical}
                  />
                )}
              </div>
            </Col>
            <Col xs={6}>
              <div
                style={{ position: "relative", width: "100%", height: "300px" }}
              >
                {data && (
                  <PieChart title="Continuous" data={data.wildtypeContinuous} />
                )}
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <p>
                The impact of sex on phenotypes of wild-type C57BL/6N mice
                measured using the IMPC adult phenotype pipeline at ten global
                research centers.
              </p>
              <p>Sex effect (5% FDR) was detected in:</p>
              <ul>
                <li>
                  9.9% categorical phenotypes (545 examined, e.g. abnormal
                  corneal opacity)
                </li>
                <li>
                  56.6% continuous phenotypes (903 examined, e.g. blood glucose
                  levels)
                </li>
              </ul>
            </Col>
          </Row>
        </Card>
        <Card>
          <h1>
            <strong>Sexual dimorphism in 2,186 knockout mouse strains</strong>
          </h1>
          <Row>
            <Col xs={6}>
              <div
                style={{ position: "relative", width: "100%", height: "300px" }}
              >
                {data && (
                  <PieChart
                    title="Categorical"
                    data={data.knockoutCategorical}
                  />
                )}
              </div>
            </Col>
            <Col xs={6}>
              <div
                style={{ position: "relative", width: "100%", height: "300px" }}
              >
                {data && (
                  <PieChart title="Continuous" data={data.knockoutContinuous} />
                )}
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <p>
                The impact of sex on phenotypes of knockout C57BL/6N mouse lines
                measured using the IMPC adult phenotype pipeline at ten global
                research centers. Only strains with an abnormal phenotype
                attributable to the knockout allele (i.e genotype effect) were
                included.
              </p>
              <p>Sex modified the genotype effect on mutant phenotypes in:</p>
              <ul>
                <li>13.3% categorical phenotypes (1,220 examined; 20% FDR)</li>
                <li>17.7% continuous phenotypes (7,929 examined; 5% FDR)</li>
              </ul>
            </Col>
          </Row>
        </Card>
        <Card>
          <h1>
            <strong>Approach</strong>
          </h1>
          <p>
            In 2017, the IMPC analysed phenotype data collected over a 5 year
            period from 14,250 wildtype and 40,192 mutant mice representing
            2,186 knockout lines.
          </p>
          <ul>
            <li>
              Weight was included as a covariate in the continuous data set
              analyses, as body size is dimorphic between male and female mice
              and many continuous traits correlate with body weight.
            </li>
            <li>
              For wild-type mice, males and females within a center were
              compared.
            </li>
            <li>
              For the mutant mice, lines were selected (1) if there was an
              abnormal phenotype associated with the knockout allele (2) if
              significant, whether sex influenced the phenotype.
            </li>
          </ul>
          <p>
            The wild-type analysis is from the original manuscript. The mutant
            line analysis is updated with each IMPC data release.
          </p>
        </Card>
        <Card>
          <h1>
            <strong>Vignettes</strong>
          </h1>
          <Row>
            <Col>
              <div style={{ textAlign: "center" }}>
                <h3>HDL Cholesterol</h3>
                <span>
                  <FontAwesomeIcon icon={faArrowUpLong} /> in{" "}
                  <FontAwesomeIcon icon={faMars} />, no effect in{" "}
                  <FontAwesomeIcon icon={faVenus} />
                </span>
              </div>
              <div
                style={{ position: "relative", width: "100%", height: "300px" }}
              >
                <Chart
                  type="boxplot"
                  data={prepareData(data.hdlCholesterol.values)}
                  options={{
                    maintainAspectRatio: false,
                    aspectRatio: 2,
                    scales: {
                      y: {
                        type: "linear",
                        beginAtZero: false,
                        ticks: {
                          align: "center",
                          crossAlign: "center",
                        },
                        title: {
                          display: true,
                          text: "mg/dl",
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        display: false,
                        position: "bottom",
                        labels: {
                          usePointStyle: false,
                          padding: 0,
                        },
                      },
                      tooltip: {
                        callbacks: {
                          label: displayTooltipLabelMultiline,
                        },
                      },
                    },
                  }}
                />
              </div>
              <div className="mt-3" style={{ textAlign: "center" }}>
                <GeneLink gene={data.hdlCholesterol.gene} />
              </div>
            </Col>
            <Col>
              <div style={{ textAlign: "center" }}>
                <h3>Bone Mineral Density</h3>
                <span>
                  <FontAwesomeIcon icon={faArrowDownLong} /> in{" "}
                  <FontAwesomeIcon icon={faMars} />, no effect in{" "}
                  <FontAwesomeIcon icon={faVenus} />
                </span>
              </div>
              <div
                style={{ position: "relative", width: "100%", height: "300px" }}
              >
                <Chart
                  type="boxplot"
                  data={prepareData(data.boneMineralDensity.values)}
                  options={{
                    maintainAspectRatio: false,
                    aspectRatio: 2,
                    scales: {
                      y: {
                        type: "linear",
                        // max: max,
                        // min: min,
                        beginAtZero: false,
                        ticks: {
                          align: "center",
                          crossAlign: "center",
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        display: false,
                        position: "bottom",
                        labels: {
                          usePointStyle: false,
                          padding: 0,
                        },
                      },
                      tooltip: {
                        callbacks: {
                          label: displayTooltipLabelMultiline,
                        },
                      },
                    },
                  }}
                />
              </div>
              <div className="mt-3" style={{ textAlign: "center" }}>
                <GeneLink gene={data.boneMineralDensity.gene} />
              </div>
            </Col>
            <Col>
              <div style={{ textAlign: "center" }}>
                <h3>Fructosamine</h3>
                <span>
                  <FontAwesomeIcon icon={faArrowDownLong} /> in{" "}
                  <FontAwesomeIcon icon={faMars} />
                  ,&nbsp;
                  <FontAwesomeIcon icon={faArrowUpLong} /> in{" "}
                  <FontAwesomeIcon icon={faVenus} />
                </span>
              </div>
              <div
                style={{ position: "relative", width: "100%", height: "300px" }}
              >
                <Chart
                  type="boxplot"
                  data={prepareData(data.fructose.values)}
                  options={{
                    maintainAspectRatio: false,
                    aspectRatio: 2,
                    scales: {
                      y: {
                        type: "linear",
                        // max: max,
                        // min: min,
                        beginAtZero: false,
                        ticks: {
                          align: "center",
                          crossAlign: "center",
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        display: false,
                        position: "bottom",
                        labels: {
                          usePointStyle: false,
                          padding: 0,
                        },
                      },
                      tooltip: {
                        callbacks: {
                          label: displayTooltipLabelMultiline,
                        },
                      },
                    },
                  }}
                />
              </div>
              <div className="mt-3" style={{ textAlign: "center" }}>
                <GeneLink gene={data.fructose.gene} />
              </div>
            </Col>
          </Row>
        </Card>
      </Container>
    </>
  );
};

export default SexualDimorphismLandingPage;
