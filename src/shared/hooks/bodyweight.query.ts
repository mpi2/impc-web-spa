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
      const allData = await fetchData<Array<any>>(
        `${chromosome}/${id}/bodyweight-curve.json`,
      );
      const summariesRequest = await fetchData<Array<any>>(
        `${chromosome}/${id}/bodyweight-datasets-metadata.json`,
      );

      return summariesRequest.map((dataset) => {
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
