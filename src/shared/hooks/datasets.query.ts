import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/api-service";
import { Dataset } from "@/models";
import { ChartPageParamsObj } from "@/models/chart";

export const generateDatasetsEndpointUrl = (
  mgiGeneAccessionId: string,
  params: ChartPageParamsObj,
) => {
  let endpointUrl = !!params.mpTermId
    ? `/api/v1/genes/${mgiGeneAccessionId}/${params.mpTermId}/dataset/`
    : `/api/v1/genes/dataset/find_by_multiple_parameter?mgiGeneAccessionId=${mgiGeneAccessionId}&alleleAccessionId=${params.alleleAccessionId}&zygosity=${params.zygosity}&parameterStableId=${params.parameterStableId}&pipelineStableId=${params.pipelineStableId}&procedureStableId=${params.procedureStableId}&phenotypingCentre=${params.phenotypingCentre}`;
  if (!params.mpTermId && !!params.metadataGroup) {
    endpointUrl += `&metadataGroup=${params.metadataGroup}`;
  }
  return endpointUrl;
};

export const sortAndDeduplicateDatasets = (input: Array<Dataset>) => {
  input.sort((a, b) => {
    return a["reportedPValue"] - b["reportedPValue"];
  });
  return input?.filter(
    (value, index, self) =>
      self.findIndex((v) => v.datasetId === value.datasetId) === index,
  ) as Array<Dataset>;
};

export const useDatasetsQuery = (
  mgiGeneAccessionId: string,
  params: ChartPageParamsObj,
  enabled: boolean,
  initialDatasets: Array<Dataset>,
) => {
  const apiUrl = generateDatasetsEndpointUrl(mgiGeneAccessionId, params);
  const { data, ...rest } = useQuery({
    queryKey: ["genes", mgiGeneAccessionId, params.mpTermId, apiUrl, "dataset"],
    queryFn: () => fetchAPI(apiUrl),
    enabled,
    select: sortAndDeduplicateDatasets,
    placeholderData: [],
  });
  return {
    ...rest,
    datasetSummaries: data,
  };
};
