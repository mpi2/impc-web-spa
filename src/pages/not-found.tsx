import { Card, Search } from "@/components";
import { Metadata } from "next";
import Link from "next/link";
import { Col, Container, Row } from "react-bootstrap";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Page not found | International Mouse Phenotyping Consortium",
};
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
                  <Link className="link primary" href="/search">
                    Gene search
                  </Link>
                </li>
                <li>
                  <Link className="link primary" href="/search?type=pheno">
                    Phenotype search
                  </Link>
                </li>
                <li>
                  <Link
                    className="link primary"
                    href="https://www.mousephenotype.org/about-impc/"
                  >
                    About the IMPC
                  </Link>
                </li>
                <li>
                  <Link
                    className="link primary"
                    href="https://www.mousephenotype.org/understand/accessing-the-data/"
                  >
                    Accessing the Data
                  </Link>
                </li>
                <li>
                  <Link
                    className="link primary"
                    href="https://www.mousephenotype.org/understand/the-data/"
                  >
                    Understanding Our Data
                  </Link>
                </li>
                <li>
                  <Link
                    className="link primary"
                    href="https://www.mousephenotype.org/about-impc/consortium-members/"
                  >
                    Consortium Members
                  </Link>
                </li>
                <li>
                  <Link
                    className="link primary"
                    href="https://www.mousephenotype.org/understand/research-highlights/"
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
