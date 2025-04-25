"use client";
import {
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Table,
  Alert,
} from "react-bootstrap";
import {
  faDownload,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { Publication } from "./types";
import styles from "./styles.module.scss";
import { useQuery } from "@tanstack/react-query";
import {
  PUBLICATIONS_ENDPOINT_URL,
  fetchPublicationEndpoint,
} from "@/api-service";
import Pagination from "../Pagination";
import { useDebounceValue } from "usehooks-ts";
import _ from "lodash";
import Link from "next/link";
import { AlleleSymbol } from "@/components";
import dynamic from "next/dynamic";

export type PublicationListProps = {
  onlyConsortiumPublications?: boolean;
  filterByGrantAgency?: string;
  prefixQuery?: string;
};

const PublicationsList = (props: PublicationListProps) => {
  const {
    onlyConsortiumPublications,
    filterByGrantAgency,
    prefixQuery = "",
  } = props;
  const [abstractVisibilityMap, setAbstractVisibilityMap] = useState(new Map());
  const [meshTermsVisibilityMap, setMeshVisibilityMap] = useState(new Map());
  const [allelesVisibilityMap, setAllelesVisibilityMap] = useState(new Map());
  const displayPubTitle = (pub: Publication) => {
    if (pub.doi) {
      return (
        <p className={styles.title}>
          <a
            className="primary link"
            target="_blank"
            href={`https://doi.org/${pub.doi}`}
            dangerouslySetInnerHTML={{ __html: pub.title }}
          />
          &nbsp;
          <FontAwesomeIcon
            icon={faExternalLinkAlt}
            className="grey"
            size="xs"
          />
        </p>
      );
    }
    return (
      <p
        style={{ fontWeight: "bold" }}
        dangerouslySetInnerHTML={{ __html: pub.title }}
      />
    );
  };

  const displayPubDate = (pub: Publication) => {
    return moment(pub.publicationDate).format("DD-MM-YYYY");
  };

  const getGrantsList = (pub: Publication) => {
    if (pub.grantsList && pub.grantsList.length > 0) {
      return (
        <p>
          Grant agency:{" "}
          {_.uniq(pub.grantsList.map((grant) => grant.agency)).join(", ")}
        </p>
      );
    }
    return null;
  };

  const getListOfAlleles = (pub: Publication) => {
    return isFieldVisible(pub, "alleles")
      ? pub.alleles
      : pub.alleles.slice(0, 8);
  };
  const getMapByType = (type: "abstract" | "mesh-terms" | "alleles") => {
    switch (type) {
      case "abstract":
        return { map: abstractVisibilityMap, setFn: setAbstractVisibilityMap };
      case "alleles":
        return { map: allelesVisibilityMap, setFn: setAllelesVisibilityMap };
      case "mesh-terms":
        return { map: meshTermsVisibilityMap, setFn: setMeshVisibilityMap };
    }
  };
  const isFieldVisible = (
    pub: Publication,
    type: "abstract" | "mesh-terms" | "alleles",
  ) => {
    const { map } = getMapByType(type);
    return !(!map.has(pub.pmId) || map.get(pub.pmId) === "not-visible");
  };
  const toggleVisibility = (
    pub: Publication,
    type: "abstract" | "mesh-terms" | "alleles",
  ) => {
    const { map, setFn } = getMapByType(type);
    if (!map.has(pub.pmId) || map.get(pub.pmId) === "not-visible") {
      map.set(pub.pmId, "visible");
    } else {
      map.set(pub.pmId, "not-visible");
    }
    setFn(new Map(map));
  };
  const getDownloadLink = (type: "tsv" | "xls") => {
    let url = `${PUBLICATIONS_ENDPOINT_URL}/api/v1/publications/download?contentType=${type}`;
    if (debounceQuery) {
      url += `&searchQuery=${prefixQuery} ${debounceQuery}`;
    } else if (prefixQuery) {
      url += `&searchQuery=${prefixQuery}`;
    }
    if (onlyConsortiumPublications) {
      url += `&consortiumPaper=true`;
    }
    return url;
  };

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [query, setQuery] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [debounceQuery, setDebouncedQuery] = useDebounceValue<string>(
    query,
    500,
  );
  const {
    data: publications,
    isError,
    isFetching,
  } = useQuery({
    queryKey: [
      "publications",
      prefixQuery,
      debounceQuery,
      page,
      pageSize,
      onlyConsortiumPublications,
      filterByGrantAgency,
    ],
    queryFn: () => {
      let url = `/api/v1/publications?page=${page}&size=${pageSize}`;
      if (!!onlyConsortiumPublications) {
        url = `/api/v1/publications/by_consortium_paper?consortiumPaper=true&page=${page}&size=${pageSize}`;
      }
      if (!!filterByGrantAgency) {
        url = `/api/v1/publications/by_agency?grantAgency=${filterByGrantAgency}&page=${page}&size=${pageSize}`;
      }
      if (debounceQuery) {
        url += `&searchQuery=${prefixQuery} ${debounceQuery}`;
      } else if (prefixQuery) {
        url += `&searchQuery=${prefixQuery}`;
      }

      return fetchPublicationEndpoint(url);
    },
    select: (response) => {
      const prevTotalItems = totalItems;
      const currentTotalItems = response.totalElements;
      if (prevTotalItems !== currentTotalItems) {
        setTotalItems(response.totalElements);
      }
      return response.content as Array<Publication>;
    },
  });

  useEffect(() => {
    setDebouncedQuery(query);
    setPage(0);
  }, [query]);
  const updatePage = (value: number) => {
    setPage(value);
  };
  const updatePageSize = (value: number) => {
    setPageSize(value);
  };

  return (
    <Container>
      <Row>
        <Col xs={6}>
          <p>
            Showing {Math.min(pageSize, totalItems) * page + 1} to{" "}
            {Math.min(pageSize, totalItems) * (page + 1)} of{" "}
            {totalItems.toLocaleString()} entries
          </p>
        </Col>
      </Row>
      {!!isError && (
        <Alert variant="primary">
          No publications found that use IMPC mice or data for the filters
        </Alert>
      )}
      <Pagination
        data={publications}
        totalItems={totalItems}
        page={page}
        pageSize={pageSize}
        onPageChange={updatePage}
        onPageSizeChange={updatePageSize}
        controlled
        buttonsPlacement="both"
        additionalTopControls={
          <>
            <div>
              <InputGroup>
                <InputGroup.Text id="filter-label">Filter</InputGroup.Text>
                <Form.Control
                  id="filter"
                  aria-labelledby="filter-label"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </InputGroup>
            </div>
            <div>
              Export table:&nbsp;
              <a
                href={getDownloadLink("tsv")}
                className="btn impc-secondary-button small"
              >
                TSV
                <FontAwesomeIcon icon={faDownload}></FontAwesomeIcon>
              </a>
              &nbsp;
              <a
                href={getDownloadLink("xls")}
                className="btn impc-secondary-button small"
              >
                XLS
                <FontAwesomeIcon icon={faDownload}></FontAwesomeIcon>
              </a>
            </div>
          </>
        }
      >
        {(pageData) => (
          <Table className={styles.pubTable}>
            <tbody>
              {pageData?.map((pub: Publication) => (
                <tr key={pub.pmId} id={"pub-" + pub.pmId}>
                  <td>
                    {displayPubTitle(pub)}
                    <p>
                      <i>{pub.journalTitle}</i>, ({displayPubDate(pub)})
                    </p>
                    <p>
                      <b>{pub.authorString}</b>
                    </p>

                    {!!pub.abstractText && (
                      <>
                        <button
                          className="btn impc-secondary-button xs-small mt-2 mb-2"
                          onClick={() => toggleVisibility(pub, "abstract")}
                        >
                          <strong>
                            {isFieldVisible(pub, "abstract") ? "Hide" : "Show"}{" "}
                            abstract
                          </strong>
                        </button>
                        <p
                          className={`abstract mb-2 ${
                            isFieldVisible(pub, "abstract")
                              ? ""
                              : "visually-hidden"
                          }`}
                        >
                          {pub.abstractText}
                        </p>
                      </>
                    )}
                    <p>
                      PMID:&nbsp;
                      <a
                        className="primary link"
                        target="_blank"
                        href={`https://pubmed.ncbi.nlm.nih.gov/${pub.pmId}`}
                      >
                        {pub.pmId}
                      </a>
                      &nbsp;
                      <FontAwesomeIcon
                        icon={faExternalLinkAlt}
                        className="grey"
                        size="xs"
                      />
                    </p>
                    {!!pub.alleles && pub.alleles.length > 0 && (
                      <p className={styles.alleleList}>
                        IMPC allele:&nbsp;
                        {getListOfAlleles(pub).map((allele) => {
                          return (
                            <>
                              <Link
                                className="primary link"
                                href={`/genes/${allele.mgiGeneAccessionId}`}
                              >
                                <AlleleSymbol
                                  symbol={allele.alleleSymbol}
                                  withLabel={false}
                                />
                              </Link>
                              &nbsp; &nbsp; &nbsp;
                            </>
                          );
                        })}
                        {pub.alleles.length > 9 && (
                          <>
                            <br />
                            <button
                              className="btn impc-secondary-button xs-small mb-2 mt-1"
                              onClick={() => toggleVisibility(pub, "alleles")}
                            >
                              <strong>
                                {isFieldVisible(pub, "alleles")
                                  ? "Hide"
                                  : "Show"}{" "}
                                all alleles
                              </strong>
                            </button>
                          </>
                        )}
                      </p>
                    )}
                    {getGrantsList(pub)}
                    {!!pub.meshHeadingList &&
                      pub.meshHeadingList.length > 0 && (
                        <button
                          className="btn impc-secondary-button xs-small mt-2"
                          onClick={() => toggleVisibility(pub, "mesh-terms")}
                        >
                          <strong>
                            {isFieldVisible(pub, "mesh-terms")
                              ? "Hide"
                              : "Show"}{" "}
                            mesh terms
                          </strong>
                        </button>
                      )}
                    <p
                      className={`abstract mt-1 ${
                        isFieldVisible(pub, "mesh-terms")
                          ? ""
                          : "visually-hidden"
                      }`}
                    >
                      {pub.meshHeadingList.join(", ")}
                    </p>
                  </td>
                </tr>
              ))}
              {!!isFetching &&
                [...Array(10)].map((e, i) => (
                  <tr key={i} className={styles.pubLoader}>
                    <td>
                      <Skeleton count={9} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        )}
      </Pagination>
    </Container>
  );
};

export default PublicationsList;

export const NonSSRPublicationsList = dynamic<PublicationListProps>(
  () => import("@/components/PublicationsList"),
  { ssr: false },
);
