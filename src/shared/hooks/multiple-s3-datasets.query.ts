import { useQueries } from "@tanstack/react-query";
import { fetchDatasetFromS3 } from "@/api-service";
import { Dataset } from "@/models";

export const useMultipleS3DatasetsQuery = (key: string, datasets: Array<Dataset>) => {
  const results = useQueries({
    queries: datasets.map((d) => ({
      queryKey: [key, d.datasetId],
      queryFn: () => fetchDatasetFromS3(d.datasetId),
    })),
  });
  return {
    hasLoadedAllData: results.every(res => !res.isLoading),
    results: results.filter(d => !!d.isSuccess).map(d => d.data),
  };
};
