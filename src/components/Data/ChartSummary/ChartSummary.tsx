import { Modal, Table } from "react-bootstrap";
import Card from "@/components/Card";
import { formatAlleleSymbol, formatPValue, getSmallestPValue } from "@/utils";
import { PropsWithChildren, ReactNode, useMemo, useState } from "react";
import Link from "next/link";
import { Dataset } from "@/models";
import styles from "./styles.module.scss";

type ChartSummaryProps = {
  datasetSummary: Dataset;
  additionalContent?: ReactNode;
  title?: ReactNode;
  displayPValueStatement?: boolean;
  displayAssociatedPhenotype?: boolean;
  showParameterName?: boolean;
};
const ChartSummary = (props: PropsWithChildren<ChartSummaryProps>) => {
  const {
    title,
    additionalContent = null,
    datasetSummary,
    children,
    displayPValueStatement = true,
    displayAssociatedPhenotype = true,
    showParameterName = true,
  } = props;
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const allele = formatAlleleSymbol(datasetSummary["alleleSymbol"]);
  const totalMice = Object.keys(datasetSummary["summaryStatistics"]).reduce(
    (acc, key) => {
      return (
        acc +
        (key.includes("Count") ? datasetSummary["summaryStatistics"][key] : 0)
      );
    },
    0,
  );

  const metadataArray =
    datasetSummary.metadataValues.length > 0
      ? datasetSummary.metadataValues[0].split("|")
      : [];
  const pValue = useMemo(
    () => getSmallestPValue([datasetSummary]),
    [datasetSummary],
  );

  return (
    <Card>
      <div>
        <div
          className="mb-4"
          style={{ display: "flex", alignItems: "center", gap: "2rem" }}
        >
          <h1 style={{ margin: 0 }}>
            <strong>
              {!!title ? (
                title
              ) : (
                <>
                  <i>{datasetSummary.geneSymbol}</i> data charts
                </>
              )}
            </strong>
          </h1>
          {showParameterName && (
            <span
              style={{
                color: "#797676",
                textTransform: "uppercase",
                fontWeight: "500",
                lineHeight: "1.2",
              }}
            >
              {datasetSummary.parameterName}
            </span>
          )}
        </div>
        {displayPValueStatement && pValue !== 1 && (
          <span
            className="mb-4"
            style={{ display: "inline-block", fontSize: "1.2rem" }}
          >
            Combination tested with the lowest p-value of{" "}
            <strong>{formatPValue(pValue)}</strong>
          </span>
        )}
        {additionalContent}
      </div>
      <div className={styles.details}>
        <div className={styles.label}>Experiments performed</div>
        <div className="content">
          {children ? (
            children
          ) : (
            <>
              <p>
                A <strong>{datasetSummary["procedureName"]}</strong> phenotypic
                assay was performed on {totalMice} mice. The charts show the
                results of measuring{" "}
                <strong>{datasetSummary["parameterName"]}</strong> in{" "}
                {datasetSummary["summaryStatistics"]["femaleMutantCount"]}{" "}
                female, {datasetSummary["summaryStatistics"]["maleMutantCount"]}{" "}
                male mutants compared to{" "}
                {datasetSummary["summaryStatistics"]["femaleControlCount"]}{" "}
                female,{" "}
                {datasetSummary["summaryStatistics"]["maleControlCount"]} male
                controls. The mutants are for the{" "}
                <i>
                  {allele[0]}
                  <sup>{allele[1]}</sup>
                </i>{" "}
                allele.
              </p>
            </>
          )}
        </div>
        {displayAssociatedPhenotype && (
          <>
            <div className={styles.label}>Associated phenotype</div>
            <div className="content">
              {!!datasetSummary["significantPhenotype"]?.["id"] ? (
                <Link
                  href={`/phenotypes/${datasetSummary["significantPhenotype"]["id"]}`}
                >
                  <span className="link primary">
                    {datasetSummary["significantPhenotype"]?.["name"]}
                  </span>
                </Link>
              ) : (
                <strong>No significant association</strong>
              )}
            </div>
          </>
        )}
        <div className={styles.label}>Zygosity</div>
        <div className="content">
          <span>{datasetSummary["zygosity"]}</span>
        </div>
        <div className={styles.label}>Testing protocol</div>
        <div className="content">
          <Link
            className="link primary"
            href={`https://www.mousephenotype.org/impress/ProcedureInfo?action=list&procID=${datasetSummary.procedureStableKey}&pipeID=${datasetSummary.pipelineStableKey}`}
          >
            {datasetSummary["procedureName"]}
          </Link>
        </div>
        <div className={styles.label}>Measured value</div>
        <div className="content">{datasetSummary["parameterName"]}</div>
        <div className={styles.label}>Testing environment</div>
        <div className="content">
          <span
            className="primary link"
            onClick={() => setShowMetadataModal(true)}
          >
            Lab conditions and equipment
          </span>
        </div>
        <div className={styles.label}>Life stage</div>
        <div className="content">
          <span>{datasetSummary["lifeStageName"]}</span>
        </div>
        <div className={styles.label}>Background Strain</div>
        <div className="content">
          <span>{datasetSummary["geneticBackground"]}</span>
        </div>
        <div className={styles.label}>Phenotyping center</div>
        <div className="content">
          <span>{datasetSummary["phenotypingCentre"]}</span>
        </div>
        <div className={styles.label}></div>
        <div className="content">
          <p className="small">
            * The high throughput nature of the IMPC means that large control
            sample sizes may accumulate over a long period of time. See the
            animal welfare guidelines for more information.
          </p>
        </div>
      </div>
      <Modal
        show={showMetadataModal}
        onHide={() => setShowMetadataModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Experimental conditions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped borderless>
            <tbody>
              {metadataArray
                .map((item) => item.split("="))
                .map(([label, value], i) => (
                  <tr key={i}>
                    <td>{label}</td>
                    <td>{value}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>
    </Card>
  );
};

export default ChartSummary;
