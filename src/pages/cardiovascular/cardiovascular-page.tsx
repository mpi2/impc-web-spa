"use client";

import { Alert, Breadcrumb, Col, Container, Row } from "react-bootstrap";
import data from "../../mocks/data/landing-pages/cardiovascular.json";
import styles from "./styles.module.scss";
import { Fragment, Suspense, useState } from "react";
import Link from "next/link";
import {
  Card,
  ChordDiagram,
  PieChart,
  PleiotropyChart,
  Search,
  SortableTable,
} from "@/components";
import PublicationsList from "@/components/PublicationsList";
import { usePleiotropyQuery } from "@/hooks";
import { ParentSize } from "@visx/responsive";

const ProcedureWithVersions = ({ procedure }) => {
  return (
    <li>
      {procedure.name}&nbsp;
      {procedure.versions.map((version, index) => (
        <Fragment key={index}>
          <a
            key={version.impressId}
            className="link primary"
            href={
              "//www.mousephenotype.org/impress/protocol/" + version.impressId
            }
          >
            {version.name}
          </a>
          ,&nbsp;
        </Fragment>
      ))}
    </li>
  );
};

const CardiovascularLandingPage = () => {
  const [tableExtended, setTableExtended] = useState(false);
  const phenotypeData = !tableExtended
    ? data.phenotypes.slice(0, 10)
    : data.phenotypes;
  const chordLabels = [
    { name: "cardiovascular system phenotype", count: 1622 },
    { name: "vision/eye phenotype", count: 268 },
    { name: "growth/size/body region phenotype", count: 712 },
    { name: "embryo phenotype", count: 64 },
    { name: "muscle phenotype ", count: 45 },
  ];
  const chordData = [
    [590, 268, 712, 64, 45],
    [268, 0, 26, 12, 4],
    [712, 26, 0, 11, 6],
    [64, 12, 11, 0, 0],
    [45, 4, 6, 0, 0],
  ];
  const { data: pleiotropyData, isLoading } = usePleiotropyQuery(
    "cardiovascular system",
  );

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
              <Breadcrumb.Item active>Cardiovascular</Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <h1 className="mb-4 mt-2">
            <strong>Cardiovascular System</strong>
          </h1>
          <Container>
            <Alert variant="landing-page">
              <Alert.Heading>Attention</Alert.Heading>
              <p>
                This publication page was published when Data Release 11.0 was
                made available. <br />
                Most of the sections might be using data from the latest Data
                Release.
              </p>
              <hr />
              <Link className="link primary" href="#">
                Link to FTP site
              </Link>
            </Alert>
            <p>
              This page introduces cardiovascular related phenotypes present in
              mouse lines produced by the IMPC. The cardiovascular system refers
              to the observable morphological and physiological characteristics
              of the mammalian heart, blood vessels, or circulatory system that
              are manifested through development and lifespan.
            </p>
            <Row>
              <Col md={7}>
                <div className={styles.chartWrapper}>
                  {data && (
                    <PieChart
                      title=""
                      data={data.genesTested}
                      chartColors={[
                        "rgba(239, 123, 11,1.0)",
                        "rgba(9, 120, 161,1.0)",
                        "rgba(119, 119, 119,1.0)",
                        "rgba(238, 238, 180,1.0)",
                      ]}
                    />
                  )}
                </div>
              </Col>
              <Col md={5}>
                <SortableTable
                  headers={[
                    {
                      width: 1,
                      label: "Phenotype",
                      field: "key",
                      disabled: true,
                    },
                    {
                      width: 1,
                      label: "# Genes",
                      field: "value",
                      disabled: true,
                    },
                  ]}
                >
                  {phenotypeData &&
                    phenotypeData.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <a
                            href={
                              "http://www.mousephenotype.org/data/phenotypes/" +
                              row.id
                            }
                          >
                            {row.name}
                          </a>
                        </td>
                        <td>
                          <a
                            href={
                              "http://www.mousephenotype.org/data/phenotypes/export/" +
                              row.id
                            }
                          >
                            {row.noOfGenes}
                          </a>
                        </td>
                      </tr>
                    ))}
                  <tr>
                    <td>
                      <a
                        className="btn"
                        onClick={() => setTableExtended(!tableExtended)}
                      >
                        {tableExtended ? "Show less" : "Show more"}
                      </a>
                    </td>
                    <td>
                      <a
                        className="link primary"
                        href="https://www.mousephenotype.org/data/phenotypes/export/MP:0005385?fileType=tsv&fileName=IMPC_Cardiovascular%20System"
                      >
                        Download
                      </a>
                    </td>
                  </tr>
                </SortableTable>
              </Col>
            </Row>
          </Container>
        </Card>
        <Card>
          <Container>
            <Row>
              <h2>Approach</h2>
              <p>
                In order to identify the function of genes, the consortium uses
                a series of standardised protocols as described in IMPReSS
                (International Mouse Phenotyping Resource of Standardised
                Screens).
                <br />
                <br />
                Heart and vascular function/physiology are measured through
                several procedures like echocardiography and electrocardiogram
                and non-invasive blood pressure. Cardiovascular system
                morphology is assessed through macroscopic and microscopic
                measurements, like heart weight, gross pathology and gross
                morphology in both embryo and adult animals. A complete list of
                protocols and related phenotypes are presented in the table
                below. Links to impress are provided for more details on the
                procedure.
              </p>
            </Row>
          </Container>
        </Card>
        <Card>
          <Container>
            <Row>
              <h2>
                Procedures that can lead to relevant phenotype associations
              </h2>
              <div>
                <h6>Young adult</h6>
                <ul>
                  {data &&
                    data.procedures.youngAdult.map((procedure, index) => (
                      <ProcedureWithVersions
                        key={index}
                        procedure={procedure}
                      />
                    ))}
                </ul>
              </div>
              <div>
                <h6>Embryo</h6>
                <ul>
                  {data &&
                    data.procedures.embryo.map((procedure, index) => (
                      <ProcedureWithVersions
                        key={index}
                        procedure={procedure}
                      />
                    ))}
                </ul>
              </div>
            </Row>
          </Container>
        </Card>
        <Card>
          <Container>
            <h1>
              <strong>Phenotypes distribution</strong>
            </h1>
            <p>
              This graph shows genes with a significant effect on at least one
              cardiovascular system phenotype.
            </p>
            <div className={styles.chartWrapper}>
              <ParentSize
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                {({ width, height }) => (
                  <PleiotropyChart
                    title="Number of phenotype associations to Cardiovascular System"
                    phenotypeName="Cardiovascular System"
                    data={pleiotropyData}
                    isLoading={isLoading}
                    width={width}
                    height={height}
                  />
                )}
              </ParentSize>
            </div>
            <p>
              The following diagram represents the various biological system
              phenotypes associations for genes linked to cardiovascular system
              phenotypes. The line thickness is correlated with the strength of
              the association. <br />
              <br />
              Clicking on chosen phenotype(s) on the diagram allow to select
              common genes. Corresponding gene lists can be downloaded using the
              download icon.
            </p>
            <ChordDiagram
              labels={chordLabels}
              data={chordData}
              topTerms={["cardiovascular system phenotype"]}
            />
          </Container>
        </Card>
        <Card>
          <Container>
            <h1>
              <strong>
                Cardiovascular system IKMC/IMPC related publications
              </strong>
            </h1>
            <PublicationsList prefixQuery="cardio cardia heart" />
          </Container>
        </Card>
      </Container>
    </>
  );
};

export default CardiovascularLandingPage;
