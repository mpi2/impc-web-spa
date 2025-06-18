import { useEffect } from "react";
import { useState } from "react";
import { Alert } from "react-bootstrap";
import { orderBy } from "lodash";
import { Link } from "react-router";
import { useAlleleIVPQuery } from "@/hooks";
import { Card, Pagination, SortableTable } from "@/components";

const IntermediateVector = ({
  mgiGeneAccessionId,
  alleleName,
}: {
  mgiGeneAccessionId: string;
  alleleName: string;
}) => {
  const { data, isLoading, isError } = useAlleleIVPQuery(
    mgiGeneAccessionId,
    alleleName,
  );
  const [sorted, setSorted] = useState<any[]>([]);
  useEffect(() => {
    if (data) {
      setSorted(orderBy(data, "productId", "asc"));
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
                        to={`/designs/${p.designLink.split(":")[2]}`}
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
