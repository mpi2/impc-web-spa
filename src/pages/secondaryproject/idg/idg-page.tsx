"use client";

import { Breadcrumb, Col, Container, Row, Image, Table } from "react-bootstrap";
import {
  Card,
  LoadingProgressBar,
  Search,
  PaginationControls,
  PieChart,
} from "@/components";
import ChordDiagram from "@/components/ChordDiagram";
import data from "../../../mocks/data/landing-pages/idg.json";
import {
  useMemo,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  Suspense,
} from "react";
import { Bar } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import Link from "next/link";
import classNames from "classnames";
import styles from "./styles.module.scss";
import { usePagination } from "@/hooks";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import { fetchLandingPageData } from "@/api-service";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

type FamilyDataTableProps = {
  data: {
    genesCount: number;
    esCellsProduced: number;
    miceProduced: number;
    phenotypeCount: number;
  };
};

type AccordionTableHandle = {
  toggleVisibility: () => void;
};
type AccordionTableProps = {
  type: string;
  geneList: Array<Gene>;
};

type Gene = {
  es_cell_production_status: string;
  human_gene_symbol: string;
  idg_family: string;
  marker_symbol: string;
  mgi_accession_id: string;
  mouse_production_status: string;
  not_significant_top_level_mp_terms: Array<string> | null;
  phenotype_status: string;
  significant_top_level_mp_terms: Array<string> | null;
};

const getLinksToGenePage = (gene: Gene) => {
  const url = `/genes/${gene.mgi_accession_id}`;
  const products = [];
  if (gene.es_cell_production_status === "ES Cells Produced") {
    products.push("ES Cells");
  }
  if (gene.mouse_production_status === "Mice Produced") {
    products.push("Mice");
  }
  if (gene.phenotype_status === "Phenotyping data available") {
    products.push("Phenotype data");
  }
  if (products.length === 0) {
    return "-";
  }
  return products.map((value) => {
    const href = value === "Phenotype data" ? url + "#data" : url + "#order";
    return (
      <>
        <Link
          className="link primary"
          style={{ padding: 0, backgroundColor: "initial" }}
          href={href}
        >
          {value}
        </Link>
        <br />
      </>
    );
  });
};

const FamilyDataTable = (props: FamilyDataTableProps) => {
  const { data } = props;
  return (
    <Table bordered striped style={{ maxWidth: "30%" }}>
      <tbody>
        <tr>
          <td>
            <b>IMPC/IDG genes</b>
          </td>
          <td>{data.genesCount}</td>
        </tr>
        <tr>
          <td>
            <b>ES Cells produced</b>
          </td>
          <td>{data.esCellsProduced}</td>
        </tr>
        <tr>
          <td>
            <b>Mice produced</b>
          </td>
          <td>{data.miceProduced}</td>
        </tr>
        <tr>
          <td>
            <b>Phenotypes</b>
          </td>
          <td>{data.phenotypeCount}</td>
        </tr>
      </tbody>
    </Table>
  );
};

const HeatMap = ({ geneList }: { geneList: Array<Gene> }) => {
  const [query, setQuery] = useState("");
  const filteredData = useMemo(
    () =>
      geneList.filter(
        ({ mgi_accession_id, idg_family, marker_symbol }) =>
          !query ||
          `${mgi_accession_id} ${idg_family} ${marker_symbol}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [query, geneList],
  );

  const {
    paginatedData,
    activePage,
    pageSize,
    totalPages,
    setActivePage,
    setPageSize,
  } = usePagination<Gene>(filteredData);

  const getCellStyle = (phenotypeName: string, gene: Gene) => {
    const isSignificant =
      gene.significant_top_level_mp_terms?.includes(phenotypeName) || false;
    const isNotSignificant =
      gene.not_significant_top_level_mp_terms?.includes(phenotypeName) || false;

    return classNames(styles.dataCell, {
      [styles.significant]: isSignificant,
      [styles.notSignificant]: isNotSignificant,
      [styles.noData]: !isSignificant && !isNotSignificant,
    });
  };

  return (
    <>
      <div className={styles.controls}>
        <div>
          Show
          <select
            name="pageSize"
            className="form-select"
            value={pageSize}
            onChange={(e) => setPageSize(Number.parseInt(e.target.value, 10))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          entries
        </div>
        <div>
          Search:
          <input
            className="form-control"
            title="heatmap search box"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <table className={`table table-bordered ${styles.heatmap}`}>
        <thead>
          <tr>
            <th>Gene</th>
            <th>Family</th>
            <th>Availability</th>
            {data.heatmapTopLevelPhenotypes.map((phenotype) => (
              <th key={phenotype.id}>
                <span className={styles.verticalHeader}>
                  <Link
                    className="primary link"
                    href={`/phenotypes/${phenotype.id}`}
                  >
                    {phenotype.name}
                  </Link>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        {paginatedData.map((gene) => (
          <tr>
            <td className={styles.geneCell}>
              <Link
                href={`/genes/${gene.mgi_accession_id}`}
                className="primary link"
                style={{ backgroundColor: "initial", padding: 0 }}
              >
                {gene.marker_symbol}
              </Link>
              <br />
              {gene.human_gene_symbol || "-"}
            </td>
            <td>{gene.idg_family}</td>
            <td>{getLinksToGenePage(gene)}</td>
            {data.heatmapTopLevelPhenotypes.map((phenotype) => (
              <td className={getCellStyle(phenotype.name, gene)}></td>
            ))}
          </tr>
        ))}
        {paginatedData.length === 0 && !!query && (
          <tr>
            <td colSpan={29}>
              <h4 style={{ backgroundColor: "initial" }}>
                No matching records found
              </h4>
            </td>
          </tr>
        )}
      </table>
      <PaginationControls
        currentPage={activePage}
        totalPages={totalPages}
        onPageChange={setActivePage}
        showEntriesInfo
        pageSize={pageSize}
      />
    </>
  );
};

const AccordionTable = forwardRef<AccordionTableHandle, AccordionTableProps>(
  ({ type, geneList }, ref) => {
    const [visibility, setVisibility] = useState(false);
    const filteredList: Array<Gene> = geneList.filter(
      (gene) => gene.idg_family === type,
    );

    useImperativeHandle(ref, () => ({
      toggleVisibility() {
        setVisibility((prevState) => !prevState);
      },
    }));

    return visibility ? (
      <Table bordered striped>
        <thead>
          <tr>
            <th>Mouse Genes</th>
            <th>Human Genes</th>
            <th>Data available</th>
          </tr>
        </thead>
        <tbody>
          {filteredList.map((gene) => (
            <tr key={gene.mgi_accession_id}>
              <td>
                <Link
                  className="link primary"
                  href={`/genes/${gene.mgi_accession_id}`}
                >
                  {gene.marker_symbol}
                </Link>
                &nbsp;({gene.mgi_accession_id})
              </td>
              <td>
                <a
                  className="link primary"
                  href={`https://pharos.nih.gov/targets?q=${gene.human_gene_symbol}`}
                >
                  {gene.human_gene_symbol}&nbsp;
                  <FontAwesomeIcon icon={faExternalLinkAlt}></FontAwesomeIcon>
                </a>
              </td>
              <td>{getLinksToGenePage(gene)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    ) : null;
  },
);

const IDGPage = () => {
  const { data: geneList, isFetching } = useQuery<Array<Gene>>({
    queryKey: ["landing-pages", "idg"],
    queryFn: () => fetchLandingPageData("idg_landing"),
    placeholderData: [],
    select: (data) =>
      data.sort((g1, g2) => g1.marker_symbol.localeCompare(g2.marker_symbol)),
  });

  const ionChannelsTableRef = useRef<AccordionTableHandle>(null);
  const gpcrTableRef = useRef<AccordionTableHandle>(null);
  const kinasesTableRef = useRef<AccordionTableHandle>(null);
  const geneProductionStatusData = data.geneProductionStatusData || [];

  const idgGenesProductionStatusOptions = {
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "IDG genes IMPC production status",
      },
    },
    interaction: {
      mode: "index" as const,
    },
  };

  const idgGenesProductionStatusData = useMemo(
    () => ({
      labels: geneProductionStatusData.map((status) => status.label),
      datasets: [
        {
          label: "",
          data: geneProductionStatusData.map((s) => s.value),
          backgroundColor: "rgb(247, 157, 70)",
        },
      ],
    }),
    [geneProductionStatusData],
  );

  return (
    <>
      <Suspense>
        <Search />
      </Suspense>
      <Container className="page">
        <Card>
          <div className="subheading">
            <Breadcrumb>
              <Breadcrumb.Item active>Home</Breadcrumb.Item>
              <Breadcrumb.Item active>IMPC data collections</Breadcrumb.Item>
              <Breadcrumb.Item active>IDG</Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <h1 className="mb-4 mt-2">
            <strong>Illuminating the Druggable Genome (IDG)</strong>
          </h1>
          <Container>
            <Row>
              <Col xs={9}>
                <p>
                  <a
                    className="primary link"
                    href="https://commonfund.nih.gov/idg/index"
                  >
                    IDG
                  </a>
                  is an NIH Common Fund project focused on collecting,
                  integrating and making available biological data on 278 human
                  genes from three key druggable protein families that have been
                  identified as potential therapeutic targets: non-olfactory
                  G-protein coupled receptors (GPCRs), ion channels, and protein
                  kinases. The{" "}
                  <a
                    className="primary link"
                    href="https://www.mousephenotype.org/about-impc/"
                  >
                    IMPC consortium
                  </a>{" "}
                  is creating knockout mouse strains for the IDG project to
                  better understand the function of these proteins.
                </p>
              </Col>
              <Col xs={3}>
                <Image
                  style={{ maxWidth: "100%" }}
                  src="/data/images/landing-pages/idgLogo.png"
                />
              </Col>
            </Row>
          </Container>
        </Card>
        <Card>
          <Row>
            <Col className="mb-4" xs={12}>
              <h2>IMPC data representation for IDG genes</h2>
              <p>
                IDG human genes are mapped to mouse orthologs using&nbsp;
                <a
                  className="primary link"
                  href="https://www.genenames.org/tools/hcop/"
                >
                  HCOP
                </a>
                . The{" "}
                <a
                  className="primary link"
                  href="//www.mousephenotype.org/about-impc/"
                >
                  IMPC consortium
                </a>
                &nbsp;is using different&nbsp;
                <a
                  className="primary link"
                  href="https://mousephenotype.org/help/#howdoesimpcwork"
                >
                  complementary targeting strategies
                </a>
                &nbsp;to produce Knockout strains. Mice are produced and
                submitted to standardised phenotyping pipelines. Currently 63.7
                % of mouse IDG gene have data representation in IMPC, the bar
                charts and heatmap below capture the IMPC data representation at
                different levels. The percentage might increase as we get more
                data and this page will reflect the change.
              </p>
            </Col>
            <Col xs={6}>
              <div style={{ position: "relative", height: "300px" }}>
                <PieChart
                  title="IDG genes IMPC data status"
                  data={data.orthologPieData}
                  chartColors={["rgb(247, 157, 70)", "rgb(194, 194, 194)"]}
                />
              </div>
            </Col>
            <Col xs={6}>
              <div style={{ position: "relative", height: "300px" }}>
                <Bar
                  options={idgGenesProductionStatusOptions}
                  data={idgGenesProductionStatusData}
                />
              </div>
            </Col>
          </Row>
        </Card>
        <Card>
          <h3>IMPC IDG data Heat Map</h3>
          <p>
            The heat map indicates the detailed IDG gene data representation in
            IMPC, from product availability to phenotypes. Phenotypes are
            grouped by biological systems.
          </p>
          <table className="mb-4">
            <tbody>
              <tr>
                <td>
                  <div className={styles.significant}>&nbsp;</div>
                  <div className="table_legend_key">Significant</div>
                </td>
                <td>
                  <div className={styles.notSignificant}>&nbsp;</div>
                  <div className="table_legend_key">Not Significant</div>
                </td>
                <td>
                  <div className={styles.noData}>&nbsp;</div>
                  <div className="table_legend_key">No data</div>
                </td>
              </tr>
            </tbody>
          </table>
          {isFetching ? (
            <div
              className="mt-4"
              style={{ display: "flex", justifyContent: "center" }}
            >
              <LoadingProgressBar />
            </div>
          ) : (
            <HeatMap geneList={geneList} />
          )}
        </Card>
        <Card>
          <h2>Phenotype Associations</h2>
          <p>
            The following chord diagrams represent the various biological
            systems phenotype associations for IDG genes categorized both in all
            and in each family group. The line thickness is correlated with the
            strength of the association. Clicking on chosen phenotype(s) on the
            diagram allow to select common genes. Corresponding gene lists can
            be downloaded using the download icon.
          </p>
        </Card>
        <Card>
          <h3>All families</h3>
          <p>
            <b>{data.allFamiliesChordData.totalcount}</b> genes have phenotypes
            in more than one biological system. The chord diagram below shows
            the pleiotropy between these genes.
            <br />
            <a
              className="link primary"
              href="https://www.mousephenotype.org/data/chordDiagram.csv?&idg=true"
              download="genes_phenotype_associations.csv"
            >
              Get the genes and associated phenotypes.
            </a>
          </p>
          <ChordDiagram
            labels={data.allFamiliesChordData.labels}
            data={data.allFamiliesChordData.matrix}
          />
        </Card>
        <Card>
          <h3>Ion channels</h3>
          <FamilyDataTable data={data.ionChannelChordData} />
          <button
            className="btn impc-primary-button mb-3"
            style={{ width: "fit-content" }}
            onClick={() => ionChannelsTableRef.current?.toggleVisibility()}
          >
            View all {data.ionChannelChordData.genesCount} IMPC/IDG Ion Channel
            genes
          </button>
          <AccordionTable
            type="IonChannel"
            geneList={geneList}
            ref={ionChannelsTableRef}
          />
          <p>
            <b>{data.ionChannelChordData.totalcount}</b> genes have phenotypes
            in more than one biological system. The chord diagram below shows
            the pleiotropy between these genes.
            <br />
            <a
              className="link primary"
              href="https://www.mousephenotype.org/data/chordDiagram.csv?&idg=true&idgClass=IonChannel"
              download="genes_phenotype_associations.csv"
            >
              Get the genes and associated phenotypes.
            </a>
          </p>
          <ChordDiagram
            labels={data.ionChannelChordData.labels}
            data={data.ionChannelChordData.matrix}
          />
        </Card>
        <Card>
          <h3>GPCRs</h3>
          <FamilyDataTable data={data.GPCRChordData} />
          <button
            className="btn impc-primary-button mb-3"
            style={{ width: "fit-content" }}
            onClick={() => gpcrTableRef.current?.toggleVisibility()}
          >
            View all {data.GPCRChordData.genesCount} IMPC/IDG GPCR genes
          </button>
          <AccordionTable type="GPCR" geneList={geneList} ref={gpcrTableRef} />
          <p>
            <b>{data.GPCRChordData.totalcount}</b> genes have phenotypes in more
            than one biological system. The chord diagram below shows the
            pleiotropy between these genes.
            <br />
            <a
              className="link primary"
              href="https://www.mousephenotype.org/data/chordDiagram.csv?&idg=true&idgClass=IonChannel"
              download="genes_phenotype_associations.csv"
            >
              Get the genes and associated phenotypes.
            </a>
          </p>
          <ChordDiagram
            labels={data.GPCRChordData.labels}
            data={data.GPCRChordData.matrix}
          />
        </Card>
        <Card>
          <h3>Kinases</h3>
          <FamilyDataTable data={data.kinaseChordData} />
          <button
            className="btn impc-primary-button mb-3"
            style={{ width: "fit-content" }}
            onClick={() => kinasesTableRef.current?.toggleVisibility()}
          >
            View all {data.kinaseChordData.genesCount} IMPC/IDG Kinase genes
          </button>
          <AccordionTable
            type="Kinase"
            geneList={geneList}
            ref={kinasesTableRef}
          />
          <p>
            <b>{data.kinaseChordData.totalcount}</b> genes have phenotypes in
            more than one biological system. The chord diagram below shows the
            pleiotropy between these genes.
            <br />
            <a
              className="link primary"
              href="https://www.mousephenotype.org/data/chordDiagram.csv?&idg=true&idgClass=IonChannel"
              download="genes_phenotype_associations.csv"
            >
              Get the genes and associated phenotypes.
            </a>
          </p>
          <ChordDiagram
            labels={data.kinaseChordData.labels}
            data={data.kinaseChordData.matrix}
          />
        </Card>
      </Container>
    </>
  );
};

export default IDGPage;
