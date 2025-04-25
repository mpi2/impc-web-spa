"use client";

import styles from "./styles.module.scss";
import { Alert, Col, Container, Form, Row } from "react-bootstrap";
import { faCheck, faCross } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useRouter } from "next/navigation";
import Card from "../Card";
import Pagination from "../Pagination";
import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/api-service";

const AlleleResult = ({
  phenotype: {
    entityProperties: { mpId, phenotypeName, synonyms },
  },
}) => {
  const router = useRouter();
  const synonymsArray = synonyms.split(";");
  return (
    <>
      <Row
        className={styles.result}
        onClick={() => {
          router.push(`/phenotypes/${mpId}`);
        }}
      >
        <Col sm={12}>
          <h4 className="mb-2 text-capitalize blue-dark">{phenotypeName}</h4>
          {/* <p className="grey mb-0 small">
            <strong>Definition:</strong> ???
          </p> */}
          <p className="grey small">
            <strong>Synomyms:</strong> {synonymsArray.join(", ")}
          </p>
          {1 > 0 ? (
            <p className="small grey">
              <FontAwesomeIcon className="secondary" icon={faCheck} />{" "}
              <strong>??</strong> genes associated with this phenotype
            </p>
          ) : (
            <p className="grey small">
              <FontAwesomeIcon className="grey" icon={faCross} /> No IMPC genes
              currently associated with this phenotype
            </p>
          )}
        </Col>
      </Row>
      <hr className="mt-0 mb-0" />
    </>
  );
};

const AlleleResults = ({ query }: { query?: string }) => {
  const { isLoading, isError, data, error } = useQuery({
    queryKey: ["search", "alleles", query],
    queryFn: () =>
      fetchAPI(`/api/search/v1/search?prefix=${query}&type=PHENOTYPE`),
  });
  return (
    <Container style={{ maxWidth: 1240 }}>
      <Card
        style={{
          marginTop: -80,
        }}
      >
        <div>
          <label
            htmlFor="productType"
            className="grey"
            style={{ marginRight: "0.5rem" }}
          >
            Product type:
          </label>
          <Form.Select
            style={{ display: "inline-block", width: 280, marginRight: "2rem" }}
            aria-label="Product type"
            defaultValue={"all"}
            id="productType"
            className="bg-white"
          >
            <option value={"all"}>All</option>
            <option value={"mouse"}>Mouse</option>
            <option value={"esCell"}>ES cells</option>
            <option value={"tvp"}>Targeting vectors</option>
          </Form.Select>
        </div>
        {query ? (
          <>
            <p className="grey">
              <small>
                Found {data.results?.length || 0} entries{" "}
                {!!query && (
                  <>
                    matching <strong>"{query}"</strong>
                  </>
                )}
              </small>
            </p>
          </>
        ) : (
          <h1>
            <strong>Top 10 most searched allele products</strong>
          </h1>
        )}
        {isLoading ? (
          <p className="grey mt-3 mb-3">Loading...</p>
        ) : (
          <Pagination data={data.results}>
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
                    <AlleleResult phenotype={p} key={p.entityId} />
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

export default AlleleResults;
