import { Metadata } from "next";
import HistopathChartPage from "./histopath-chart-page";
import { notFound } from "next/navigation";
import { fetchGeneSummary } from "@/api-service";
import { fetchHistopathChartData } from "@/api-service";

type PageParams = Promise<{
  pid: string;
}>;

export default async function Page({ params }: { params: PageParams }) {
  const mgiGeneAccessionId = (await params).pid;
  if (!mgiGeneAccessionId || mgiGeneAccessionId === "null") {
    notFound();
  }
  const geneSummary = await fetchGeneSummary(mgiGeneAccessionId);
  if (!geneSummary) {
    notFound();
  }

  return (
    <HistopathChartPage
      gene={geneSummary}
      histopathologyData={{ id: "", mgiGeneAccessionId: "", datasets: [] }}
    />
  );
}

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const mgiGeneAccessionId = (await params).pid;
  if (!mgiGeneAccessionId || mgiGeneAccessionId === "null") {
    notFound();
  }
  const geneSummary = await fetchGeneSummary(mgiGeneAccessionId);
  if (!geneSummary) {
    notFound();
  }
  const { geneSymbol } = geneSummary;
  const title = `${geneSymbol} histopath information  | International Mouse Phenotyping Consortium`;
  return {
    title: title,
  };
}
