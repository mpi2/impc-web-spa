"use client";

import { AlleleSymbol, Search } from "@/components";
import styles from "../../styles.module.scss";
import {
  Accordion,
  Badge,
  Card,
  Col,
  Container,
  Modal,
  Row,
} from "react-bootstrap";
import { useGeneSummaryQuery, useHistopathologyQuery } from "@/hooks";
import { PlainTextCell, SmartTable } from "@/components/SmartTable";
import {
  Histopathology,
  HistopathologyResponse,
  SortType,
  TableCellProps,
} from "@/models";
import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faExternalLinkAlt,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import _ from "lodash";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import { GeneSummary } from "@/models/gene";

const DescriptionCell = <T extends Histopathology>(
  props: TableCellProps<T> & { maxChars?: number; onClick: (data: T) => void },
) => {
  const maxChars = props.maxChars || 50;
  const truncated = props.value?.description.length > maxChars;
  const description = truncated
    ? props.value?.description.substring(0, maxChars) + "..."
    : props.value?.description;
  return (
    <span
      role={truncated ? "link" : "generic"}
      onClick={props.onClick.bind(this, props?.value)}
      style={
        truncated
          ? { cursor: "pointer", color: "#138181", textDecoration: "underline" }
          : {}
      }
    >
      {description}
    </span>
  );
};

type HistopathChartPageProps = {
  gene: GeneSummary;
  histopathologyData: HistopathologyResponse;
};

const HistopathChartPage = ({
  gene: geneFromServer,
  histopathologyData,
}: HistopathChartPageProps) => {
  const router = useRouter();
  const params = useParams<{ pid: string }>();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const mgiGeneAccessionId = decodeURIComponent(params.pid);
  const [selectedAnatomy, setSelectedAnatomy] = useState<string>(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedTissue, setSelectedTissue] = useState<Histopathology>(null);
  const { data: gene } = useGeneSummaryQuery(
    mgiGeneAccessionId,
    !!mgiGeneAccessionId,
    geneFromServer,
  );
  const { data, isLoading } = useHistopathologyQuery(
    mgiGeneAccessionId,
    !!mgiGeneAccessionId && !!gene,
    histopathologyData,
  );
  const anatomyParam = searchParams.get("anatomy");

  const defaultSort: SortType = useMemo(() => ["tissue", "asc"], []);

  useEffect(() => {
    setSelectedAnatomy(anatomyParam as string);
  }, [anatomyParam]);

  const displayDescriptionModal = (item: Histopathology) => {
    setSelectedTissue(item);
    setShowDescriptionModal(true);
  };

  const hideDescriptionModal = () => {
    setShowDescriptionModal(false);
  };

  const removeAnatomyFilter = () => {
    setSelectedAnatomy(null);
    const searchParamsTemp = new URLSearchParams(searchParams?.toString());
    searchParamsTemp.delete("anatomy");
    router.replace(`${pathName}${searchParamsTemp}`, undefined);
  };

  const filterHistopathology = (
    { tissue, freeText }: Histopathology,
    query: string,
  ) => !query || `${tissue} ${freeText}`.toLowerCase().includes(query);

  const filteredData = !!selectedAnatomy
    ? data?.histopathologyData?.filter(
        (item) => item.tissue.toLowerCase() === anatomyParam,
      )
    : data?.histopathologyData;

  return (
    <>
      <Search />
      <Container className="page">
        <Card>
          <div className={styles.subheading}>
            <span className={`${styles.subheadingSection} primary`}>
              <Link
                href={`/genes/${mgiGeneAccessionId}#images`}
                className="mb-3"
                style={{
                  textTransform: "none",
                  fontWeight: "normal",
                  letterSpacing: "normal",
                  fontSize: "1.15rem",
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                &nbsp; Go Back to{" "}
                <i>
                  {gene?.geneSymbol || (
                    <Skeleton style={{ width: "50px" }} inline />
                  )}
                </i>
              </Link>
            </span>
          </div>
          <h1 className="mb-4 mt-2" data-testid="main-header">
            <strong className="text-capitalize">
              Histopathology data for <i>{gene?.geneSymbol}</i>
            </strong>
          </h1>
          <Accordion style={{ marginBottom: "1.5rem" }}>
            <Accordion.Item eventKey="score">
              <Accordion.Header>Score Definitions</Accordion.Header>
              <Accordion.Body>
                <b>Severity Score:</b>
                <ul>
                  <li>0 = Normal</li>
                  <li>
                    1 = Mild (observation barely perceptible and not believed to
                    have clinical significance)
                  </li>
                  <li>
                    2 = Moderate (observation visible but involves minor
                    proportion of tissue and clinical consequences of
                    observation are most likely subclinical)
                  </li>
                  <li>
                    3 = Marked (observation clearly visible involves a
                    significant proportion of tissue and is likely to have some
                    clinical manifestations generally expected to be minor)
                  </li>
                  <li>
                    4 = Severe (observation clearly visible involves a major
                    proportion of tissue and clinical manifestations are likely
                    associated with significant tissue dysfunction or damage)
                  </li>
                </ul>
                <b>Significance Score:</b>
                <ul>
                  <li>
                    0 = <i>Not significant</i>: Interpreted by the
                    histopathologist to be a finding attributable to background
                    strain (e.g. low-incidence hydrocephalus, microphthalmia) or
                    incidental to mutant phenotype (e.g. hair-induced glossitis,
                    focal hyperplasia, mild mononuclear cell infiltrate).
                  </li>
                  <li>
                    1 = <i>Significant</i>: Interpreted by the histopathologist
                    as a finding not attributable to background strain and not
                    incidental to mutant phenotype.
                  </li>
                </ul>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
          <SmartTable<Histopathology>
            data={filteredData}
            defaultSort={defaultSort}
            showLoadingIndicator={isLoading}
            filterFn={filterHistopathology}
            customFiltering={!!selectedAnatomy}
            additionalTopControls={
              selectedAnatomy ? (
                <span
                  style={{ cursor: "pointer" }}
                  onClick={removeAnatomyFilter}
                  data-testid="anatomy-badge"
                >
                  Showing only tissue data for:&nbsp;
                  <Badge
                    pill
                    bg="secondary"
                    style={{ fontSize: "1.1rem", textTransform: "capitalize" }}
                  >
                    {selectedAnatomy}
                    &nbsp;
                    <FontAwesomeIcon icon={faXmark} />
                  </Badge>
                </span>
              ) : (
                <></>
              )
            }
            columns={[
              {
                width: 1,
                label: "Tissue",
                field: "tissue",
                cmp: <PlainTextCell />,
              },
              {
                width: 1,
                label: "Zyg",
                field: "zygosity",
                cmp: <PlainTextCell style={{ textTransform: "capitalize" }} />,
              },
              {
                width: 1,
                label: "Mouse",
                field: "specimenNumber",
                cmp: <PlainTextCell />,
              },
              {
                width: 1,
                label: "Description",
                field: "description",
                cmp: <DescriptionCell onClick={displayDescriptionModal} />,
              },
              {
                width: 1,
                label: "MPATH Term",
                field: "mPathTerm",
                cmp: <PlainTextCell />,
              },
              {
                width: 1,
                label: "Severity Score",
                field: "severityScore",
                cmp: <PlainTextCell />,
              },
              {
                width: 1,
                label: "Significance Score",
                field: "significanceScore",
                cmp: <PlainTextCell />,
              },
              {
                width: 1,
                label: "PATO Descriptor",
                field: "descriptorPATO",
                cmp: <PlainTextCell />,
              },
              {
                width: 1,
                label: "Free Text",
                field: "freeText",
                cmp: <PlainTextCell />,
              },
            ]}
          />
          {!_.isEmpty(data?.images) ? (
            <>
              <h2>Histopathology images</h2>
              <Row>
                <Accordion defaultActiveKey={["0"]}>
                  {Object.keys(data.images).map((tissue, index) => (
                    <Accordion.Item key={tissue} eventKey={index.toString()}>
                      <Accordion.Header>{tissue}</Accordion.Header>
                      <Accordion.Body>
                        <Row>
                          {data.images[tissue].map((image, index) => (
                            <Col
                              key={index}
                              style={{
                                textAlign: "center",
                                display: "flex",
                                flexDirection: "column",
                                rowGap: "0.3rem",
                                marginBottom: "1rem",
                              }}
                              xs={4}
                            >
                              <a
                                href={`//www.ebi.ac.uk/mi/media/omero/webgateway/render_image/${image.omeroId}`}
                                target="_blank"
                              >
                                <img
                                  style={{
                                    cursor: "pointer",
                                    alignSelf: "center",
                                  }}
                                  src={image.thumbnailUrl}
                                  alt=""
                                />
                              </a>
                              <AlleleSymbol
                                symbol={image.alleleSymbol}
                                withLabel={false}
                              />
                              <span>Mouse {image.specimenNumber}</span>
                              <span>
                                <a
                                  className="primary link"
                                  target="_blank"
                                  href={`https://ontobee.org/ontology/MA?iri=http://purl.obolibrary.org/obo/${image.maId}`}
                                >
                                  {image.maTerm}
                                </a>
                                &nbsp;
                                <FontAwesomeIcon
                                  icon={faExternalLinkAlt}
                                  className="grey"
                                  size="xs"
                                />
                              </span>
                            </Col>
                          ))}
                        </Row>
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Row>
            </>
          ) : null}

          <Modal
            show={showDescriptionModal}
            onHide={hideDescriptionModal}
            onExited={() => setSelectedTissue(null)}
          >
            <Modal.Header closeButton>
              {selectedTissue?.tissue} description for mouse{" "}
              {selectedTissue?.specimenNumber}
            </Modal.Header>
            <Modal.Body>{selectedTissue?.description}</Modal.Body>
          </Modal>
        </Card>
      </Container>
    </>
  );
};

export default HistopathChartPage;
