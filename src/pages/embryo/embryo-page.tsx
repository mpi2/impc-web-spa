"use client";
import { useEmbryoLandingQuery } from "@/hooks";
import { Suspense, useMemo, useState, useEffect } from "react";
import { SortType } from "@/models";
import Link from "next/link";
import Search from "@/components/Search";
import {
  Breadcrumb,
  Button,
  Col,
  Container,
  Image,
  Modal,
  Row,
} from "react-bootstrap";
import Card from "@/components/Card";
import styles from "./styles.module.scss";
import PieChart from "@/components/PieChart";
import SortableTable from "@/components/SortableTable";
import { capitalize } from "lodash";
import EmbryoDataAvailabilityGrid from "@/components/EmbryoDataAvailabilityGrid";
import { LinkCell, PlainTextCell, SmartTable } from "@/components/SmartTable";
import PublicationsList from "@/components/PublicationsList";

type SelectedLine = {
  windowOfLethality: string;
  genes: Array<{ mgiGeneAccessionId: string; geneSymbol: string }>;
};

const EmbryoLandingPage = () => {
  const { data } = useEmbryoLandingQuery();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [listGenes, setListGenes] = useState<SelectedLine>(null);
  const [displayGenesWithData, setDisplayGenesWithData] =
    useState<boolean>(true);
  const defaultSort: SortType = useMemo(() => ["geneSymbol", "asc"], []);

  data?.primaryViabilityTable?.sort((a, b) =>
    a.genes.length > b.genes.length ? -1 : 1,
  );
  data?.primaryViabilityChart?.sort((a, b) =>
    a.genes.length > b.genes.length ? -1 : 1,
  );
  data?.secondaryViabilityData?.sort((a, b) =>
    a.genes.length > b.genes.length ? -1 : 1,
  );
  data?.embryoDataAvailabilityGrid?.sort((a, b) =>
    a.geneSymbol > b.geneSymbol ? 1 : -1,
  );

  const heatMapSelectOptions = useMemo(
    () =>
      data?.secondaryViabilityData
        ?.map((d) => ({
          value: d.windowOfLethality,
          label: d.windowOfLethality,
        }))
        .sort(),
    [data],
  );

  const getPrimaryViabilityText = (value: string) => {
    if (value === "Viable") {
      return value;
    }
    const mpId = value === "Lethal" ? "MP:0011100" : "MP:0011110";
    return (
      <Link className="link primary" href={`/phenotypes/${mpId}`}>
        {value}
      </Link>
    );
  };

  const openModalListGenes = (wol: string) => {
    const selectedList = data.secondaryViabilityData.find(
      (row) => row.windowOfLethality === wol,
    );
    setModalVisible(true);
    setListGenes(selectedList);
  };
  const handleClose = () => {
    setModalVisible(false);
    setListGenes(null);
  };

  const fullAvailabilityGrid = useMemo(() => {
    if (
      data?.secondaryViabilityData?.length &&
      data?.embryoDataAvailabilityGrid?.length
    ) {
      return displayGenesWithData
        ? data.embryoDataAvailabilityGrid
        : data.secondaryViabilityData
            .flatMap((genesByWOL) =>
              genesByWOL.genes.map((gene) => {
                const availabilityData = data.embryoDataAvailabilityGrid.find(
                  (data) => data.mgiGeneAccessionId === gene.mgiGeneAccessionId,
                );
                return !!availabilityData
                  ? availabilityData
                  : {
                      ...gene,
                      analysisViewUrl: "",
                      embryoViewerUrl: "",
                      hasAutomatedAnalysis: false,
                      hasVignettes: false,
                      isUmassGene: false,
                      procedureNames: [],
                    };
              }),
            )
            .sort((a, b) => a.geneSymbol.localeCompare(b.geneSymbol));
    }
    return [];
  }, [data, displayGenesWithData]);

  return (
    <>
      <Suspense>
        <Search />
      </Suspense>
      <Container className="page" style={{ lineHeight: 2 }}>
        <Card>
          <div className={styles.subheading}>
            <Breadcrumb>
              <Breadcrumb.Item active>Home</Breadcrumb.Item>
              <Breadcrumb.Item active>IMPC data collections</Breadcrumb.Item>
              <Breadcrumb.Item active>Embryo Data</Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <h1 className="mb-4 mt-2">
            <strong>Introduction to IMPC Embryo Data</strong>
          </h1>
          <Container>
            <Row>
              <Col xs={12} md={4} className="text-center">
                <Image
                  className={styles.embryoImage}
                  src="images/landing-pages/Tmem100_het.jpg"
                  fluid
                  alt=""
                />
              </Col>
              <Col xs={12} md={8}>
                <p>
                  Up to one third of homozygous knockout lines are lethal, which
                  means no homozygous mice or less than expected are observed
                  past the weaning stage (IMPC{" "}
                  <a
                    className="link primary"
                    href="https://beta.mousephenotype.org/impress/ProcedureInfo?action=list&procID=703&pipeID=7"
                  >
                    Viability Primary Screen procedure
                  </a>
                  ). Early death may occur during embryonic development or soon
                  after birth, during the pre-weaning stage. For this reason,
                  the IMPC established a{" "}
                  <a
                    className="link primary"
                    href="https://beta.mousephenotype.org/impress"
                  >
                    systematic embryonic phenotyping pipeline
                  </a>{" "}
                  to morphologically evaluate mutant embryos to ascertain the
                  primary perturbations that cause early death and thus gain
                  insight into gene function.
                </p>
              </Col>
            </Row>
            <Row className="mt-4">
              <Col>
                <p>
                  Read more in our paper on&nbsp;
                  <a
                    className="link primary"
                    href="https://europepmc.org/article/PMC/5295821"
                  >
                    High-throughput discovery of novel developmental phenotypes,
                    Nature 2016.
                  </a>
                </p>
              </Col>
            </Row>
          </Container>
        </Card>
        <Card>
          <Container>
            <h1>
              <strong>IMPC Embryonic Pipeline</strong>
            </h1>
            <p>
              As determined in IMPReSS (see interactive diagram here), all
              embryonic lethal lines undergo gross morphology assessment at
              E12.5 (embryonic day 12.5) to determine whether defects occur
              earlier or later during embryonic development. A comprehensive
              imaging platform is then used to assess dysmorphology. Embryo
              gross morphology, as well as 2D and 3D imaging are actively being
              implemented by the IMPC for lethal lines.
            </p>
            <div className="text-center">
              <Image
                src="images/landing-pages/IMPC-Embryo-Pipeline-Diagram.png"
                fluid
                alt=""
              />
            </div>
          </Container>
        </Card>
        <Card>
          <Container>
            <h1>
              <strong>Determining Lethal Lines</strong>
            </h1>
            <p>
              The IMPC assesses each gene knockout line for viability (Viability
              Primary Screen &nbsp;
              <a
                className="link primary"
                href="https://beta.mousephenotype.org/impress/ProcedureInfo?action=list&procID=703&pipeID=7"
              >
                IMPC_VIA_001
              </a>
              &nbsp;and{" "}
              <a
                className="link primary"
                href="https://beta.mousephenotype.org/impress/ProcedureInfo?action=list&procID=1188&pipeID=7#Parameters"
              >
                IMPC_VIA_002
              </a>
              ). In this procedure, the proportion of homozygous pups is
              determined soon after birth, during the preweaning stage, in
              litters produced from mating heterozygous animals. A line is
              declared lethal if no homozygous pups for the null allele are
              detected at weaning age, and subviable if pups homozygous for the
              null allele constitute less than 12.5% of the litter.
            </p>
            <Row className="mb-3">
              <Col md={7}>
                <div className={styles.chartWrapper}>
                  {data && (
                    <PieChart
                      title="Primary Viability"
                      data={
                        data?.primaryViabilityChart?.map((d) => ({
                          label: d.outcome,
                          value: d.genes.length,
                        })) || []
                      }
                    />
                  )}
                </div>
              </Col>
              <Col md={5}>
                <SortableTable
                  className="table-sortable-centered"
                  headers={[
                    {
                      width: 1,
                      label: "Category",
                      field: "key",
                      disabled: true,
                    },
                    {
                      width: 1,
                      label: "Lines",
                      field: "value",
                      disabled: true,
                    },
                  ]}
                >
                  {data &&
                    data?.primaryViabilityTable?.map((row) => (
                      <tr>
                        <td>{getPrimaryViabilityText(row.outcome)}</td>
                        <td>{row.genes.length}</td>
                      </tr>
                    ))}
                  <tr>
                    <td colSpan={2}>
                      <a
                        className="link primary"
                        href="https://ftp.ebi.ac.uk/pub/databases/impc/all-data-releases/latest/results/viability.csv.gz"
                      >
                        Download
                      </a>
                    </td>
                  </tr>
                </SortableTable>
              </Col>
            </Row>
            <Row>
              <p>
                Lethal strains are further phenotyped in the{" "}
                <a
                  className="link primary"
                  href="https://beta.mousephenotype.org/impress"
                >
                  embryonic phenotyping pipeline
                </a>
                . For embryonic lethal and subviable strains, heterozygotes are
                phenotyped in the IMPC{" "}
                <a
                  className="link primary"
                  href="https://beta.mousephenotype.org/impress"
                >
                  adult phenotyping pipeline
                </a>
                .
              </p>
            </Row>
            <Row>
              <Col md={7}>
                <div className={styles.chartWrapper}>
                  {data.secondaryViabilityData && (
                    <PieChart
                      title="Secondary Viability / Windows of Lethality"
                      data={data.secondaryViabilityData.map((d) => ({
                        label: d.windowOfLethality,
                        value: d.genes.length,
                      }))}
                    />
                  )}
                </div>
              </Col>
              <Col md={5}>
                <SortableTable
                  className="table-sortable-centered"
                  headers={[
                    {
                      width: 1,
                      label: "Category",
                      field: "key",
                      disabled: true,
                    },
                    {
                      width: 1,
                      label: "Lines",
                      field: "value",
                      disabled: true,
                    },
                  ]}
                >
                  {data &&
                    data?.secondaryViabilityData?.map((row) => (
                      <tr>
                        <td>
                          <button
                            className="btn link primary"
                            onClick={() =>
                              openModalListGenes(row.windowOfLethality)
                            }
                          >
                            {capitalize(row.windowOfLethality)}
                          </button>
                        </td>
                        <td>{row.genes.length}</td>
                      </tr>
                    ))}
                  <tr>
                    <td colSpan={2}>
                      <a
                        className="link primary"
                        href="https://impc-datasets.s3.eu-west-2.amazonaws.com/embryo-landing-assets/wol_all_dr21.0.tsv"
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
        <Card id="embryo-data-grid">
          <Container>
            <h1>
              <strong>Embryo Imaging Data Availability Grid</strong>
            </h1>
            <Row>
              <Col>
                {data && (
                  <EmbryoDataAvailabilityGrid
                    selectOptions={heatMapSelectOptions ?? []}
                    data={fullAvailabilityGrid ?? []}
                    secondaryViabilityData={data.secondaryViabilityData ?? []}
                    viewAllGenes={displayGenesWithData}
                    onDataFilterChange={setDisplayGenesWithData}
                  />
                )}
              </Col>
            </Row>
          </Container>
        </Card>
        <Card>
          <Container>
            <h1>
              <strong>Accessing Embryo Phenotype Data</strong>
            </h1>
            <Row>
              <Col>
                <p>Embryo phenotye data can be accessed in multiple ways:</p>
                <ul>
                  <li>
                    <a
                      className="link primary"
                      href="https://beta.mousephenotype.org/data/embryo_imaging"
                    >
                      Embryo Images: interactive heatmap
                    </a>
                    &nbsp;A compilation of all our Embryo Images, organised by
                    gene and life stage, with access to the Interactive Embryo
                    Viewer, where you can compare mutants and wild types side by
                    side and rotate 2D and 3D images; we also provide access to
                    our external partners' embryo images.
                  </li>
                  <li>
                    <Link className="link primary" href="embryo/vignettes">
                      Embryo Vignettes
                    </Link>
                    &nbsp;Showcase of best embryo images with detailed
                    explanations.
                  </li>
                  <li>
                    <a
                      className="link primary"
                      href="ftp://ftp.ebi.ac.uk/pub/databases/impc/all-data-releases/latest/results/"
                    >
                      From the FTP site, latest release
                    </a>
                    &nbsp;All our results. Reports need to be filtered by a
                    dedicated column, Life Stage (E9.5, E12.5, E15.5 and E18.5).
                    Please check the README file or see documentation here.
                  </li>
                  <li>
                    Using the REST API (see documentation{" "}
                    <a
                      className="link primary"
                      href="https://www.mousephenotype.org/help/programmatic-data-access/"
                    >
                      here
                    </a>
                    )
                  </li>
                </ul>
              </Col>
            </Row>
          </Container>
        </Card>
        <Card>
          <Container>
            <h1>
              <strong>IKMC/IMPC related publications</strong>
            </h1>
            <PublicationsList prefixQuery="embryo" />
          </Container>
        </Card>
        <Modal show={modalVisible} onHide={handleClose} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {capitalize(listGenes?.windowOfLethality || "")} lines
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <SmartTable
              data={listGenes?.genes}
              defaultSort={defaultSort}
              columns={[
                {
                  width: 1,
                  label: "Gene symbol",
                  field: "geneSymbol",
                  cmp: <PlainTextCell />,
                },
                {
                  width: 1,
                  label: "MGI Accession ID",
                  field: "mgiGeneAccessionId",
                  disabled: true,
                  cmp: <LinkCell prefix="/genes" />,
                },
              ]}
              paginationButtonsPlacement="bottom"
              displayPageControls={false}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default EmbryoLandingPage;
