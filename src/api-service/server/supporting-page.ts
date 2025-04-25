import { Dataset, HistopathologyResponse } from "@/models";
import { fetchAPIFromServer, fetchURL } from "@/api-service";
import { ChartPageParamsObj } from "@/models/chart";
import { generateDatasetsEndpointUrl } from "@/hooks/datasets.query";

const KUBERNETES_NAMESPACE = process.env.KUBERNETES_NAMESPACE ?? "default";
const WEBSITE_ENV = process.env.WEBSITE_ENV || "production";

export async function fetchInitialDatasets(
  mgiGeneAccessionId: string,
  params: ChartPageParamsObj,
): Promise<Array<Dataset>> {
  const internalServiceDomain = `http://impc-dataset-service.${KUBERNETES_NAMESPACE}:8080/v1`;
  let endpointURL = !!params.mpTermId
    ? `${internalServiceDomain}/datasets?mgiGeneAccessionId=${mgiGeneAccessionId}&significantPhenotypeId=${params.mpTermId}`
    : `${internalServiceDomain}/datasets/find_by_multiple_parameter?mgiGeneAccessionId=${mgiGeneAccessionId}&alleleAccessionId=${params.alleleAccessionId}&zygosity=${params.zygosity}&parameterStableId=${params.parameterStableId}&pipelineStableId=${params.pipelineStableId}&procedureStableId=${params.procedureStableId}&phenotypingCentre=${params.phenotypingCentre}`;
  if (!params.mpTermId && !!params.metadataGroup) {
    endpointURL += `&metadataGroup=${params.metadataGroup}`;
  }
  try {
    return await (WEBSITE_ENV === "local"
      ? fetchAPIFromServer<Array<Dataset>>(
          generateDatasetsEndpointUrl(mgiGeneAccessionId, params),
        )
      : fetchURL<Array<Dataset>>(endpointURL));
  } catch (error) {
    return [];
  }
}

export async function fetchHistopathChartData(
  mgiGeneAccessionId: string,
): Promise<HistopathologyResponse> {
  const endpointURL = `http://impc-histopathology-service.${KUBERNETES_NAMESPACE}:8080/v1/histopathology?mgiGeneAccessionId=${mgiGeneAccessionId}`;
  try {
    return await (WEBSITE_ENV === "local"
      ? fetchAPIFromServer<HistopathologyResponse>(
          `/api/v1/genes/${mgiGeneAccessionId}/histopathology`,
        )
      : fetchURL<HistopathologyResponse>(endpointURL));
  } catch (error) {
    return {
      id: "",
      mgiGeneAccessionId: "",
      datasets: [],
    };
  }
}
