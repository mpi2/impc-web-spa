import {
  GeneDisease,
  GeneExpression,
  GeneHistopathology,
  GeneImage,
  GeneOrder,
  GenePhenotypeHits,
  GeneSummary,
} from "@/models/gene";
import { fetchAPIFromServer, fetchURL } from "@/api-service";
import { processGeneOrderResponse } from "@/hooks/gene-order.query";
import { processGenePhenotypeHitsResponse } from "@/hooks/significant-phenotypes.query";

const KUBERNETES_NAMESPACE = process.env.KUBERNETES_NAMESPACE ?? "default";
const WEBSITE_ENV = process.env.WEBSITE_ENV || "production";

export async function fetchGeneSummary(
  mgiGeneAccessionId: string,
): Promise<GeneSummary | null> {
  const endpointURL = `http://impc-summary-service.${KUBERNETES_NAMESPACE}:8080/v1/gene_summary?mgiGeneAccessionId=${mgiGeneAccessionId}`;

  try {
    return await (WEBSITE_ENV === "local"
      ? fetchAPIFromServer<GeneSummary>(
          `/api/v1/genes/${mgiGeneAccessionId}/summary`,
        )
      : fetchURL<GeneSummary>(endpointURL));
  } catch (error) {
    return null;
  }
}

export async function fetchGenePhenotypeHits(
  mgiGeneAccessionId: string,
): Promise<Array<GenePhenotypeHits>> {
  const endpointURL = `http://impc-phenotype-hits-service.${KUBERNETES_NAMESPACE}:8080/v1/phenotypehits?mgiGeneAccessionId=${mgiGeneAccessionId}`;
  try {
    const data = await (WEBSITE_ENV === "local"
      ? fetchAPIFromServer<Array<GenePhenotypeHits>>(
          `/api/v1/genes/${mgiGeneAccessionId}/phenotype-hits`,
        )
      : fetchURL<Array<GenePhenotypeHits>>(endpointURL));
    return processGenePhenotypeHitsResponse(data);
  } catch (error) {
    return [];
  }
}

export async function fetchGeneOrderData(
  mgiGeneAccessionId: string,
): Promise<Array<GeneOrder>> {
  const endpointURL = `http://impc-order-service.${KUBERNETES_NAMESPACE}:8080/v1/orders?mgiGeneAccessionId=${mgiGeneAccessionId}`;
  try {
    const data = await (WEBSITE_ENV === "local"
      ? fetchAPIFromServer<Array<GeneOrder>>(
          `/api/v1/genes/${mgiGeneAccessionId}/order`,
        )
      : fetchURL<Array<GeneOrder>>(endpointURL));
    return processGeneOrderResponse(data);
  } catch (error) {
    return [];
  }
}

export async function fetchGeneExpressionData(
  mgiGeneAccessionId: string,
): Promise<Array<GeneExpression>> {
  const endpointURL = `http://impc-expression-service.${KUBERNETES_NAMESPACE}:8080/v1/expression?mgiGeneAccId=${mgiGeneAccessionId}`;
  try {
    return await (WEBSITE_ENV === "local"
      ? fetchAPIFromServer<Array<GeneExpression>>(
          `/api/v1/genes/${mgiGeneAccessionId}/expression`,
        )
      : fetchURL<Array<GeneExpression>>(endpointURL));
  } catch (error) {
    return [];
  }
}

export async function fetchGeneImageData(
  mgiGeneAccessionId: string,
): Promise<Array<GeneImage>> {
  const endpointURL = `http://impc-gene-image-service.${KUBERNETES_NAMESPACE}:8080/v1/geneimage?mgiGeneAccessionId=${mgiGeneAccessionId}`;
  try {
    return await (WEBSITE_ENV === "local"
      ? fetchAPIFromServer<Array<GeneImage>>(
          `/api/v1/genes/${mgiGeneAccessionId}/images`,
        )
      : fetchURL<Array<GeneImage>>(endpointURL));
  } catch (error) {
    return [];
  }
}

export async function fetchGeneHistopathologyData(
  mgiGeneAccessionId: string,
): Promise<Array<GeneHistopathology>> {
  const endpointURL = `http://impc-histopathology-service.${KUBERNETES_NAMESPACE}:8080/v1/gene_histopathology?mgiGeneAccessionId=${mgiGeneAccessionId}`;
  try {
    return await (WEBSITE_ENV === "local"
      ? fetchAPIFromServer<Array<GeneHistopathology>>(
          `/api/v1/genes/${mgiGeneAccessionId}/gene_histopathology`,
        )
      : fetchURL<Array<GeneHistopathology>>(endpointURL));
  } catch (error) {
    return [];
  }
}

export async function fetchGeneDiseaseData(
  mgiGeneAccessionId: string,
  associationCurated: boolean,
): Promise<Array<GeneDisease>> {
  const endpointURL = `http://impc-diseases-service.${KUBERNETES_NAMESPACE}:8080/v1/disease/json?mgiGeneAccessionId=${mgiGeneAccessionId}&associationCurated=${associationCurated}`;
  try {
    return await (WEBSITE_ENV === "local"
      ? fetchAPIFromServer<Array<GeneDisease>>(
          `/api/v1/genes/${mgiGeneAccessionId}/disease/json?associationCurated=${associationCurated}`,
        )
      : fetchURL<Array<GeneDisease>>(endpointURL));
  } catch (error) {
    return [];
  }
}
