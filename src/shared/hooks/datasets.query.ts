import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/api-service";
import { Dataset } from "@/models";
import { ChartPageParamsObj } from "@/models/chart";
import geneChromosomeMap from "@/static-data/chromosome-map.json";

export const generateDatasetsEndpointUrl = (
  mgiGeneAccessionId: string,
  params: ChartPageParamsObj,
) => {
  const chromosome: string = geneChromosomeMap[mgiGeneAccessionId];
  const id = mgiGeneAccessionId?.replace(":", "_");
  let endpointUrl = !!params.mpTermId
    ? `${chromosome}/${id}/significant_phenotypes/${params.mpTermId.replace(":", "_")}.json`
    : `${chromosome}/${id}/datasets/${params.statisticalResultId}.json`;
  if (!params.mpTermId && !!params.metadataGroup) {
    endpointUrl += `&metadataGroup=${params.metadataGroup}`;
  }
  return endpointUrl;
};

export const sortAndDeduplicateDatasets = (
  input: Array<Dataset>,
  params: ChartPageParamsObj,
) => {
  input.sort((a, b) => {
    return a["reportedPValue"] - b["reportedPValue"];
  });
  return input
    ?.filter((d) => {
      const alelleMatch = !!params.alleleAccessionId
        ? d.alleleAccessionId === params.alleleAccessionId
        : true;
      const lifeStageMatch = !!params.lifeStageName
        ? d.lifeStageName === params.lifeStageName
        : true;
      return alelleMatch && lifeStageMatch;
    })
    ?.filter(
      (value, index, self) =>
        self.findIndex((v) => v.datasetId === value.datasetId) === index,
    ) as Array<Dataset>;
};

export const useDatasetsQuery = (
  mgiGeneAccessionId: string,
  params: ChartPageParamsObj,
  enabled: boolean,
) => {
  const apiUrl = generateDatasetsEndpointUrl(mgiGeneAccessionId, params);
  const { data, ...rest } = useQuery({
    queryKey: ["genes", mgiGeneAccessionId, params.mpTermId, apiUrl, "dataset"],
    queryFn: () => fetchData(apiUrl),
    enabled,
    select: (data) => sortAndDeduplicateDatasets(data, params),
    placeholderData: [],
  });
  return {
    ...rest,
    datasetSummaries: data,
  };
};
