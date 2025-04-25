import GeneralChartPage from "./supporting-data-page";
import { sortAndDeduplicateDatasets } from "@/hooks/datasets.query";
import { fetchInitialDatasets } from "@/api-service";
import { ChartPageParamsObj } from "@/models/chart";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type SearchParams = { [key: string]: string | undefined };

async function getInitialDatasets(
  mgiGeneAccessionId: string,
  searchParams: ChartPageParamsObj,
) {
  const data = await fetchInitialDatasets(mgiGeneAccessionId, searchParams);
  return sortAndDeduplicateDatasets(data);
}

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const mgiGeneAccessionId = searchParams.mgiGeneAccessionId;
  if (!mgiGeneAccessionId || mgiGeneAccessionId === "null") {
    notFound();
  }

  return <GeneralChartPage initialDatasets={[]} />;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const mgiGeneAccessionId = searchParams.mgiGeneAccessionId;
  if (!mgiGeneAccessionId || mgiGeneAccessionId === "null") {
    notFound();
  }
  const datasets = await getInitialDatasets(
    mgiGeneAccessionId,
    searchParams as ChartPageParamsObj,
  );
  const parameterName = datasets?.[0]?.parameterName;
  const geneSymbol = datasets?.[0]?.geneSymbol;
  const title = `${geneSymbol} chart page | International Mouse Phenotyping Consortium`;
  const description = `View ${parameterName} chart page for mouse gene ${geneSymbol}. Experimental data about ${parameterName} is all freely available for download.`;
  return {
    title: title,
    description: description,
    keywords: [
      parameterName,
      geneSymbol,
      "mouse",
      "gene",
      "phenotypes",
      "alleles",
      "diseases",
    ],
    openGraph: {
      title: title,
      description: description,
      type: "website",
    },
  };
}
