import { Metadata } from "next";
import ImageDownloaderPage from "./image-downloader-page";
import { notFound } from "next/navigation";
import {
  fetchControlImages,
  fetchGeneSummary,
  fetchMutantImages,
} from "@/api-service";

type PageParams = Promise<{
  pid: string;
  parameterStableId: string;
}>;

async function getImages(
  mgiGeneAccessionId: string,
  parameterStableId: string,
) {
  const controlImages = await fetchControlImages(parameterStableId);
  const mutantImages = await fetchMutantImages(
    mgiGeneAccessionId,
    parameterStableId,
  );
  return {
    controlImages,
    mutantImages,
  };
}

export default async function Page({ params }: { params: PageParams }) {
  const mgiGeneAccessionId = (await params).pid;
  const parameterStableId = (await params).parameterStableId;
  return (
    <ImageDownloaderPage
      controlImagesFromServer={[]}
      mutantImagesFromServer={[]}
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
  const title = `${geneSymbol} image downloader | International Mouse Phenotyping Consortium`;
  return {
    title: title,
  };
}
