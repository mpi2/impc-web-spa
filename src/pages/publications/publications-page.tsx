import { Container, Tab, Tabs } from "react-bootstrap";
import styles from "./styles.module.scss";
import { Card, Search, PublicationsList } from "@/components";
import {
  PublicationsIncreaseChart,
  PublicationsByYearChart,
  GrantSection,
} from "./charts";
import { Suspense } from "react";
import { usePublicationsAggregationQuery } from "@/hooks";

const PublicationsPage = () => {
  const { data } = usePublicationsAggregationQuery();

  return (
    <>
      <Suspense>
        <Search />
      </Suspense>
      <Container className="page">
        <Card>
          <h1 className="mb-4 mt-2">
            <strong>IKMC/IMPC related publications</strong>
          </h1>
          <Tabs defaultActiveKey="all-publications">
            <Tab eventKey="all-publications" title="All publications">
              <div className="mt-5">
                <PublicationsList />
              </div>
            </Tab>
            <Tab eventKey="publications-stats" title="Publications stats">
              <Card>
                <div className="tab-content-container">
                  <h2>Yearly increase of IKMC/IMPC related publications</h2>
                  <div className={styles.chartContainer}>
                    <PublicationsIncreaseChart
                      data={data.yearlyIncrementData}
                    />
                  </div>
                </div>
              </Card>
              <Card>
                <div className="tab-content-container">
                  <h2>IKMC/IMPC related publications by year of publication</h2>
                  <div className={styles.chartContainer}>
                    <PublicationsByYearChart
                      data={data.publicationsByQuarter}
                      yearlyIncrementData={data.yearlyIncrementData}
                    />
                  </div>
                </div>
              </Card>
              <Card>
                <div className="tab-content-container">
                  <GrantSection data={data} />
                </div>
              </Card>
            </Tab>
            <Tab
              eventKey="consortium-publications"
              title="Consortium publications"
            >
              <div className="mt-5">
                <PublicationsList onlyConsortiumPublications />
              </div>
            </Tab>
          </Tabs>
        </Card>
      </Container>
    </>
  );
};

export default PublicationsPage;
