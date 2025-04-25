"use client";

import { faArrowLeftLong, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Col, Container, Row } from "react-bootstrap";
import Card from "../../components/Card";
import Search from "../../components/Search";
import { BodySystem } from "@/components/BodySystemIcon";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/api-service";
import { allBodySystems } from "@/utils";
import { Suspense } from "react";

const GeneColumn = ({
  geneId,
  handleRemove,
}: {
  geneId: string;
  handleRemove: (id: string) => void;
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["genes", geneId, "summary"],
    queryFn: () => fetchAPI(`/api/v1/genes/${geneId}/summary`),
  });

  if (isLoading) {
    return <Col>Loading...</Col>;
  }

  return (
    <Col lg={4} sm={6} xxl={3}>
      <p
        className="secondary mb-0"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <i>{data.geneSymbol}</i>
        <Button
          variant="link"
          onClick={() => {
            handleRemove(geneId);
          }}
        >
          <FontAwesomeIcon className="grey" icon={faTimes} />
        </Button>
      </p>
      <h3>
        <Link href={`/genes/${geneId}`} legacyBehavior>
          {data.geneName}
        </Link>
      </h3>
      <div>
        {allBodySystems.map((s, i) => {
          return (
            <>
              <BodySystem
                name={s}
                color={
                  data.significantTopLevelPhenotypes?.includes(s)
                    ? "primary"
                    : data.notSignificantTopLevelPhenotypes?.includes(s)
                      ? "secondary"
                      : "grey"
                }
                appendLabel={
                  data.significantTopLevelPhenotypes?.includes(s)
                    ? "significant"
                    : data.notSignificantTopLevelPhenotypes?.includes(s)
                      ? "not significant"
                      : "not tested"
                }
              />
              {i > 0 && (i + 1) % 5 === 0 ? <br /> : null}
            </>
          );
        })}
      </div>
    </Col>
  );
};

const CompareGenes = () => {
  return (
    <>
      <Suspense>
        <Search />
      </Suspense>
      <Container className="page">
        <Card>
          <div>
            <button style={{ border: 0, background: "none", padding: 0 }}>
              <a href="#" className="grey mb-3 small">
                <FontAwesomeIcon icon={faArrowLeftLong} /> GO BACK
              </a>
            </button>
          </div>
          <h1>
            <strong>Compare Genes</strong>
          </h1>
          <Row>
            <p className="grey">
              Add genes to the comparator from the search or the gene pages
            </p>
          </Row>
        </Card>
      </Container>
    </>
  );
};

export default CompareGenes;
