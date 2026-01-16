import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/api-service";
import { GeneStatisticalResult } from "@/models/gene";
import geneChromosomeMap from "@/static-data/chromosome-map.json";

const getMutantCount = (dataset: GeneStatisticalResult) => {
  if (!dataset.maleMutantCount && !dataset.femaleMutantCount) {
    return "N/A";
  }
  return `${dataset.maleMutantCount || 0}m/${dataset.femaleMutantCount || 0}f`;
};

export const useGeneAllStatisticalResData = (
  mgiAccessionId: string,
  enabled: boolean,
  removeNotProcessedData = true,
) => {
  const chromosome: string = (geneChromosomeMap as Record<string, string>)[
    mgiAccessionId
  ];
  const id = mgiAccessionId?.replace(":", "_");
  const {
    data: geneData = [],
    isFetching: isGeneFetching,
    isError: isGeneError,
    ...rest
  } = useQuery({
    queryKey: ["genes", mgiAccessionId, "statistical-result"],
    queryFn: () =>
      fetchData<Array<GeneStatisticalResult>>(
        `${chromosome}/${id}/stats-results.json`,
      ),
    enabled: enabled && !!id,
    select: (data) => {
      return data
        .map((dataset) => ({
          ...dataset,
          pValue: Number(dataset.pValue),
          mutantCount: getMutantCount(dataset),
        }))
        .filter((dataset) => {
          return removeNotProcessedData
            ? dataset.status !== "NotProcessed"
            : true;
        }) as Array<GeneStatisticalResult>;
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
