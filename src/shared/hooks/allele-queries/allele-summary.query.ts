import { useQuery } from "@tanstack/react-query";
import { AlleleSummary } from "@/models";
import { fetchData } from "@/api-service";
import geneChromosomeMap from "@/static-data/chromosome-map.json";

export const useAlleleSummaryQuery = (
  mgiGeneAccessionId: string,
  alleleSymbol: string,
) => {
  const chromosome: string = geneChromosomeMap[mgiGeneAccessionId];
  const id = mgiGeneAccessionId.replace(":", "_");
  return useQuery<AlleleSummary>({
    queryKey: ["genes", mgiGeneAccessionId, "alleles", alleleSymbol, "summary"],
    queryFn: () =>
      fetchData(`${chromosome}/${id}/alleles/${alleleSymbol}/summary.json`),
    enabled: !!mgiGeneAccessionId,
  });
};
