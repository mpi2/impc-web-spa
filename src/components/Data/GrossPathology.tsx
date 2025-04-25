import { GrossPathologyDataset, SortType } from "@/models";
import { Row, Col, Card } from "react-bootstrap";
import { SmartTable, PlainTextCell } from "../SmartTable";
import { useGrossPathologyChartQuery } from "@/hooks";
import ChartSummary from "./ChartSummary/ChartSummary";
import { useMemo } from "react";

const GrossPathology = ({ datasetSummary }) => {
  const { data } = useGrossPathologyChartQuery(
    datasetSummary.mgiGeneAccessionId,
    datasetSummary.parameterStableId,
    !!datasetSummary.mgiGeneAccessionId,
  );
  const defaultSort: SortType = useMemo(() => ["alleleSymbol", "asc"], []);

  return (
    <>
      <ChartSummary datasetSummary={datasetSummary}>
        A Gross Pathology and Tissue Collection phenotypic assay was performed
        on {data[0] ? data[0].specimenCount : 0} mice. The mutants are for the{" "}
        {data[0] ? data[0].alleleSymbol : 0} allele.
      </ChartSummary>
      <Row>
        <Col>
          <Card>
            <h2>Observation counts</h2>
            <SmartTable<GrossPathologyDataset>
              data={data}
              defaultSort={defaultSort}
              columns={[
                {
                  width: 1,
                  label: "Anatomy",
                  field: "anatomyTerm",
                  cmp: <PlainTextCell />,
                },
                {
                  width: 1,
                  label: "Zygosity",
                  field: "zygosity",
                  cmp: <PlainTextCell />,
                },
                {
                  width: 1,
                  label: "Abnormal",
                  field: "abnormalCounts",
                  cmp: <PlainTextCell />,
                },
                {
                  width: 1,
                  label: "Normal",
                  field: "normalCounts",
                  cmp: <PlainTextCell />,
                },
                {
                  width: 1,
                  label: "Center",
                  field: "phenotypingCenter",
                  cmp: <PlainTextCell />,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default GrossPathology;
