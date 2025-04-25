import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/api-service";
import { GeneSummary } from "@/models/gene";

export const useGeneSummaryQuery = (
  mgiGeneAccessionId: string,
  routerIsReady: boolean,
  geneFromServer?: GeneSummary | null,
) => {
  return useQuery({
    queryKey: ["genes", mgiGeneAccessionId, "summary"],
    queryFn: () => fetchAPI(`/api/v1/genes/${mgiGeneAccessionId}/summary`),
    enabled: routerIsReady && !!mgiGeneAccessionId,
    select: (data) => data as GeneSummary,
    initialData: geneFromServer,
  });
};
