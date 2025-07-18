import styles from "./styles.module.scss";
import { Alert, Badge, Col, Container, Row, Spinner } from "react-bootstrap";
import {
  faCaretUp,
  faCheck,
  faCross,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useNavigate } from "react-router";
import Card from "../Card";

import Pagination from "../Pagination";
import { PhenotypeSearchItem } from "@/models/phenotype";
import { BodySystem } from "@/components/BodySystemIcon";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { surroundWithMarkEl } from "@/utils/results-page";
import { usePhenotypeResultsQuery, useSearchWebWorker } from "@/hooks";
import classNames from "classnames";
import { DATA_SITE_BASE_PATH } from "@/shared";
import { usePhenotypeSearchResultWorker } from "@/workers/usePhenotypeSearchResultWorker.ts";

type Props = {
  phenotype: PhenotypeSearchItem;
  query: string | undefined;
};

const FilterBadge = ({
  children,
  onClick,
  icon,
  isSelected,
}: {
  children: ReactNode;
  onClick: () => void;
  icon?: any;
  isSelected: boolean;
}) => (
  <Badge
    className={`badge ${isSelected ? "active" : ""} `}
    pill
    bg="badge-secondary"
    onClick={onClick}
  >
    {children}&nbsp;
    {!!icon ? <FontAwesomeIcon icon={icon} /> : null}
  </Badge>
);
const PhenotypeResult = ({
  phenotype: {
    mpId,
    phenotypeName,
    synonyms,
    geneCountNum,
    topLevelParentsArray,
  },
  query,
}: Props) => {
  const navigate = useNavigate();
  const synonymsArray = synonyms.split(";");
  return (
    <>
      <Row
        className={styles.result}
        onClick={() => {
          navigate(`/${DATA_SITE_BASE_PATH}/phenotypes/${mpId}`);
        }}
      >
        <Col>
          <h4 className="mb-2 blue-dark">
            {surroundWithMarkEl(phenotypeName, query)}
          </h4>
          <p className="grey small">
            <strong>Synomyms:</strong>{" "}
            {surroundWithMarkEl(synonymsArray.join(", "), query)}
          </p>
          {!!geneCountNum && geneCountNum !== 0 ? (
            <p className="small grey">
              <FontAwesomeIcon className="secondary" icon={faCheck} />{" "}
              <strong>{geneCountNum}</strong> genes associated with this
              phenotype
            </p>
          ) : (
            <p className="grey small">
              <FontAwesomeIcon className="grey" icon={faCross} /> No IMPC genes
              currently associated with this phenotype
            </p>
          )}
        </Col>
        <Col>
          <p className="grey small">Physiological System</p>
          {topLevelParentsArray.map((x) => (
            <BodySystem
              key={x.mpId}
              name={x.mpTerm}
              hoverColor="black"
              color="black"
              isSignificant
            />
          ))}
          {topLevelParentsArray.length === 0 && (
            <BodySystem
              key={mpId}
              name={phenotypeName}
              hoverColor="black"
              color="black"
              isSignificant
            />
          )}
        </Col>
      </Row>
      <hr className="mt-0 mb-0" />
    </>
  );
};

type PhenotypeResultsProps = {
  query?: string;
  stale: boolean;
};

const PhenotypeResults = ({ query, stale }: PhenotypeResultsProps) => {
  const [sort, setSort] = useState<"asc" | "desc" | null>(null);
  const [sortGenes, setSortGenes] = useState<"asc" | "desc" | null>(null);
  const updateSortByOntology = (value: "asc" | "desc") => {
    setSortGenes(null);
    setSort(value);
  };

  const updateSortByGenes = (value: "asc" | "desc") => {
    setSort(null);
    setSortGenes(value);
  };

  const { data, isLoading } = usePhenotypeResultsQuery();

  const { eventResult, sendMessage } = usePhenotypeSearchResultWorker();
  const { indexLoaded, searchResultIds, noMatches, isSearching, sendQuery } =
    useSearchWebWorker(eventResult, sendMessage);

  useEffect(() => {
    if (query) {
      sendQuery(query);
    }
  }, [query]);

  const filteredData = useMemo(() => {
    if (noMatches) {
      return [];
    }
    if (query && searchResultIds.length) {
      return data?.filter((gene) => searchResultIds.includes(gene.mpId));
    } else {
      return data;
    }
  }, [data, query, searchResultIds, noMatches]);

  const sortedData = useMemo(() => {
    if (!!sortGenes || !!sort) {
      return filteredData.sort(
        (
          { intermediateLevelParentsArray: p1, geneCountNum: count1 },
          { intermediateLevelParentsArray: p2, geneCountNum: count2 },
        ) => {
          if (sort) {
            return sort === "asc"
              ? p1.length - p2.length
              : p2.length - p1.length;
          } else {
            return sortGenes === "asc" ? count1 - count2 : count2 - count1;
          }
        },
      );
    }
    return filteredData;
  }, [sort, sortGenes, filteredData]);

  return (
    <Container style={{ maxWidth: 1240 }}>
      <Card
        style={{
          marginTop: -80,
          position: "relative",
        }}
      >
        <div
          className={classNames("search-overlay", {
            active: stale || !indexLoaded || isSearching,
          })}
        >
          <Spinner animation="border" />
        </div>
        <h1 style={{ marginBottom: 0 }}>
          <strong>Phenotype search results</strong>
        </h1>
        {!!query && !isLoading && (
          <p className="grey">
            <small>
              Found {sortedData?.length || 0} entries{" "}
              {!!query && (
                <>
                  matching <strong>"{query}"</strong>
                </>
              )}
            </small>
          </p>
        )}
        {isLoading ? (
          <div className="grey mt-3 mb-3">
            Loading&nbsp;
            <Spinner animation="border" size="sm" />
          </div>
        ) : (
          <Pagination
            data={sortedData}
            additionalTopControls={
              <div className="filtersWrapper">
                Sort by:
                <div className="filter">
                  <strong>Ontology level:</strong>
                  <FilterBadge
                    isSelected={sort === "asc"}
                    icon={faCaretUp}
                    onClick={() => updateSortByOntology("asc")}
                  >
                    Asc.
                  </FilterBadge>
                  <FilterBadge
                    isSelected={sort === "desc"}
                    icon={faCaretDown}
                    onClick={() => updateSortByOntology("desc")}
                  >
                    Desc.
                  </FilterBadge>
                </div>
                <div className="filter">
                  <strong>No. of genes</strong>
                  <FilterBadge
                    isSelected={sortGenes === "asc"}
                    icon={faCaretUp}
                    onClick={() => updateSortByGenes("asc")}
                  >
                    Asc.
                  </FilterBadge>
                  <FilterBadge
                    isSelected={sortGenes === "desc"}
                    icon={faCaretDown}
                    onClick={() => updateSortByGenes("desc")}
                  >
                    Desc.
                  </FilterBadge>
                </div>
              </div>
            }
          >
            {(pageData) => {
              if (pageData.length === 0) {
                return (
                  <Alert variant="yellow">
                    <p>No results found.</p>
                  </Alert>
                );
              }
              return (
                <>
                  {pageData.map((p) => (
                    <PhenotypeResult
                      phenotype={p}
                      key={p.entityId}
                      query={query}
                    />
                  ))}
                </>
              );
            }}
          </Pagination>
        )}
      </Card>
    </Container>
  );
};

export default PhenotypeResults;
