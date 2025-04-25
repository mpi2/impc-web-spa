import { fetchAPIFromServer, fetchURL } from "../index";
import { GeneSearchResponse } from "@/models/gene";
import { PhenotypeSearchResponse } from "@/models/phenotype";

const KUBERNETES_NAMESPACE = process.env.KUBERNETES_NAMESPACE ?? "default";
const WEBSITE_ENV = process.env.WEBSITE_ENV || "production";

export async function fetchGeneSearchResults(
  query: string | undefined,
): Promise<GeneSearchResponse> {
  const endpointURL = `http://impc-search-service.${KUBERNETES_NAMESPACE}:8080/v1/search?prefix=${query}`;
  try {
    return await (WEBSITE_ENV === "local"
      ? fetchAPIFromServer<GeneSearchResponse>(
          `/api/search/v1/search?prefix=${query}`,
        )
      : fetchURL<GeneSearchResponse>(endpointURL));
  } catch (error) {
    return { numResults: 0, results: [] };
  }
}

export async function fetchPhenotypeSearchResults(
  query: string | undefined,
): Promise<PhenotypeSearchResponse> {
  const endpointURL = `http://impc-search-service.${KUBERNETES_NAMESPACE}:8080/v1/search?type=PHENOTYPE&prefix=${query}`;
  try {
    return await (WEBSITE_ENV === "local"
      ? fetchAPIFromServer<PhenotypeSearchResponse>(
          `/api/search/v1/search?prefix=${query}&type=PHENOTYPE`,
        )
      : fetchURL<PhenotypeSearchResponse>(endpointURL));
  } catch (error) {
    return { numResults: 0, results: [] };
  }
}
