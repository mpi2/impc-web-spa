import React, { useEffect } from "react";
import { useState } from "react";
import { Alert } from "react-bootstrap";
import Card from "../../Card";
import Pagination from "../../Pagination";
import _ from "lodash";
import SortableTable from "../../SortableTable";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/api-service";

const IntermediateVector = ({
  mgiGeneAccessionId,
  alleleName,
}: {
  mgiGeneAccessionId: string;
  alleleName: string;
}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["genes", mgiGeneAccessionId, "alleles", "ivp", alleleName],
    queryFn: () =>
      fetchAPI(
        `/api/v1/alleles/ivp/get_by_mgi_and_allele_name/${mgiGeneAccessionId}/${alleleName}`,
      ),
    placeholderData: [],
  });
  const [sorted, setSorted] = useState<any[]>([]);
  useEffect(() => {
    if (data) {
      setSorted(_.orderBy(data, "productId", "asc"));
    }
  }, [data]);

  if (isLoading) {
    return (
      <Card id="targetingVector">
        <h2>Intermediate vectors</h2>
        <p className="grey">Loading...</p>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card id="intermediateVector">
        <h2>Intermediate vectors</h2>
        <Alert variant="primary">
          No intermediate vector products found for this allele.
        </Alert>
      </Card>
    );
  }

  return (
    <Card id="intermediateVector" data-testid="ivp-section">
      <h2>Intermediate vectors</h2>
      {!data && data.length == 0 ? (
        <Alert variant="primary" style={{ marginTop: "1em" }}>
          No intermediate vector products found for this allele.
        </Alert>
      ) : (
        <Pagination data={sorted}>
          {(pageData) => (
            <SortableTable
              doSort={() => {}}
              defaultSort={["title", "asc"]}
              headers={[
                { width: 2, label: "Design Oligos", disabled: true },
                {
                  width: 4,
                  label: "Intermediate Vector",
                  disabled: true,
                },
                { width: 3, label: "Production pipeline", disabled: true },
                { width: 2, label: "Completed", disabled: true },
              ]}
            >
              {pageData.map((p) => {
                return (
                  <tr>
                    <td>
                      <Link
                        href={`/designs/${p.designLink.split(":")[2]}`}
                        scroll={false}
                        className="link primary"
                      >
                        {p.designOligos ?? "View design oligo"}{" "}
                      </Link>
                    </td>
                    <td>{p.name}</td>
                    <td>{p.productionPipeline}</td>
                    <td>{p.productionCompleted ? "Yes" : "No"}</td>
                  </tr>
                );
              })}
            </SortableTable>
          )}
        </Pagination>
      )}
    </Card>
  );
};
export default IntermediateVector;
