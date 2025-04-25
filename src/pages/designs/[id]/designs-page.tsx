"use client";

import { Container } from "react-bootstrap";
import styles from "./styles.module.scss";
import { useQuery } from "@tanstack/react-query";
import { Image } from "react-bootstrap";
import { fetchAPI } from "@/api-service";
import { Card, Search, SortableTable } from "@/components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter, useParams } from "next/navigation";

const Oligo = () => {
  const router = useRouter();
  const params = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["alleles", "htgt", params.id],
    queryFn: () => fetchAPI(`/api/v1/alleles/htgt/designId:${params.id}`),
    enabled: !!params.id,
  });

  if (isLoading) {
    return (
      <>
        <Search />
        <Container className="page">
          <Card>
            <div className={styles.subheading}>
              <span className={`${styles.subheadingSection} primary`}>
                <button
                  style={{
                    border: 0,
                    background: "none",
                    padding: 0,
                    color: "inherit",
                  }}
                  onClick={() => {
                    router.back();
                  }}
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  &nbsp; Go Back to&nbsp;
                  <span style={{ fontStyle: "normal" }}>Allele page</span>
                </button>
              </span>
            </div>
            <h1 className="mb-4 mt-2">
              <strong>Design Oligos - High Throughput Gene Targeting</strong>
            </h1>
            <p className="grey" data-testid="loading-text">
              Loading...
            </p>
          </Card>
        </Container>
      </>
    );
  }

  return (
    <>
      <Search />
      <Container className="page">
        <Card>
          <div className={styles.subheading}>
            <span className={`${styles.subheadingSection} primary`}>
              <button
                style={{
                  border: 0,
                  background: "none",
                  padding: 0,
                  color: "inherit",
                }}
                onClick={() => {
                  router.back();
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                &nbsp; Go Back to&nbsp;
                <span style={{ fontStyle: "normal" }}>Allele page</span>
              </button>
            </span>
          </div>
          <h1 className="mb-4 mt-2">
            <strong>Design Oligos - High Throughput Gene Targeting</strong>
            <span> | Design Id: {params.id}</span>
          </h1>
          <Image src="/data/images/target_design_trimmed.png" fluid alt="" />
        </Card>
        <Card>
          <h2>Oligos</h2>
          <SortableTable
            headers={[
              { label: "Type", width: 1, disabled: true },
              { label: "Start", width: 1, disabled: true },
              { label: "Stop", width: 1, disabled: true },
              { label: "Sequence", width: 5, disabled: true },
              { label: "Assembly", width: 2, disabled: true },
              { label: "CHR", width: 1, disabled: true },
              { label: "Strand", width: 1, disabled: true },
            ]}
          >
            {data.map(
              ({
                assembly,
                chr,
                strand,
                oligoStart,
                oligoStop,
                featureType,
                oligoSequence,
              }) => (
                <tr>
                  <td>{featureType}</td>
                  <td>{oligoStart}</td>
                  <td>{oligoStop}</td>
                  <td>{oligoSequence}</td>
                  <td>{assembly}</td>
                  <td>{chr}</td>
                  <td>{strand}</td>
                </tr>
              ),
            )}
          </SortableTable>
        </Card>
      </Container>
    </>
  );
};

export default Oligo;
