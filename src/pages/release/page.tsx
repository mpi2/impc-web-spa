import { fetchLandingPageData } from "@/api-service";
import { ReleaseNotesPage } from "@/components";
import { Metadata } from "next";

async function getRecentDRData() {
  return await fetchLandingPageData("release_metadata", { cache: "no-store" });
}

export async function generateMetadata(): Promise<Metadata> {
  const mostRecentDRMetadata = await getRecentDRData();
  return {
    title: `IMPC Data Release ${mostRecentDRMetadata.dataReleaseVersion} | International Mouse Phenotyping Consortium`,
  };
}

export default async function Page() {
  const mostRecentDRMetadata = await getRecentDRData();
  return <ReleaseNotesPage releaseMetadata={mostRecentDRMetadata} />;
}
