import { useContext, useMemo, useState } from "react";
import { Alert, Tab, Tabs } from "react-bootstrap";
import { GeneExpression } from "@/models/gene";
import { PlainTextCell, SmartTable } from "@/components/SmartTable";
import { useGeneExpressionQuery } from "@/hooks";
import { GeneContext } from "@/contexts";
import { ExpressionCell, ImagesCell } from "./custom-cells";
import { Card, DownloadData, SectionHeader } from "@/components";
import { SortType } from "@/models";

const Expressions = () => {
  const gene = useContext(GeneContext);
  const [tab, setTab] = useState("adultExpressions");
  const [sortOptions, setSortOptions] = useState<string>("");
  const defaultSort: SortType = useMemo(() => ["parameterName", "asc"], []);
  const { isLoading, isError, data, error } = useGeneExpressionQuery(
    gene.mgiGeneAccessionId,
    !!gene.mgiGeneAccessionId,
    sortOptions,
  );

  const adultData = data?.filter((x) => x.lacZLifestage === "adult") ?? [];
  const embryoData = data?.filter((x) => x.lacZLifestage === "embryo") ?? [];

  const selectedData = tab === "adultExpressions" ? adultData : embryoData;

  if (isLoading) {
    return (
      <Card id="expressions">
        <SectionHeader
          containerId="#expressions"
          title="lacZ Expression"
          href="https://www.mousephenotype.org/help/data-visualization/gene-pages/lacz-expression-data/"
        />
        <p className="grey">Loading...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card id="expressions">
        <SectionHeader
          containerId="#expressions"
          title="lacZ Expression"
          href="https://www.mousephenotype.org/help/data-visualization/gene-pages/lacz-expression-data/"
        />
        <Alert variant="primary">
          No expression data available for <i>{gene.geneSymbol}</i>.
        </Alert>
      </Card>
    );
  }

  return (
    <Card id="expressions">
      <SectionHeader
        containerId="#expressions"
        title="lacZ Expression"
        href="https://www.mousephenotype.org/help/data-visualization/gene-pages/lacz-expression-data/"
      />

      <Tabs
        defaultActiveKey="adultExpressions"
        onSelect={(e) => setTab(e)}
        className="mb-3"
      >
        <Tab
          eventKey="adultExpressions"
          title={`Adult expressions (${adultData.length})`}
        ></Tab>
        <Tab
          eventKey="embryoExpressions"
          title={`Embryo expressions (${embryoData.length})`}
        ></Tab>
      </Tabs>
      {selectedData.length > 0 ? (
        <SmartTable<GeneExpression>
          data={selectedData}
          defaultSort={defaultSort}
          filteringEnabled={false}
          columns={[
            {
              width: 3,
              label: "Anatomy",
              field: "parameterName",
              cmp: <PlainTextCell style={{ fontWeight: "bold" }} />,
            },
            {
              width: 2,
              label: "Zygosity",
              field: "zygosity",
              cmp: <PlainTextCell />,
            },
            {
              width: 3,
              label: "Images",
              field: "expressionImageParameters",
              cmp: <ImagesCell mgiGeneAccessionId={gene.mgiGeneAccessionId} />,
            },
            {
              width: 1,
              label: "Mutant Expr",
              field: "expressionRate",
              cmp: (
                <ExpressionCell
                  expressionRateField="expressionRate"
                  countsField="mutantCounts"
                />
              ),
            },
            {
              width: 3,
              label: "Background staining in controls (WT)",
              field: "expressionRate",
              cmp: (
                <ExpressionCell
                  expressionRateField="wtExpressionRate"
                  countsField="controlCounts"
                />
              ),
            },
          ]}
          additionalBottomControls={
            <DownloadData<GeneExpression>
              data={selectedData.sort((a, b) =>
                a.parameterName.localeCompare(b.parameterName),
              )}
              fileName={`${gene.geneSymbol}-${tab}-lacZ-expression-data`}
              fields={[
                { key: "parameterName", label: "Anatomy" },
                { key: "zygosity", label: "Zygosity" },
                {
                  key: "mutantCounts",
                  label: "Mutant Expression Rate",
                  getValueFn: (item) => {
                    const expressionRate = item.expressionRate;
                    const totalCounts =
                      item.mutantCounts.expression +
                      item.mutantCounts.noExpression;
                    return expressionRate >= 0
                      ? `${expressionRate}% (${item.mutantCounts.expression}/${totalCounts})`
                      : "N/A";
                  },
                },
                {
                  key: "controlCounts",
                  label: "Background staining in controls (WT)",
                  getValueFn: (item) => {
                    const expressionRate = item.wtExpressionRate;
                    const totalCounts =
                      item.controlCounts.expression +
                      item.controlCounts.noExpression;
                    return expressionRate >= 0
                      ? `${expressionRate}% (${item.controlCounts.expression}/${totalCounts})`
                      : "N/A";
                  },
                },
              ]}
            >
              Download {tab === "adultExpressions" ? "adult" : "embryo"} data
              as:
            </DownloadData>
          }
        />
      ) : (
        <Alert variant="primary">
          No {tab === "adultExpressions" ? "adult" : "embryo"} expression data
          available for <i>{gene.geneSymbol}</i>.
        </Alert>
      )}
    </Card>
  );
};

export default Expressions;
