import React from "react";
import { Modal } from "react-bootstrap";
import styles from "./styles.module.scss";
import { toSentenceCase } from "../../../utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const QCModal = ({
  qcData,
  onClose,
}: {
  qcData: Object;
  onClose: () => void;
}) => {
  if (!qcData || Object.keys(qcData).length == 0) {
    return null;
  }

  const categories = Object.entries((qcData ?? [])[0]);

  return (
    <Modal
      show={!!qcData}
      onHide={() => {
        onClose();
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title>QC Data</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: 0 }}>
        <table className={styles.table}>
          {categories.map(([cat, vals]) => {
            const valuePairs = Object.entries(vals);
            return (
              <>
                <tr>
                  <td colSpan={2} className="bg-grey pt-2 pb-2">
                    <strong className="grey small">
                      {toSentenceCase(cat.replace("QC", ""))} QC
                    </strong>
                  </td>
                </tr>
                {valuePairs.map(([key, val]) => (
                  <tr>
                    <td>{toSentenceCase(key)}:</td>
                    <td style={{ textAlign: "right" }}>
                      <span className={val === "pass" ? "blue-dark" : ""}>
                        {typeof val === "string" ? (
                          <>
                            {toSentenceCase(val)}{" "}
                            <FontAwesomeIcon icon={faCheck} />
                          </>
                        ) : (
                          JSON.stringify(val)
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </>
            );
          })}
        </table>
      </Modal.Body>
    </Modal>
  );
};

export default QCModal;
