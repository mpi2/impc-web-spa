import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/api-service";
import geneChromosomeMap from "@/static-data/chromosome-map.json";

export const useAlleleMiceQuery = (
  mgiGeneAccessionId: string,
  alleleSymbol: string,
) => {
  const chromosome: string = geneChromosomeMap[mgiGeneAccessionId];
  const id = mgiGeneAccessionId.replace(":", "_");
  return useQuery({
    queryKey: ["genes", mgiGeneAccessionId, "alleles", "mice", alleleSymbol],
    queryFn: () =>
      fetchData(`${chromosome}/${id}/alleles/${alleleSymbol}/mice.json`),
    placeholderData: [],
  });
};
