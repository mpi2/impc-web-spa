"use client";

import { Breadcrumb, Col, Container, Row } from "react-bootstrap";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import data from "../../mocks/data/landing-pages/conservation.json";
import { chartColors } from "@/utils/chart";
import { Card, PublicationDataAlert, Search } from "@/components";
import PublicationsList from "@/components/PublicationsList";
import { Suspense } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const ConservationLandingPage = () => {
  const allSystems = [
    "mortality/aging",
    "homeostasis/metabolism",
    "behavior/neurological",
    "hematopoietic system",
    "growth/size/body region",
    "skeleton",
    "cardiovascular system",
    "immune system",
    "vision/eye",
    "reproductive system",
    "adipose tissue",
    "integument",
    "limbs/digits/tail",
    "nervous system",
    "embryo",
    "endocrine/exocrine gland",
    "hearing/vestibular/ear",
    "renal/urinary system",
    "craniofacial",
    "pigmentation",
    "respiratory system",
    "digestive/alimentary",
    "liver/biliary system",
    "muscle>",
  ];
  const reproductiveSystemPhenotypes = [
    "abnormal seminal vesicle morphology",
    "male infertility",
    "female infertility",
    "small testis",
    "hydrometra",
  ];
  const immuneSystemPhenotypes = [
    ["decreased leukocyte", "cell number"],
    ["increased leukocyte", "cell number"],
    ["abnormal", "spleen", "morphology"],
    ["enlarged", "lymph nodes"],
    "small thymus",
  ];
  const metabolismSystemPhenotypes = [
    ["decreased circulating", "glucose level"],
    ["decreased circulating", "cholesterol level"],
    ["increased circulating", "alkaline phosphatase level"],
    ["decreased circulating", "serum albumin level"],
    ["decreased circulating", "triglyceride level"],
  ];
  const globalChartOptions = {
    indexAxis: "y" as const,
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      tooltip: {
        callbacks: {
          title: (item) => item[0]?.label?.replaceAll(",", " "),
          label: (context) =>
            `${context.dataset.label}: ${context.parsed.x} mouse orthologs`,
        },
      },
    },
  };

  const allSystemsChartData = {
    labels: allSystems,
    datasets: data.allPhysiologicalSystemsChartData.map((item, index) => ({
      label: item.name,
      data: item.data,
      backgroundColor: chartColors[index],
      borderColor: chartColors[index],
    })),
  };
  const reproductiveSystemChartData = {
    labels: reproductiveSystemPhenotypes.map((phenotype) =>
      phenotype.split(" "),
    ),
    datasets: data.reproductiveSystemChartData.map((item, index) => ({
      label: item.name,
      data: item.data,
      backgroundColor: chartColors[index],
      borderColor: chartColors[index],
    })),
  };
  const immuneSystemChartData = {
    labels: immuneSystemPhenotypes,
    datasets: data.immuneSystemChartData.map((item, index) => ({
      label: item.name,
      data: item.data,
      backgroundColor: chartColors[index],
      borderColor: chartColors[index],
    })),
  };
  const metabolismSystemChartData = {
    labels: metabolismSystemPhenotypes,
    datasets: data.metabolismSystemChartData.map((item, index) => ({
      label: item.name,
      data: item.data,
      backgroundColor: chartColors[index],
      borderColor: chartColors[index],
    })),
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
              <Breadcrumb.Item active>Conservation</Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <h1 className="mb-4 mt-2">
            <strong>Translating to other species</strong>
          </h1>
          <PublicationDataAlert dataReleaseVersion="7.0" />
          <Container>
            <ul>
              <li>
                The IMPC has focused on translating knowledge from mouse to
                human, to identify models for human disease. However,
                translating to other species is relevant as well.
              </li>
              <li>
                Genetic functional data from the IMPC is relevant to identify
                genes essential for development or associated to disease or
                adaptation in other species.
              </li>
              <li>
                The type of analyses presented here could be used to improve the
                breeding management of endangered mammals.
              </li>
            </ul>
            <p>
              Press releases and new posts:&nbsp;
              <a
                className="link primary"
                href="http://blog.mousephenotype.org/new-research-suggests-laboratory-mouse-data-can-help-in-wildlife-conservation/"
              >
                IMPC blog
              </a>
              &nbsp;|&nbsp;
              <a
                className="link primary"
                href="https://www.mousephenotype.org/data/biological-system/conservation"
              >
                EMBL-EBI
              </a>
            </p>
            <h2>Approach</h2>
            <p>
              We used IMPC data derived from the&nbsp;
              <a
                className="primary link"
                href="https://www.mousephenotype.org/data/biological-system/conservation#:~:text=We%20used%20IMPC,from%20the%20literature."
              >
                IMPC Viability Primary Screen [IMPC_VIA_001]
              </a>
              to identify genes essential for organismal viability (development
              and survival) collected up to DR 7.0., as well as all phenotype
              associations collected by the IMPC up to DR 6.2. We used these
              data in combination with (human) cell viability data to inform
              wild species genomic data sets collected from the literature.
            </p>
          </Container>
        </Card>
        <Card>
          <h1>
            <strong>IMPC Conservation Publication</strong>
          </h1>
          <h2>
            Aiding the functional annotation of genes relevant for development
            and adaptation in mammalian species
          </h2>
          <p>
            <a
              className="primary link"
              href="http://bit.ly/conservationarticle"
            >
              Conservation Genetics Special Issue on Adaptation
            </a>
            <br />
            <a
              className="link primary"
              href="https://link.springer.com/article/10.1007/s10592-018-1072-9#SupplementaryMaterial"
            >
              Supplementary Material
            </a>
          </p>
          <ul>
            <li>
              We used IMPC organism viability data in combination with human
              cell viability data to identify essential genes.
            </li>
            <li>
              Genes in gorillas with loss-of-function (LoF) alleles have been
              previously identified; we inferred gorilla-to-mouse and
              gorilla-to-human orthologues of those genes and associated them to
              genes essential for organism and cell viability.
            </li>
            <li>
              For this set of genes with LoF alleles, we found that the
              percentage of lethal/essential genes was lower than for
              protein-coding genes, but the difference was not significant (P
              &gt; 0.1 in all comparisons).
            </li>
            <li>
              Future research may include improved methods to detect LoF
              variants, detailed observation of gorillas carrying these
              variants, investigating whether the LoF variants affect or not the
              functional exons, and whether there are paralogues or alternative
              genes providing functional compensation.
            </li>
            <li>
              We also show how phenotype associations collected by the IMPC can
              aid the functional annotation of regions putatively targeted by
              positive selection or associated to disease using examples from
              wild species, such as polar bears and cheetahs.
            </li>
            <li>
              This investigation is based on about 15% of mammalian
              protein-coding genes. The IMPC continues screening for genes
              essential for organism survival and development and collecting
              phenotype association data.
            </li>
          </ul>
          <h2>Methods</h2>
          <ul>
            <li>
              We developed custom scripts to infer orthologues based on
              available resources (
              <a
                className="link primary"
                href="https://www.genenames.org/cgi-bin/hcop"
              >
                HGNC Comparison of Orthology Predictions (HCOP)
              </a>
              , &nbsp;
              <a
                className="link primary"
                href="http://metaphors.phylomedb.org/"
              >
                MetaPhOrs
              </a>
              ) and to conduct gene overlaps.
            </li>
            <li>
              We collected IMPC primary viability screen data and combined it
              with human cell viability data from 3 different studies (
              <a
                className="link primary"
                href="https://europepmc.org/abstract/MED/26472760"
              >
                Blomen et al. 2015
              </a>
              ;&nbsp;
              <a
                className="link primary"
                href="https://europepmc.org/abstract/MED/26627737"
              >
                Hartl et al. 2015
              </a>
              ;&nbsp;
              <a
                className="link primary"
                href="https://europepmc.org/abstract/MED/26472758"
              >
                Wang et al. 2015
              </a>
              ) to identify essential genes in cells and in mouse (for data,
              see&nbsp;
              <a
                className="link primary"
                href="https://link.springer.com/article/10.1007/s10592-018-1072-9#SupplementaryMaterial"
              >
                Supplementary Material
              </a>
              )
            </li>
            <li>
              We collected IMPC phenotype annotations (also MGI) to characterize
              genes potentially linked to disease or to regions putatively under
              positive selection in selected endangered species (for data,
              see&nbsp;{" "}
              <a
                className="link primary"
                href="https://link.springer.com/article/10.1007/s10592-018-1072-9#SupplementaryMaterial"
              >
                Supplementary Material
              </a>
              )
            </li>
          </ul>
        </Card>
        <Card>
          <h1>
            <strong>IMPC significant phenotypes</strong>
          </h1>
          <p>
            IMPC significant phenotypes for selected mammal species, based on
            orthologue inferences (source:{" "}
            <a
              className="link primary"
              href="http://bit.ly/conservationarticle"
            >
              IMPC Conservation Genetics paper
            </a>
            ).
            <br />
            Note links are to phenotype pages depicting data as in the current
            Data Release.
          </p>
          <Row>
            <Col
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <h3>All physiological systems</h3>
              <div
                style={{
                  position: "relative",
                  height: "1000px",
                  maxWidth: "100%",
                  width: "500px",
                }}
              >
                <Bar
                  options={{
                    ...globalChartOptions,
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: "Number of genes with significant phenotypes",
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: "Mammalian Phenotype Ontology top level terms",
                        },
                      },
                    },
                  }}
                  data={allSystemsChartData}
                />
              </div>
            </Col>
            <Col
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <h3>Reproductive system</h3>
              <div
                style={{
                  position: "relative",
                  height: "333px",
                  maxWidth: "100%",
                  width: "500px",
                }}
              >
                <Bar
                  options={{
                    ...globalChartOptions,
                    scales: {
                      y: {
                        title: {
                          display: true,
                          text: "Most frequent phenotypes",
                        },
                      },
                    },
                    plugins: {
                      ...globalChartOptions.plugins,
                      legend: { display: false },
                    },
                  }}
                  data={reproductiveSystemChartData}
                />
              </div>
              <div
                style={{
                  position: "relative",
                  height: "333px",
                  maxWidth: "100%",
                  width: "500px",
                }}
              >
                <Bar
                  options={{
                    ...globalChartOptions,
                    scales: {
                      y: {
                        title: {
                          display: true,
                          text: "Most frequent phenotypes",
                        },
                      },
                    },
                    plugins: {
                      ...globalChartOptions.plugins,
                      legend: { display: false },
                    },
                  }}
                  data={immuneSystemChartData}
                />
              </div>
              <div
                style={{
                  position: "relative",
                  height: "333px",
                  maxWidth: "100%",
                  width: "500px",
                }}
              >
                <Bar
                  options={{
                    ...globalChartOptions,
                    scales: {
                      y: {
                        title: {
                          display: true,
                          text: "Most frequent phenotypes",
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: "Number of genes with significant phenotypes",
                        },
                      },
                    },
                  }}
                  data={metabolismSystemChartData}
                />
              </div>
            </Col>
          </Row>
        </Card>
        <Card>
          <h1>
            <strong>Conservation IKMC/IMPC related publications</strong>
          </h1>
          <PublicationsList prefixQuery="development embryo disease" />
        </Card>
      </Container>
    </>
  );
};

export default ConservationLandingPage;
