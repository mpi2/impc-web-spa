import React, { useEffect } from "react";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Alert } from "react-bootstrap";
import _ from "lodash";
import { formatESCellName, toSentenceCase } from "@/utils";
import { faWindowMaximize } from "@fortawesome/free-regular-svg-icons";
import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/api-service";
import { Card, DownloadData, Pagination, SortableTable } from "@/components";
import { AlleleEsCell } from "@/models/allele/es-cell";

const ESCell = ({
  mgiGeneAccessionId,
  alleleName,
  setQcData,
}: {
  mgiGeneAccessionId: string;
  alleleName: string;
  setQcData: (any) => void;
}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["genes", mgiGeneAccessionId, "alleles", "es_cell", alleleName],
    queryFn: () =>
      fetchAPI(
        `/api/v1/alleles/es_cell/get_by_mgi_and_allele_name/${mgiGeneAccessionId}/${alleleName}`
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
      <Card id="esCell">
        <h2>ES Cells</h2>
        <p className="grey">Loading...</p>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card id="esCell">
        <h2>ES Cells</h2>
        <Alert variant="primary">
          No ES cell products found for this allele.
        </Alert>
      </Card>
    );
  }

  return (
    <Card id="esCell" data-testid="es-cell-section">
      <h2>ES Cells</h2>
      {!data && data.length == 0 ? (
        <Alert variant="primary" style={{ marginTop: "1em" }}>
          No ES cell products found for this allele.
        </Alert>
      ) : (
        <Pagination
          data={sorted}
          additionalBottomControls={
            <DownloadData<AlleleEsCell>
              data={sorted}
              fileName={`${alleleName}-ES-Cell-data`}
              fields={[
                { key: "name", label: "ES Cell Clone" },
                { key: "strain", label: "ES Cell strain" },
                { key: "parentEsCellLine", label: "Parental Cell Line" },
                { key: "ikmcProjectId", label: "IKMC Project" },
                {
                  key: "qcData",
                  label: "QC Data",
                  getValueFn: (item) =>
                    !!item.qcData?.[0]?.userQc
                      ? Object.keys(item.qcData[0]?.userQc)
                          .map(
                            (key) =>
                              `${toSentenceCase(key)}: ${
                                item.qcData[0]?.userQc[key]
                              }`
                          )
                          .join(", ")
                      : "No data",
                },
                {
                  key: "associatedProductVectorName",
                  label: "Targeting Vector",
                },
                {
                  key: "orders",
                  label: "Order / Contact",
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
                { width: 2, label: "ES Cell Clone", disabled: true },
                {
                  width: 2,
                  label: "ES Cell strain",
                  disabled: true,
                },
                { width: 2, label: "Parental Cell Line", disabled: true },
                { width: 1, label: "IKMC Project", disabled: true },
                { width: 1, label: "QC Data", disabled: true },
                {
                  width: 2,
                  label: "Targeting Vector",
                  disabled: true,
                },
                { width: 2, label: "Order / Contact", disabled: true },
              ]}
            >
              {pageData.map((p) => {
                return (
                  <tr>
                    <td>
                      <strong>{p.name}</strong>
                    </td>
                    <td>{formatESCellName(p.strain)}</td>
                    <td>{p.parentEsCellLine}</td>
                    <td>{p.ikmcProjectId}</td>
                    <td>
                      {p.qcData.map(() => (
                        <a
                          href="#"
                          target="_blank"
                          className="link"
                          onClick={(e) => {
                            e.preventDefault();
                            setQcData(p.qcData);
                          }}
                        >
                          View&nbsp;
                          <FontAwesomeIcon
                            icon={faWindowMaximize}
                            className="grey"
                            size="xs"
                          />
                        </a>
                      ))}
                    </td>
                    <td>{p.associatedProductVectorName}</td>
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
export default ESCell;
