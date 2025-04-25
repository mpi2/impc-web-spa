import styles from "./styles.module.scss";
import { Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretSquareDown } from "@fortawesome/free-regular-svg-icons";
import { PhenotypeSummary } from "@/models/phenotype";
import { Card, ScrollToTopButton } from "@/components";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

type Props = {
  phenotype: PhenotypeSummary;
};

const Summary = ({ phenotype }: Props) => {
  const SYNONYMS_COUNT = 2;

  const getNoTotalGenes = () => {
    if (!phenotype) return null;
    return phenotype.significantGenes + phenotype.notSignificantGenes;
  };

  const calculatePercentageGenes = () => {
    if (!phenotype) return null;
    if (getNoTotalGenes() === 0) return 0;
    return Number(
      (phenotype.significantGenes / getNoTotalGenes()) * 100,
    ).toFixed(2);
  };

  const displaySynonyms = () => {
    return phenotype.phenotypeSynonyms.slice(0, SYNONYMS_COUNT).join(",");
  };
  const displaySynonymsInTooltip = () => {
    return phenotype.phenotypeSynonyms
      .slice(SYNONYMS_COUNT, phenotype.phenotypeSynonyms.length)
      .map((s, i) => (
        <span key={s} style={{ whiteSpace: "nowrap" }}>
          {s}
          {i < phenotype.phenotypeSynonyms.length ? ", " : ""}
          <br />
        </span>
      ));
  };

  return (
    <Card>
      <Row>
        <Col className={styles.nameContainer} lg={6}>
          <h1 style={{ margin: 0 }}>
            <strong>{phenotype.phenotypeName}</strong>
          </h1>
        </Col>
        <Col lg={6}>
          <div className={styles.stats}>
            <div data-testid="significant-genes">
              <p className="secondary h2 mb-0">
                {phenotype.significantGenes || 0}
              </p>
              <span className="grey">significant genes</span>
            </div>
            <div data-testid="tested-genes-percentage">
              <p className="secondary h2 mb-0">{calculatePercentageGenes()}%</p>
              <span className="grey">of tested genes</span>
            </div>
            <div data-testid="total-genes-tested">
              <p className="h2 mb-0">{getNoTotalGenes()}</p>
              <span className="grey">tested genes</span>
            </div>
          </div>
        </Col>
      </Row>
      <div className={styles.subheadingCont}>
        <div className={styles.subheading}>
          <span>Phenotype</span>
          <a
            className="primary"
            href={`http://www.informatics.jax.org/vocab/mp_ontology/${phenotype.phenotypeId}`}
            target="_blank"
            title={`visit MGI site to view details for gene ${phenotype.phenotypeName}`}
          >
            {phenotype.phenotypeId}
            <FontAwesomeIcon
              icon={faExternalLinkAlt}
              className="grey"
              size="xs"
              style={{ marginLeft: "0.3rem" }}
            />
          </a>
          {!!phenotype.phenotypeSynonyms?.length && (
            <a className={styles.subheadingSection} href="#">
              Synonyms:&nbsp;
              {displaySynonyms()}
              {phenotype.phenotypeSynonyms.length > SYNONYMS_COUNT && (
                <OverlayTrigger
                  placement="bottom"
                  trigger={["hover", "focus"]}
                  overlay={
                    <Tooltip>
                      <div style={{ textAlign: "left" }}>
                        {displaySynonymsInTooltip()}
                      </div>
                    </Tooltip>
                  }
                >
                  {({ ref, ...triggerHandler }) => (
                    <span
                      {...triggerHandler}
                      ref={ref}
                      className="link"
                      data-testid="synonyms"
                    >
                      ,&nbsp;+
                      {phenotype.phenotypeSynonyms.length - SYNONYMS_COUNT}{" "}
                      more&nbsp;
                      <FontAwesomeIcon icon={faCaretSquareDown} />
                    </span>
                  )}
                </OverlayTrigger>
              )}
            </a>
          )}
        </div>
      </div>
      <div className={styles.summaryContent}>
        <div>
          <h3 className="mb-2">Description</h3>
          <p className="grey">{phenotype.phenotypeDefinition}</p>
        </div>
        <div
          className="purchaseBanner phenotype-page"
          style={{ paddingRight: 0 }}
        >
          <span>Significant gene-phenotype associations</span>
          <a href="#associations-table" className="purchaseButton">
            View data
          </a>
        </div>
      </div>
      <ScrollToTopButton scrollPercentage={100} />
    </Card>
  );
};

export default Summary;
