import { faCaretSquareDown } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import styles from "./styles.module.scss";
import Link from "next/link";
import { summarySystemSelectionChannel } from "@/eventChannels";
import { allBodySystems } from "@/utils";
import { Card, Check, ScrollToTopButton } from "@/components";
import { sectionWithErrorBoundary } from "@/hoc/sectionWithErrorBoundary";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { BodySystem } from "@/components/BodySystemIcon";
import { useContext } from "react";
import { AllelesStudiedContext, GeneContext } from "@/contexts";
import Skeleton from "react-loading-skeleton";
import classNames from "classnames";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

const spring = {
  type: "spring",
  damping: 20,
  stiffness: 300,
};

const CollectionItem = ({
  name,
  link,
  hasData,
}: {
  name: string;
  link: string;
  hasData: boolean;
}) =>
  hasData ? (
    <Link
      href={link}
      className={`link ${styles.dataCollection}`}
      data-testid={name}
      title={`view ${name}`}
    >
      <Check isChecked={hasData} />
      {name}
    </Link>
  ) : (
    <span className={styles.dataCollectionInactive} data-testid={name}>
      <Check isChecked={hasData} />
      {name}
    </span>
  );

type SummaryProps = {
  numOfAlleles: number;
};
const Summary = ({ numOfAlleles }: SummaryProps) => {
  const gene = useContext(GeneContext);
  const { numAllelesAvailable } = useContext(AllelesStudiedContext);
  const SYNONYMS_COUNT = 2;

  const joined = [
    ...(gene?.significantTopLevelPhenotypes ?? []),
    ...(gene?.notSignificantTopLevelPhenotypes ?? []),
  ];

  const displaySynonyms = () => {
    return gene.synonyms.slice(0, SYNONYMS_COUNT).join(", ");
  };
  const displaySynonymsInTooltip = () => {
    return gene.synonyms
      .slice(SYNONYMS_COUNT, gene.synonyms.length)
      .map((s, i) => <li key={s}>{s}</li>);
  };

  const notTested = allBodySystems.filter((x) => joined.indexOf(x) < 0);
  const significantCount = gene?.significantTopLevelPhenotypes?.length ?? 0;
  const nonSignificantCount =
    gene?.notSignificantTopLevelPhenotypes?.length ?? 0;
  const notTestedCount = notTested.length;
  const allCount = allBodySystems.length;
  return (
    <Card id="summary" style={{ padding: "2rem 2rem 0 2rem" }}>
      <div className={styles.headingCont}>
        <h1 className="mt-2 mb-3">
          <strong>
            <i>{gene.geneSymbol}</i>
          </strong>
          &nbsp;
          <span>|</span>&nbsp;{gene.geneName}
        </h1>
      </div>
      <div className={styles.subheadingCont}>
        <div className={styles.subheading}>
          <span>Gene</span>
          <a
            className="primary"
            href={`http://www.informatics.jax.org/marker/${gene.mgiGeneAccessionId}`}
            target="_blank"
            title={`visit MGI site to view details for gene ${gene.geneSymbol}`}
          >
            {gene.mgiGeneAccessionId}
            <FontAwesomeIcon
              icon={faExternalLinkAlt}
              className="grey"
              size="xs"
              style={{ marginLeft: "0.3rem" }}
            />
          </a>
          {gene?.synonyms?.length > 0 && (
            <span>
              Synonyms: {displaySynonyms()}
              {gene.synonyms.length > SYNONYMS_COUNT && (
                <OverlayTrigger
                  placement="bottom"
                  trigger={["hover", "focus"]}
                  overlay={
                    <Tooltip className="synonyms-tooltip">
                      <div style={{ textAlign: "left" }}>
                        <ul style={{ margin: 0 }}>
                          {displaySynonymsInTooltip()}
                        </ul>
                      </div>
                    </Tooltip>
                  }
                >
                  {({ ref, ...triggerHandler }) => (
                    <span {...triggerHandler} ref={ref} data-testid="synonyms">
                      ,&nbsp;+{gene.synonyms.length - SYNONYMS_COUNT} more{" "}
                      <FontAwesomeIcon icon={faCaretSquareDown} />
                    </span>
                  )}
                </OverlayTrigger>
              )}
            </span>
          )}
        </div>
      </div>
      <div>
        <h3 className="mb-2">Physiological systems</h3>
        <div className={styles.progressHeader}>
          <div data-testid="totalCount">
            <strong>{significantCount + nonSignificantCount}</strong>
            &nbsp;/&nbsp;{allCount} physiological systems tested
          </div>
        </div>
      </div>
      <Row className={styles.gap}>
        <Col lg={6}>
          <div className={styles.bodySystemWrapper}>
            {!!significantCount && (
              <div className={styles.bodySystemGroupSignificant}>
                <h3 className={styles.bodySystemGroupSummary}>
                  <span
                    className={`${styles.pill} border-primary`}
                    data-testid="significantCount"
                  >
                    {significantCount}
                  </span>{" "}
                  Significantly impacted by the knock-out
                </h3>
                <div
                  className={styles.bodySystems}
                  data-testid="significantSystemIcons"
                >
                  {gene?.significantTopLevelPhenotypes.map((x) => (
                    <BodySystem
                      key={x}
                      name={x}
                      isSignificant
                      color="primary"
                      noSpacing
                      onClick={(system) =>
                        summarySystemSelectionChannel.emit(
                          "onSystemSelection",
                          system,
                        )
                      }
                    />
                  ))}
                </div>
              </div>
            )}
            {!!nonSignificantCount && (
              <div className={styles.bodySystemGroup}>
                <h3 className={styles.bodySystemGroupSummary}>
                  <span
                    className={`${styles.pill} border-secondary`}
                    data-testid="nonSignificantCount"
                  >
                    {nonSignificantCount}
                  </span>{" "}
                  No significant impact
                </h3>
                <div
                  className={styles.bodySystems}
                  data-testid="notSignificantSystemIcons"
                >
                  {gene?.notSignificantTopLevelPhenotypes.map((x) => (
                    <BodySystem
                      key={x}
                      name={x}
                      color="grey"
                      hoverColor="secondary"
                      noSpacing
                    />
                  ))}
                </div>
              </div>
            )}
            {!!notTestedCount && (
              <div className={styles.bodySystemGroup}>
                <h3 className={styles.bodySystemGroupSummary}>
                  <span
                    className={`${styles.pill} border-black`}
                    data-testid="nonTestedCount"
                  >
                    {notTestedCount}
                  </span>{" "}
                  Not tested
                </h3>
                <div
                  className={styles.bodySystems}
                  data-testid="notTestedSystemIcons"
                >
                  {notTested.map((system) => (
                    <BodySystem
                      key={system}
                      name={system}
                      hoverColor="grey"
                      color="grey-light"
                      noSpacing
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Col>
        <Col lg={6} className="mb-5">
          <h3>Data collections</h3>
          <Row className="mb-5">
            <Col md={4} className="pe-0">
              <CollectionItem
                link="#expressions"
                name="LacZ expression"
                hasData={gene.hasLacZData}
              />
              <br />
              <CollectionItem
                link="#histopathology"
                name="Histopathology"
                hasData={gene.hasHistopathologyData}
              />
              <br />
              <CollectionItem
                link="#images"
                name="Images"
                hasData={gene.hasImagingData}
              />
              <br />
              <Link
                className="primary"
                style={{ fontWeight: 500 }}
                href="https://www.mousephenotype.org/understand/start-using-the-impc/impc-data-generation/"
              >
                How IMPC generates data
              </Link>
            </Col>
            <Col md={6}>
              <CollectionItem
                link={`/supporting-data/viability?mgiGeneAccessionId=${gene.mgiGeneAccessionId}`}
                name="Viability data"
                hasData={gene.hasViabilityData}
              />
              <br />
              <CollectionItem
                link={`/supporting-data/bodyweight?mgiGeneAccessionId=${gene.mgiGeneAccessionId}`}
                name="Body weight measurements"
                hasData={gene.hasBodyWeightData}
              />
              <br />
              <CollectionItem
                link={`https://www.mousephenotype.org/embryoviewer/?mgi=${gene.mgiGeneAccessionId}`}
                name="Embryo imaging data"
                hasData={gene.hasEmbryoImagingData}
              />
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <div className={styles.overlayContainer}>
                <AnimatePresence initial={false}>
                  <LayoutGroup>
                    {numAllelesAvailable === 0 ? (
                      <motion.a
                        key="disabledBtn"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        layout
                        transition={spring}
                        role="button"
                        className={classNames(
                          "btn",
                          "btn-grey",
                          "impc-base-button",
                          styles.disabledAllelesBtn,
                        )}
                      >
                        No allele products available
                      </motion.a>
                    ) : (
                      <motion.a
                        key="allelesBtn"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        layout
                        transition={spring}
                        role="button"
                        href="#order"
                        className={classNames(
                          "btn",
                          "impc-primary-button",
                          styles.allelesAvailablesBtn,
                        )}
                      >
                        View allele products
                      </motion.a>
                    )}
                  </LayoutGroup>
                </AnimatePresence>
                <Skeleton
                  className={styles.skeleton}
                  containerClassName={classNames(styles.skeletonOverlay, {
                    [styles.active]: numAllelesAvailable === -1,
                  })}
                  height={50}
                />
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
      <div className={styles.geneMetricsBanner}>
        <div className={styles.single}>
          <span>
            <strong>Gene metrics:</strong>
          </span>
          <strong>{gene.significantPhenotypesCount || 0}</strong>
          Significant phenotypes
        </div>
        <div className={styles.single}>
          <strong>{gene.associatedDiseasesCount || 0}</strong>
          Associated diseases
        </div>
        <div className={styles.single}>
          <span>
            <strong>Expression examined in:</strong>
          </span>
          <strong>{gene.adultExpressionObservationsCount || 0}</strong>
          Adult tissues
        </div>
        <div className={styles.single}>
          <strong>{gene.embryoExpressionObservationsCount || 0}</strong>
          Embryo tissues
        </div>
      </div>
      <ScrollToTopButton />
    </Card>
  );
};

export default sectionWithErrorBoundary(Summary, "Gene summary", "summary");
