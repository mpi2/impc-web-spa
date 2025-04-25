"use client";

import { Search } from "@/components";
import { Col, Container, Row } from "react-bootstrap";
import Card from "@/components/Card";
import { PlainTextCell, SmartTable } from "@/components/SmartTable";
import { GrossPathologyDataset, SortType } from "@/models";
import { useGrossPathologyChartQuery } from "@/hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";

const GrossPathChartPage = () => {
  const params = useParams<{ pid: string }>();
  const searchParams = useSearchParams();
  const mgiGeneAccessionId = decodeURIComponent(params.pid);
  const grossPathParameterStableId =
    searchParams.get("grossPathParameterStableId") ?? "";

  const { data } = useGrossPathologyChartQuery(
    mgiGeneAccessionId,
    grossPathParameterStableId,
    !!mgiGeneAccessionId,
  );
  const defaultSort: SortType = useMemo(() => ["alleleSymbol", "asc"], []);

  console.log(data);
  return (
    <>
      <Search />
      <Container>
        <Row>
          <Col>
            <Card style={{ marginTop: "-80px" }}>
              <Link
                href={`/genes/${mgiGeneAccessionId}/#data`}
                className="grey mb-3 small"
              >
                <FontAwesomeIcon icon={faArrowLeftLong} />
                &nbsp; BACK TO GENE
              </Link>
              <br />
              <h2>Observation numbers</h2>
              <SmartTable<GrossPathologyDataset>
                data={data}
                defaultSort={defaultSort}
                columns={[
                  {
                    width: 1,
                    label: "Anatomy",
                    field: "parameterName",
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
      </Container>
    </>
  );
};

export default GrossPathChartPage;
