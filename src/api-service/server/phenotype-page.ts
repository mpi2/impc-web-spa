import { fetchAPIFromServer, fetchURL } from "@/api-service";
import { PhenotypeGenotypes, PhenotypeSummary } from "@/models/phenotype";

const KUBERNETES_NAMESPACE = process.env.KUBERNETES_NAMESPACE ?? "default";
const WEBSITE_ENV = process.env.WEBSITE_ENV || "production";

export async function fetchPhenotypeSummary(
  phenotypeId: string,
): Promise<PhenotypeSummary> {
  const endpointURL = `http://impc-summary-service.${KUBERNETES_NAMESPACE}:8080/v1/phenotype_summary?phenotypeId=${phenotypeId}`;
  return await (WEBSITE_ENV === "local"
    ? fetchAPIFromServer<PhenotypeSummary>(
        `/api/v1/phenotypes/${phenotypeId}/summary`,
      )
    : fetchURL<PhenotypeSummary>(endpointURL));
}

export async function fetchPhenotypeGenotypeHits(
  phenotypeId: string,
): Promise<Array<PhenotypeGenotypes>> {
  const endpointURL = `http://impc-phenotype-hits-service.${KUBERNETES_NAMESPACE}:8080/v1/phenotypehits?anyPhenotypeId=${phenotypeId}`;
  try {
    return await (WEBSITE_ENV === "local"
      ? fetchAPIFromServer<Array<PhenotypeGenotypes>>(
          `/api/v1/phenotypes/${phenotypeId}/genotype-hits/by-any-phenotype-Id`,
        )
      : fetchURL<Array<PhenotypeGenotypes>>(endpointURL));
  } catch (error) {
    return [];
  }
}
