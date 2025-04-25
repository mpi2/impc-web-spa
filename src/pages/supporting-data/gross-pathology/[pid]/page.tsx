import GrossPathChartPage from "./grosspath-chart-page";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchGeneSummary } from "@/api-service";

type PageParams = Promise<{
  pid: string;
}>;

export default async function Page() {
  return <GrossPathChartPage />;
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
  const title = `${geneSymbol} gross pathology data | International Mouse Phenotyping Consortium`;
  return {
    title: title,
  };
}
