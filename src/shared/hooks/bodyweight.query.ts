import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/api-service";
import geneChromosomeMap from "@/static-data/chromosome-map.json";

export const useBodyWeightQuery = (
  mgiGeneAccessionId: string,
  routerIsReady: boolean,
) => {
  const { data, isLoading, ...rest } = useQuery({
    queryKey: ["genes", mgiGeneAccessionId, "all", "bodyweight"],
    queryFn: async () => {
      const chromosome: string = (geneChromosomeMap as Record<string, string>)[
        mgiGeneAccessionId
      ];
      const id = mgiGeneAccessionId?.replace(":", "_");
      const allData = await fetchData(
        `${chromosome}/${id}/bodyweight-curve.json`,
      );
      const summariesRequest = await Promise.allSettled(
        allData.map((dataset) =>
          fetchData(`${chromosome}/${id}/datasets/${dataset.datasetId}.json`),
        ),
      );

      return summariesRequest
        .filter((response) => response.status === "fulfilled")
        .map((response: PromiseFulfilledResult<any>) => response.value[0])
        .map((dataset) => {
          const chartData = allData.find(
            (d) => d.datasetId === dataset.datasetId,
          );
          return {
            ...dataset,
            chartData: chartData.dataPoints,
          };
        });
    },
    enabled: routerIsReady,
    placeholderData: [],
  });
  return {
    bodyWeightData: data,
    isBodyWeightLoading: isLoading,
    ...rest,
  };
};
