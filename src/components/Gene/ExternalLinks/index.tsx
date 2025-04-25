import { Card } from "@/components";
import { useContext } from "react";
import { GeneContext } from "@/contexts";
import { Alert, Container } from "react-bootstrap";
import { useGeneExternalLinksQuery } from "@/hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { sectionWithErrorBoundary } from "@/hoc/sectionWithErrorBoundary";
import styles from "./styles.module.scss";

const ExternalLinks = () => {
  const gene = useContext(GeneContext);

  const {
    data: providers,
    error,
    isFetching,
  } = useGeneExternalLinksQuery(
    gene.mgiGeneAccessionId,
    !!gene.mgiGeneAccessionId,
  );

  if (isFetching) {
    return (
      <Card id="external-links">
        <h2>External links</h2>
        <p className="grey">Loading...</p>
      </Card>
    );
  }

  if (error && providers?.length === 0) {
    return (
      <Card id="external-links">
        <h2>External links</h2>
        <Alert variant="primary">
          No external links available for <i>{gene.geneSymbol}</i>.
        </Alert>
      </Card>
    );
  }

  return (
    <Card id="external-links">
      <h2>External links</h2>
      <Container>
        <div>
          {providers?.map((provider, index) => (
            <div key={index} className="mb-4">
              <div className={styles.provider}>
                <div className={styles.providerName}>
                  <b>{provider.providerName}</b>
                </div>
                <div className={styles.links}>
                  {provider.links.map((link) => (
                    <div className="single-link">
                      <a
                        key={link.href}
                        className="primary link"
                        href={link.href}
                        target="_blank"
                        title={`visit ${provider.providerName} website for more details of ${link.label}`}
                      >
                        <i>{link.label}</i>
                        <FontAwesomeIcon
                          icon={faExternalLinkAlt}
                          className="grey"
                          size="xs"
                          style={{ marginLeft: "0.3rem" }}
                        />
                      </a>
                      <ul className={styles.description}>{link.description}</ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Card>
  );
};

export default sectionWithErrorBoundary(
  ExternalLinks,
  "External links",
  "external-links",
);
