import { notFound } from "next/navigation";
import {
  fetchPhenotypeGenotypeHits,
  fetchPhenotypeSummary,
} from "@/api-service";
import PhenotypePage from "./phenotype-page";
import { Metadata } from "next";
import { PhenotypeSummary } from "@/models/phenotype";

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL;

async function getPhenotypeSummary(phenotypeId: string) {
  let data: PhenotypeSummary;
  try {
    data = await fetchPhenotypeSummary(phenotypeId);
  } catch {
    notFound();
  }

  return data;
}

type PageParams = Promise<{
  id: string;
}>;

export default async function Page({ params }: { params: PageParams }) {
  const phenotypeId = decodeURIComponent((await params).id);
  const phenotypeData = await getPhenotypeSummary(phenotypeId);
  return (
    <PhenotypePage
      phenotypeId={phenotypeId}
      phenotype={phenotypeData}
      phenotypeHits={[]}
    />
  );
}

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const phenotypeId = decodeURIComponent((await params).id);
  if (!phenotypeId || phenotypeId === "null") {
    notFound();
  }
  const phenotypeSummary = await fetchPhenotypeSummary(phenotypeId);
  if (!phenotypeSummary) {
    notFound();
  }
  const { phenotypeName } = phenotypeSummary;
  const title = `${phenotypeId} (${phenotypeName}) phenotype | IMPC`;
  const description = `Discover ${phenotypeName} significant genes, associations, procedures and more. Data for phenotype ${phenotypeName} is all freely available for download.`;
  const phenotypePageURL = `${WEBSITE_URL}/data/phenotypes/${phenotypeId}`;
  return {
    title: title,
    description: description,
    keywords: [
      phenotypeId,
      phenotypeName,
      "mouse",
      "gene",
      "phenotypes",
      "alleles",
      "diseases",
    ],
    alternates: { canonical: phenotypePageURL },
    openGraph: {
      title: title,
      url: phenotypePageURL,
      description: description,
      type: "website",
    },
  };
}
