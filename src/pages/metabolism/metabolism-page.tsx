"use client";

import { Breadcrumb, Col, Container, Row } from "react-bootstrap";
import data from "../../mocks/data/landing-pages/metabolism.json";
import metabolismTableData from "../../mocks/data/landing-pages/metabolism-table.json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVenus, faMars } from "@fortawesome/free-solid-svg-icons";
import styles from "./styles.module.scss";
import { Suspense, useMemo, useState } from "react";
import {
  PlainTextCell,
  SmartTable,
  LinkCell,
  OptionsCell,
} from "@/components/SmartTable";
import {
  PublicationDataAlert,
  Search,
  Card,
  PleiotropyChart,
} from "@/components";
import PublicationsList from "@/components/PublicationsList";
import { usePleiotropyQuery } from "@/hooks";
import { ParentSize } from "@visx/responsive";
import { SortType } from "@/models";
import { Metadata } from "next";

export type MetabolismGeneData = {
  Parameter: string;
  Sex: string;
  MGI_ID: string;
  NCBI_ID: number;
  Gene_symbol: string;
  Center: string;
  Zygosity: string;
  Ratio_KO_WT: string;
  tag: string;
};

const geneTableData = [
  ["Fasting Glucose (T0)", 94, 96, 96, 96],
  ["Glucose Response (AUC)", 96, 96, 96, 96],
  ["Triglycerides (TG)", 72, 72, 72, 72],
  ["Body Mass (BM)", 86, 86, 86, 86],
  ["Metabolic Rate (RM)", 18, 48, 18, 48],
  ["Oxygen Consumption Rate (V02)", 18, 48, 18, 48],
  ["Respiratory Exchange Ratio (RER)", 17, 47, 17, 47],
];

const MetabolismLandingPage = () => {
  const genesData = metabolismTableData as Array<MetabolismGeneData>;
  const [parameter, setParameter] = useState<number>(null);
  const [sex, setSex] = useState<"male" | "female">(null);
  const [outlier, setOutlier] = useState<"5" | "95">(null);
  const defaultSort: SortType = useMemo(() => ["Ratio_KO_WT", "asc"], []);

  const setSelection = (
    parameterIndex: number,
    sex: "male" | "female",
    outlier: "5" | "95",
  ) => {
    setParameter(parameterIndex);
    setSex(sex);
    setOutlier(outlier);
  };

  const getParameterLabelByIndex = (index: number) => {
    const labels = ["t0", "auc", "tg", "bm", "mr", "vo2", "rer"];
    return labels[index];
  };

  const getOutlierByState = (value) => {
    if (value === "5") {
      return "below5";
    } else {
      return "above95";
    }
  };

  const hasSelectedACell = parameter !== null && !!sex && !!outlier;
  const filteredData = hasSelectedACell
    ? genesData
        .filter((item) => {
          const isSameParameter =
            item.Parameter === getParameterLabelByIndex(parameter);
          const isSameSex = item.Sex === sex;
          const isSameOutlier = item.tag === getOutlierByState(outlier);
          return isSameParameter && isSameSex && isSameOutlier;
        })
        .map((item) => {
          return {
            ...item,
            Ratio_KO_WT: Number.parseFloat(item.Ratio_KO_WT).toFixed(3),
          };
        })
    : [];

  const { data: pleiotropyData, isLoading } = usePleiotropyQuery(
    "homeostasis/metabolism",
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
              <Breadcrumb.Item active>Homeostasis/Metabolism</Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <h1 className="mb-4 mt-2">
            <strong>
              The IMPC is increasing our understanding of the genetic basis for
              metabolic diseases
            </strong>
          </h1>
          <PublicationDataAlert dataReleaseVersion="4.2" />
          <Container>
            <Row>
              <Col xs={12}>
                <ul>
                  <li>
                    Metabolic diseases, such as obesity and diabetes, affect
                    people worldwide
                  </li>
                  <li>
                    The function of many genes in the genome is still unknown
                  </li>
                  <li>
                    Knockout mice allow us to understand metabolic procedures
                    and relate them to human disease
                  </li>
                </ul>
              </Col>
            </Row>
          </Container>
        </Card>
        <Card>
          <h1 className="mb-4 mt-2">
            <strong>Approach</strong>
          </h1>
          <p>
            To identify the function of genes, the IMPC uses a series of
            standardised protocols described in&nbsp;
            <a
              className="primary link"
              href="https://www.mousephenotype.org/impress"
            >
              IMPReSS
            </a>{" "}
            (International Mouse Phenotyping Resource of Standardised Screens).
            Tests addressing the metabolic function are conducted on young adult
            mice at 11-16 weeks of age.
          </p>
          <h2>Procedures that can lead to relevant phenotype associations</h2>
          <span>Young Adult:</span>
          <ul>
            {data.proceduresYoungAdult.map((prod, index) => (
              <li key={index}>
                {prod.title}:&nbsp;
                {prod.items.map((item, indexItems) => (
                  <a
                    key={indexItems}
                    className="primary link"
                    href={`//www.mousephenotype.org/impress/protocol/${item.procedureId}`}
                  >
                    {item.name},&nbsp;
                  </a>
                ))}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2>IMPC Metabolism Publication</h2>
          <h3>Metabolic diseases investigated in 2,016 knockout mouse lines</h3>
          <p>
            <a className="link primary" href="https://bit.ly/IMPCMetabolism">
              Nature Communications publication
            </a>
          </p>
          <ul>
            <li>
              974 genes were identified with strong metabolic phenotypes (see
              gene table, below).
            </li>
            <li>
              429 genes had not been previously associated with metabolism, 51
              completely lacked functional annotation, and 25 had single
              nucleotide polymorphisms associated to human metabolic disease
              phenotypes.
            </li>
            <li>515 genes linked to at least one disease in OMIM.</li>
            <li>
              Networks of co-regulated genes were identified, and genes of
              predicted metabolic function found.
            </li>
            <li>
              Pathway mapping revealed sexual dimorphism in genes and pathways.
            </li>
            <li>
              This investigation is based on about 10% of mammalian
              protein-coding genes. The IMPC will continue screening for genes
              associated to metabolic diseases in its second 5 year phase.
            </li>
          </ul>
        </Card>
        <Card>
          <h2>Gene table</h2>
          <p>
            Mutant/wildtype ratios below the 5th percentile and above the 95th
            percentile of the ratio distributions yielded 28 gene lists that
            serve as a data mining resource for further investigation into
            potential links to human metabolic disorders.
          </p>
          <p>
            By hovering over the table you can select cells and click to explore
            the underlying data.
          </p>
          <div
            style={{ minWidth: "50%", textAlign: "center", margin: "0 auto" }}
          >
            <table className={`table ${styles.geneTable}`}>
              <tbody>
                <tr>
                  <td></td>
                  <td colSpan={4}>Outlier</td>
                </tr>
                <tr>
                  <td></td>
                  <td colSpan={2}> &lt;5%</td>
                  <td colSpan={2}> &gt;95% </td>
                </tr>
                <tr>
                  <td></td>
                  <td>
                    <FontAwesomeIcon icon={faVenus} />
                  </td>
                  <td>
                    <FontAwesomeIcon icon={faMars} />
                  </td>
                  <td>
                    <FontAwesomeIcon icon={faVenus} />
                  </td>
                  <td>
                    <FontAwesomeIcon icon={faMars} />
                  </td>
                </tr>
                {geneTableData.map((data, index) => (
                  <tr key={data[0]}>
                    <td>{data[0]}</td>
                    <td
                      className={styles.dataCell}
                      onClick={() => setSelection(index, "female", "5")}
                    >
                      {data[1]}
                    </td>
                    <td
                      className={styles.dataCell}
                      onClick={() => setSelection(index, "male", "5")}
                    >
                      {data[2]}
                    </td>
                    <td
                      className={styles.dataCell}
                      onClick={() => setSelection(index, "female", "95")}
                    >
                      {data[3]}
                    </td>
                    <td
                      className={styles.dataCell}
                      onClick={() => setSelection(index, "male", "95")}
                    >
                      {data[4]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            style={{ minWidth: "80%", textAlign: "center", margin: "0 auto" }}
          >
            {!!hasSelectedACell ? (
              <SmartTable<MetabolismGeneData>
                data={filteredData}
                defaultSort={defaultSort}
                columns={[
                  {
                    width: 1,
                    label: "Parameter",
                    field: "Parameter",
                    cmp: (
                      <PlainTextCell style={{ textTransform: "uppercase" }} />
                    ),
                  },
                  {
                    width: 1,
                    label: "Sex",
                    field: "Sex",
                    cmp: <PlainTextCell />,
                  },
                  {
                    width: 1,
                    label: "MGI_ID",
                    field: "MGI_ID",
                    cmp: <LinkCell prefix="/genes" />,
                  },
                  {
                    width: 1,
                    label: "Gene symbol",
                    field: "Gene_symbol",
                    cmp: <PlainTextCell style={{ fontStyle: "italic" }} />,
                  },
                  {
                    width: 1,
                    label: "Center",
                    field: "Center",
                    cmp: <PlainTextCell />,
                  },
                  {
                    width: 1,
                    label: "Zygosity",
                    field: "Zygosity",
                    cmp: <PlainTextCell />,
                  },
                  {
                    width: 1,
                    label: "Ratio KO WT",
                    field: "Ratio_KO_WT",
                    cmp: <PlainTextCell />,
                  },
                  {
                    width: 1,
                    label: "Tag",
                    field: "tag",
                    cmp: (
                      <OptionsCell
                        options={{ below5: "< 5%", above95: "> 95%" }}
                      />
                    ),
                  },
                ]}
              />
            ) : null}
          </div>
        </Card>
        <Card>
          <h2>Strong metabolic phenotype genes form regulatory networks</h2>
          <Container>
            <Row>
              <Col>
                <img
                  src="/data/images/more-cassette.png"
                  alt="Illustration of the action of MORE cassettes in regulatory networks"
                  width="100%"
                />
              </Col>
              <Col>
                <ul>
                  <li>
                    Transcriptional co-regulation often involves a common set of
                    transcription factor binding sites (TFBSs) shared between
                    co-regulated promoters and in a particular organization
                    (known as Multiple Organized Regulatory Element
                    (MORE)–cassettes).
                  </li>
                  <li>
                    Identification of shared MORE-cassettes in promoters of
                    candidate genes allowed to discover extensive metabolic
                    phenotype-associated networks of potentially co-regulated
                    genes.
                  </li>
                  <li>
                    MORE-cassettes are invariant genomic sequence features
                    (similar to reading frames).
                  </li>
                  <li>
                    The presence of MORE-cassettes enabled to a priori predict
                    phenotypes and identify genes potentially linked to
                    metabolic functions.
                  </li>
                </ul>
              </Col>
            </Row>
          </Container>
        </Card>
        <Card>
          <h2>Methods</h2>
          <p>
            Genes with phenotypes associated to the following{" "}
            <b>seven metabolic parameters</b>, with diagnostic relevance in
            human clinical research, were further analysed:
          </p>
          <ul>
            <li>
              Fasting basal blood glucose level before glucose tolerance test
              (T0)
            </li>
            <li>
              Area under the curve of blood glucose level after intraperitoneal
              glucose administration relative to basal blood glucose level (AUC)
            </li>
            <li>Plasma triglyceride levels (TG)</li>
            <li>Body mass (BM)</li>
            <li>Metabolic rate (MR)</li>
            <li>Oxygen consumption rate (VO2)</li>
            <li>
              Respiratory exchange ratio (RER) – a measure of whole-body
              metabolic fuel utilization
            </li>
          </ul>
          <p>
            Mutant/wildtype ratios (mean value of metabolic parameters of
            mutants divided by the mean value obtained for wildtypes) were
            calculated:
          </p>
          <ul>
            <li>
              Control wildtype mice from each phenotypic center included,
              matched for sex, age, phenotypic pipeline and metadata (e.g.
              instrument).
            </li>
            <li>
              Males and females analyzed separately to account for sexual
              dimorphism.
            </li>
          </ul>
          <h3>New mouse models</h3>
          <ul>
            <li>IMPC generated and identified new genetic disease models.</li>
            <li>
              New models available to the research community to perform in-depth
              investigations of novel genetic elements associated to metabolic
              disease mechanisms.
            </li>
            <li>
              These models fill the gap between genome-wide association studies
              and functional validation using a mammalian model organism.
            </li>
          </ul>
        </Card>
        <Card>
          <h2>Phenotypes distribution</h2>
          <div style={{ position: "relative", height: "500px" }}>
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
        </Card>
        <Card>
          <Container>
            <h1>
              <strong>
                Homeostasis/metabolism IKMC/IMPC related publications
              </strong>
            </h1>
            <PublicationsList prefixQuery="metabolism" />
          </Container>
        </Card>
      </Container>
    </>
  );
};

export default MetabolismLandingPage;
