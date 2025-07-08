import { GenomeBrowser, Search } from "@/components";
import { Container } from "react-bootstrap";
import { ChartNav } from "@/components/Data";
import Card from "@/components/Card";
import { useGeneSummaryQuery } from "@/hooks";
import { useParams } from "react-router";

const GenomeBrowserPage = () => {
  const params = useParams<{ pid: string }>();

  const { data: geneSummary } = useGeneSummaryQuery(params.pid, !!params.pid);
  return (
    <>
      <Search />
      <Container className="page">
        <Card>
          <ChartNav
            className="mb-3"
            mgiGeneAccessionId={geneSummary?.mgiGeneAccessionId}
            geneSymbol={geneSummary?.geneSymbol}
            isFetching={false}
          />
          <GenomeBrowser
            geneSymbol={geneSummary?.geneSymbol}
            mgiGeneAccessionId={geneSummary?.mgiGeneAccessionId}
            noContainer={true}
          />
        </Card>
      </Container>
    </>
  );
};

export default GenomeBrowserPage;
