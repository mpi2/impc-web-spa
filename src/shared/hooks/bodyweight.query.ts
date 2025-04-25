import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/api-service";


export const useBodyWeightQuery = (mgiGeneAccessionId: string, routerIsReady: boolean) => {
  const {data, isLoading, ...rest} = useQuery({
    queryKey: ["genes", mgiGeneAccessionId, "all", "bodyweight"],
    queryFn: async () => {
      const allData = await fetchAPI(`/api/v1/bodyweight/byMgiGeneAccId?mgiGeneAccId=${mgiGeneAccessionId}`);
      const summariesRequest = await Promise.allSettled(allData.map(dataset =>
        fetchAPI(`/api/v1/genes/${dataset.datasetId}/dataset`)
      ));

      return summariesRequest
        .filter(response => response.status === 'fulfilled')
        .map((response: PromiseFulfilledResult<any>) => response.value[0])
        .map(dataset => {
          const chartData = allData.find(d => d.datasetId === dataset.datasetId);
          return {
            ...dataset,
            chartData: chartData.dataPoints
          }
        })
    },
    enabled: routerIsReady,
    placeholderData: []
  });
  return {
    bodyWeightData: data,
    isBodyWeightLoading: isLoading,
    ...rest,
  }
}