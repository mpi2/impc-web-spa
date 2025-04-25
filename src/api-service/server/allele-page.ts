import { fetchAPIFromServer, fetchURL } from "@/api-service";
import { AlleleSummary } from "@/models";
const KUBERNETES_NAMESPACE = process.env.KUBERNETES_NAMESPACE ?? "default";
const WEBSITE_ENV = process.env.WEBSITE_ENV || "production";

export async function fetchAlleleSummary(
  mgiGeneAccessionId: string,
  alleleName: string,
): Promise<AlleleSummary> {
  const endpointURL = `http://impc-allele-service.${KUBERNETES_NAMESPACE}:8080/v1/alleles?mgiGeneAccessionId=${mgiGeneAccessionId}&alleleName=${alleleName}`;
  return await (WEBSITE_ENV === "local"
    ? fetchAPIFromServer<AlleleSummary>(
        `/api/v1/alleles/${mgiGeneAccessionId}/${alleleName}`,
      )
    : fetchURL<AlleleSummary>(endpointURL));
}
