import { Card, Search } from "@/components";
import { Link } from "react-router";
import { Col, Container, Row } from "react-bootstrap";
import { Suspense } from "react";
import { DATA_SITE_BASE_PATH } from "@/shared";

export default function NotFound() {
  return (
    <>
      <Suspense>
        <Search />
      </Suspense>
      <Container className="page">
        <Card>
          <Row>
            <Col>
              <h1>404</h1>
              <h2>Page not found</h2>
              <p>
                We can’t seem to find the page you are looking for. <br />
                Here are some helpful links you might like:
              </p>
              <ul className="list-links-404">
                <li>
                  <Link
                    className="link primary"
                    to={`/${DATA_SITE_BASE_PATH}/search`}
                  >
                    Gene search
                  </Link>
                </li>
                <li>
                  <Link
                    className="link primary"
                    to={`/${DATA_SITE_BASE_PATH}/search?type=pheno`}
                  >
                    Phenotype search
                  </Link>
                </li>
                <li>
                  <Link
                    className="link primary"
                    to="https://www.mousephenotype.org/about-impc/"
                  >
                    About the IMPC
                  </Link>
                </li>
                <li>
                  <Link
                    className="link primary"
                    to="https://www.mousephenotype.org/understand/accessing-the-data/"
                  >
                    Accessing the Data
                  </Link>
                </li>
                <li>
                  <Link
                    className="link primary"
                    to="https://www.mousephenotype.org/understand/the-data/"
                  >
                    Understanding Our Data
                  </Link>
                </li>
                <li>
                  <Link
                    className="link primary"
                    to="https://www.mousephenotype.org/about-impc/consortium-members/"
                  >
                    Consortium Members
                  </Link>
                </li>
                <li>
                  <Link
                    className="link primary"
                    to="https://www.mousephenotype.org/understand/research-highlights/"
                  >
                    Research Highlights
                  </Link>
                </li>
              </ul>
            </Col>
            <Col style={{ display: "flex", alignItems: "center" }}>
              <img
                src="https://www.mousephenotype.org/wp-content/uploads/2019/05/404-mouse.png"
                alt=""
              />
            </Col>
          </Row>
        </Card>
      </Container>
    </>
  );
}
