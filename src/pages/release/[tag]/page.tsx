import { fetchReleaseNotesData } from "@/api-service";
import { Metadata } from "next";
import { ReleaseNotesPage } from "@/components";

type PageParams = {
  params: Promise<{ tag: string }>;
};

export default async function Page({ params }: PageParams) {
  const tag = (await params).tag;
  const drMetadata = await fetchReleaseNotesData(tag);
  return <ReleaseNotesPage releaseMetadata={drMetadata} />;
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const tag = (await params).tag;
  const drMetadata = await fetchReleaseNotesData(tag);
  return {
    title: `IMPC Data Release ${drMetadata.dataReleaseVersion} | International Mouse Phenotyping Consortium`,
  };
}
