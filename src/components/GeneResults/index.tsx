import styles from "./styles.module.scss";
import { Alert, Col, Container, Row, Spinner } from "react-bootstrap";
import {
  faCheck,
  faShoppingCart,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router";
import Card from "../Card";
import Pagination from "../Pagination";
import { GeneSearchItem } from "@/models/gene";
import { surroundWithMarkEl } from "@/utils/results-page";
import { useEffect, useMemo, useState } from "react";
import { useGeneSearchQuery, useWebWorker } from "@/hooks";
import classNames from "classnames";
import { PROTOTYPE_DATA_ROOT } from "@/api-service";
import { SearchWebWorkerResult } from "@/models";
import { DATA_SITE_BASE_PATH } from "@/shared";

const AvailabilityIcon = (props: { hasData: boolean }) => (
  <FontAwesomeIcon
    className={!!props.hasData ? "secondary" : "grey"}
    icon={!!props.hasData ? faCheck : faTimes}
  />
);

const GeneResult = ({
  gene,
  query,
}: {
  gene: GeneSearchItem;
  query: string | undefined;
}) => {
  const {
    geneSymbol,
    geneName,
    synonyms = "",
    mgiGeneAccessionId,
    esCellProductionStatus,
    mouseProductionStatus,
    phenotypeStatus,
    phenotypingDataAvailable,
    humanGeneSymbols,
    humanSymbolSynonyms,
  } = gene;
  const navigate = useNavigate();
  const synonymsArray =
    synonyms.includes(";") || synonyms !== "" ? synonyms.split(";") : [];
  const humanSynonymsArray =
    humanSymbolSynonyms.includes(";") || humanSymbolSynonyms !== ""
      ? humanSymbolSynonyms.split(";")
      : [];
  return (
    <>
      <Row className={styles.row}>
        <Col
          sm={8}
          className={styles.result}
          onClick={() => {
            navigate(`/${DATA_SITE_BASE_PATH}/genes/${mgiGeneAccessionId}`);
          }}
        >
          <h4 className="mb-2">
            <span className="blue-dark">
              <i>{surroundWithMarkEl(geneSymbol, query)}</i>
            </span>
            &nbsp;
            <span className="grey">|</span>{" "}
            {surroundWithMarkEl(geneName, query)}
          </h4>
          {!!synonymsArray && !!synonymsArray.length && (
            <p className="grey small">
              <strong>Synonyms:</strong>{" "}
              <i>
                {surroundWithMarkEl(
                  (synonymsArray || []).slice(0, 10).join(", "),
                  query,
                ) || "None"}
              </i>
            </p>
          )}
          <p className="grey small mt-2">
            <strong>Human symbol:</strong>{" "}
            <i>{surroundWithMarkEl(humanGeneSymbols, query) || "None"}</i>
          </p>
          {!!humanSynonymsArray && !!humanSynonymsArray.length && (
            <p className="grey small">
              <strong>Human synonyms:</strong>{" "}
              <i>
                {surroundWithMarkEl(
                  (humanSynonymsArray || []).slice(0, 10).join(", "),
                  query,
                ) || "None"}
              </i>
            </p>
          )}

          <div className="small grey mt-3">
            {phenotypingDataAvailable ? (
              <p>
                <AvailabilityIcon hasData={!!phenotypeStatus} />
                &nbsp;
                <span className={`me-4 ${!phenotypeStatus ? "grey" : ""}`}>
                  {phenotypeStatus || "No phenotyping data"}
                </span>
                <AvailabilityIcon hasData={!!esCellProductionStatus} />
                &nbsp;
                <span
                  className={`me-4 ${!esCellProductionStatus ? "grey" : ""}`}
                >
                  {esCellProductionStatus || "No ES cells"}
                </span>
                <AvailabilityIcon hasData={!!mouseProductionStatus} />
                &nbsp;
                <span
                  className={`me-4 ${!mouseProductionStatus ? "grey" : ""}`}
                >
                  {mouseProductionStatus || "No mice"}
                </span>
              </p>
            ) : (
              <span className="grey">
                <FontAwesomeIcon className="grey" icon={faTimes} /> Phenotyping
                data not yet available
              </span>
            )}
          </div>
        </Col>
        <Col sm={4} className={styles.shortcuts}>
          <h5 className="grey text-uppercase">
            <small>Shortcuts</small>
          </h5>
          <p className="grey">
            <Link to={`/genes/${mgiGeneAccessionId}/#order`} className="link">
              <FontAwesomeIcon icon={faShoppingCart} />
              Order mice
            </Link>
          </p>
        </Col>
      </Row>
      <hr className="mt-0 mb-0" />
    </>
  );
};

type GeneResultProps = {
  query?: string;
  stale: boolean;
};

const GeneResults = ({ query, stale }: GeneResultProps) => {
  const { data, isLoading } = useGeneSearchQuery();
  const [indexLoaded, setIndexLoaded] = useState(false);
  const [searchResultIds, setSearchResultIds] = useState<Array<string>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [noMatches, setNoMatches] = useState<boolean>(false);

  const workerScriptUrl = useMemo(
    () =>
      `../../workers/search-result-worker.js?api-data-root=${PROTOTYPE_DATA_ROOT}&type=gene`,
    [],
  );

  const { eventResult, sendMessage } =
    useWebWorker<SearchWebWorkerResult>(workerScriptUrl);

  useEffect(() => {
    if (eventResult) {
      switch (eventResult.type) {
        case "index-loaded":
          setIndexLoaded(true);
          break;
        case "query-result":
          setSearchResultIds(eventResult.result);
          setNoMatches(eventResult.noMatches);
          setIsSearching(false);
          break;
      }
    }
  }, [eventResult]);

  useEffect(() => {
    if (query) {
      sendMessage(query);
      setIsSearching(true);
    }
  }, [query]);

  const filteredData = useMemo(() => {
    if (noMatches) {
      return [];
    }
    if (query && searchResultIds.length) {
      return data?.filter((gene) =>
        searchResultIds.includes(gene.mgiGeneAccessionId),
      );
    } else {
      return data;
    }
  }, [data, query, searchResultIds, noMatches]);

  return (
    <>
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
            <strong>Gene search results</strong>
          </h1>
          {!!query && !isLoading && (
            <p className="grey mb-0">
              <small>
                Found {filteredData?.length || 0} entries{" "}
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
            <Pagination data={filteredData}>
              {(pageData) => {
                if (pageData.length === 0) {
                  return (
                    <Alert variant="yellow">
                      <p>No results found.</p>
                    </Alert>
                  );
                }
                return pageData.map((p, i) => (
                  <GeneResult gene={p} key={p.entityId + i} query={query} />
                ));
              }}
            </Pagination>
          )}
        </Card>
      </Container>
    </>
  );
};

export default GeneResults;
