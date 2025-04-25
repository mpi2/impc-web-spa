import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  fetchGeneSummary,
  fetchGenePhenotypeHits,
  fetchGeneOrderData,
  fetchGeneExpressionData,
  fetchGeneImageData,
  fetchGeneHistopathologyData,
  fetchGeneDiseaseData,
} from "@/api-service";
import GenePage from "./gene-page";

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL;

async function getGeneSummary(mgiGeneAccessionId: string) {
  if (!mgiGeneAccessionId || mgiGeneAccessionId === "null") {
    notFound();
  }
  const geneData = await fetchGeneSummary(mgiGeneAccessionId);
  if (!geneData) {
    notFound();
  }

  return {
    gene: geneData,
    significantPhenotypes: null,
    orderData: null,
    expressionData: null,
    imageData: null,
    histopathologyData: null,
    humanDiseasesData: null,
  };
}

type PageParams = Promise<{
  pid: string;
}>;

export default async function Page({ params }: { params: PageParams }) {
  const geneId = decodeURIComponent((await params).pid);
  const data = await getGeneSummary(geneId);
  return <GenePage {...data} />;
}

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const mgiGeneAccessionId = decodeURIComponent((await params).pid);
  if (!mgiGeneAccessionId || mgiGeneAccessionId === "null") {
    notFound();
  }
  const geneSummary = await fetchGeneSummary(mgiGeneAccessionId);
  if (!geneSummary) {
    notFound();
  }
  const { geneSymbol, geneName } = geneSummary;
  const title = `${geneSymbol} | ${geneName} mouse gene | IMPC`;
  const description = `Discover mouse gene ${geneSymbol} significant phenotypes, expression, images, histopathology and more. Data for gene ${geneSymbol} is freely available to download.`;
  const genePageURL = `${WEBSITE_URL}/data/genes/${mgiGeneAccessionId}`;
  return {
    title: title,
    description: description,
    keywords: [
      geneSymbol,
      geneName,
      "mouse",
      "gene",
      "phenotypes",
      "alleles",
      "diseases",
    ],
    alternates: { canonical: genePageURL },
    openGraph: {
      title: title,
      url: genePageURL,
      description: description,
      type: "website",
    },
  };
}
