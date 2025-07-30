import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/api-service";
import { GeneSummary } from "@/models/gene";
import geneChromosomeMap from "@/static-data/chromosome-map.json";

export const useGeneSummaryQuery = (
  mgiGeneAccessionId: string,
  routerIsReady: boolean,
) => {
  const chromosome: string = geneChromosomeMap[mgiGeneAccessionId];
  const id = mgiGeneAccessionId?.replace(":", "_");
  return useQuery({
    queryKey: ["genes", mgiGeneAccessionId, "summary"],
    queryFn: () => {
      if (!chromosome) {
        return Promise.reject("No content");
      }
      return fetchData(`${chromosome}/${id}/gene-summary.json`);
    },
    enabled: routerIsReady && !!mgiGeneAccessionId && !!id,
    select: (data) => data as GeneSummary,
  });
};
