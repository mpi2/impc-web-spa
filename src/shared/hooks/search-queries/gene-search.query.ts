import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/api-service";
import { GeneSearchItem, GeneSearchResponse } from "@/models/gene";

export const useGeneSearchQuery = () => {
  return useQuery({
    queryKey: ["search", "genes"],
    queryFn: () => fetchData(`gene_search.json`),
    select: (data: GeneSearchResponse) =>
      data.results.map((r) => ({
        ...r.entityProperties,
        entityId: r.entityId,
      })) as Array<GeneSearchItem>,
    placeholderData: { results: [] },
    staleTime: Infinity,
  });
};
