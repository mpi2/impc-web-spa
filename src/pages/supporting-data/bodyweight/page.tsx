import { Metadata } from "next";
import BodyWeightChartPage from "./bodyweight-chart-page";
import { notFound } from "next/navigation";
import { fetchGeneSummary } from "@/api-service";

type SearchParams = { [key: string]: string | undefined };

export default async function Page() {
  return <BodyWeightChartPage />;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const mgiGeneAccessionId = searchParams.mgiGeneAccessionId as string;
  if (!mgiGeneAccessionId || mgiGeneAccessionId === "null") {
    notFound();
  }
  const geneSummary = await fetchGeneSummary(mgiGeneAccessionId);
  if (!geneSummary) {
    notFound();
  }
  const { geneSymbol } = geneSummary;
  const title = `${geneSymbol} body weight curve chart | International Mouse Phenotyping Consortium`;
  return {
    title: title,
  };
}
