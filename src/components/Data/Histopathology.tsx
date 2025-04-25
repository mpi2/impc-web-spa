import { Col, Row } from "react-bootstrap";
import Card from "@/components/Card";
import ChartSummary from "@/components/Data/ChartSummary/ChartSummary";

const Histopathology = ({ datasetSummary }) => {
  return (
    <>
      <ChartSummary datasetSummary={datasetSummary}>
        <p>
          A Body Composition (DEXA lean/fat) phenotypic assay was performed
          on 802 mice. The charts show the results of measuring Bone Mineral
          Density (excluding skull) in 8 female, 8 male mutants compared to
          395 female, 391 male controls. The mutants are for the
          Mavsem1(IMPC)Mbp allele.
        </p>
        <p className="small">
          * The high throughput nature of the IMPC means that large control
          sample sizes may accumulate over a long period of time. See the
          animal welfare guidelines for more information.
        </p>
      </ChartSummary>
      <Row>
        <Col lg={5}>
          <Card>
            <h2 className="primary">[Insert box plot]</h2>
          </Card>
        </Col>
        <Col lg={7}>
          <Card>
            <h2 className="primary">[Insert scatter plot]</h2>
          </Card>
        </Col>
        <Col lg={6}>
          <Card>
            <h2>Results of statistical analysis</h2>
          </Card>
        </Col>
        <Col lg={6}>
          <Card>
            <h2>Summary statistics of all data in the dataset</h2>
          </Card>
        </Col>
        <Col lg={6}>
          <Card>
            <h2>Statistical method</h2>
          </Card>
        </Col>
        <Col lg={6}>
          <Card>
            <h2>Windowing parameters</h2>
          </Card>
          <Card>
            <h2>Access the results programmatically</h2>
          </Card>
        </Col>
        <Col>
          <Card>
            <h2>Download all the data</h2>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Histopathology;
