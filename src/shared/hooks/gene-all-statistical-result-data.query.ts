import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/api-service";
import { GeneStatisticalResult } from "@/models/gene";

const getMutantCount = (dataset: GeneStatisticalResult) => {
  if (!dataset.maleMutantCount && !dataset.femaleMutantCount) {
    return "N/A";
  }
  return `${dataset.maleMutantCount || 0}m/${dataset.femaleMutantCount || 0}f`;
};

export const useGeneAllStatisticalResData = (
  mgiAccessionId: string,
  enabled: boolean
) => {
  const {
    data: geneData = [],
    isFetching: isGeneFetching,
    isError: isGeneError,
    ...rest
  } = useQuery({
    queryKey: ["genes", mgiAccessionId, "statistical-result"],
    queryFn: () =>
      fetchAPI(`/api/v1/genes/${mgiAccessionId}/statistical-result`),
    enabled,
    select: (data: Array<GeneStatisticalResult>) => {
      return data
        .map((dataset) => ({
          ...dataset,
          pValue: Number(dataset.pValue),
          mutantCount: getMutantCount(dataset),
        }))
        .filter(
          (dataset) => dataset.status !== "NotProcessed"
        ) as Array<GeneStatisticalResult>;
    },
    placeholderData: [],
  });
  return {
    geneData,
    isGeneFetching,
    isGeneError,
    rest,
  };
};
