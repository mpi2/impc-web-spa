import { useEffect } from "react";
import {
  faCartShopping,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Alert } from "react-bootstrap";
import { orderBy } from "lodash";
import { Link } from "react-router";
import { Card, DownloadData, Pagination, SortableTable } from "@/components";
import { AlleleTvp } from "@/models/allele/tvp";
import { useAlleleTVPQuery } from "@/hooks";

const TargetingVector = ({
  mgiGeneAccessionId,
  alleleName,
}: {
  mgiGeneAccessionId: string;
  alleleName: string;
}) => {
  const { data, isLoading, isError } = useAlleleTVPQuery(mgiGeneAccessionId, alleleName);
  const [sorted, setSorted] = useState<any[]>([]);
  useEffect(() => {
    if (data) {
      setSorted(orderBy(data, "productId", "asc"));
    }
  }, [data]);

  if (isLoading) {
    return (
      <Card id="targetingVector">
        <h2>Targeting vectors</h2>
        <p className="grey">Loading...</p>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card id="targetingVector">
        <h2>Targeting vectors</h2>
        <Alert variant="primary">
          No targeting vector products found for this allele.
        </Alert>
      </Card>
    );
  }

  return (
    <Card id="targetingVector" data-testid="tvp-section">
      <h2>Targeting vectors</h2>
      {!data && data.length == 0 ? (
        <Alert variant="primary" style={{ marginTop: "1em" }}>
          No targeting vector products found for this allele.
        </Alert>
      ) : (
        <Pagination
          data={sorted}
          additionalBottomControls={
            <DownloadData<AlleleTvp>
              data={sorted}
              fileName={`${alleleName}-tvp-data`}
              fields={[
                { key: "name", label: "Targeting Vector" },
                {
                  key: "cassette",
                  label: "Cassette",
                },
                { key: "backbone", label: "Backbone" },
                {
                  key: "ikmcProjectId",
                  label: "IKMC Project",
                },
                {
                  key: "otherLinks",
                  label: "Genbank File",
                  getValueFn: (item) =>
                    !!item.otherLinks.genbankFile
                      ? item.otherLinks.genbankFile
                      : "N/A",
                },
                {
                  key: "otherLinks",
                  label: "Vector Map",
                  getValueFn: (item) =>
                    !!item.otherLinks.alleleImage
                      ? item.otherLinks.alleleImage
                      : "N/A",
                },
                {
                  key: "orders",
                  label: "Order",
                  getValueFn: (item) =>
                    item.orders.map((order) => order.orderLink).join(", "),
                },
              ]}
            />
          }
        >
          {(pageData) => (
            <SortableTable
              doSort={() => {}}
              defaultSort={["title", "asc"]}
              headers={[
                { width: 2, label: "Design Oligos", disabled: true },
                {
                  width: 2,
                  label: "Targeting Vector",
                  disabled: true,
                },
                { width: 1, label: "Cassette", disabled: true },
                { width: 1, label: "Backbone", disabled: true },
                { width: 1.5, label: "IKMC Project", disabled: true },
                {
                  width: 1.5,
                  label: "Genbank File",
                  disabled: true,
                },
                {
                  width: 1.5,
                  label: "Vector Map",
                  disabled: true,
                },
                { width: 1.5, label: "Order", disabled: true },
              ]}
            >
              {pageData.map((p) => {
                return (
                  <tr>
                    <td>
                      <Link
                        to={`/designs/${p.designLink.split(":")[2]}`}
                        className="primary link"
                      >
                        {p.designOligos ?? "View design oligo"}{" "}
                      </Link>
                      <strong>{p.designOligos}</strong>
                    </td>
                    <td>{p.name}</td>
                    <td>{p.cassette}</td>
                    <td>{p.backbone}</td>
                    <td>{p.ikmcProjectId}</td>
                    <td>
                      {!!p.otherLinks.genbankFile ? (
                        <a
                          href={p.otherLinks.genbankFile}
                          target="_blank"
                          className="link primary"
                          style={{ textTransform: "capitalize" }}
                        >
                          Genbank file{" "}
                          <FontAwesomeIcon
                            icon={faExternalLinkAlt}
                            className="grey"
                            size="xs"
                          />
                        </a>
                      ) : (
                        "None"
                      )}
                    </td>
                    <td>
                      {!!p.otherLinks.alleleImage ? (
                        <a
                          href={p.otherLinks.alleleImage}
                          target="_blank"
                          className="link primary"
                          style={{ textTransform: "capitalize" }}
                        >
                          Vector map{" "}
                          <FontAwesomeIcon
                            icon={faExternalLinkAlt}
                            className="grey"
                            size="xs"
                          />
                        </a>
                      ) : (
                        "None"
                      )}
                    </td>
                    <td>
                      {p.orders.map(({ orderLink, orderName }) => (
                        <a
                          href={orderLink}
                          target="_blank"
                          className="link primary"
                        >
                          <FontAwesomeIcon icon={faCartShopping} /> {orderName}
                        </a>
                      ))}
                    </td>
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
export default TargetingVector;
