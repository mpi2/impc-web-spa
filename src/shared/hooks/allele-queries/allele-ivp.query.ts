import geneChromosomeMap from "@/static-data/chromosome-map.json";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/api-service";

export const useAlleleIVPQuery = (
  mgiGeneAccessionId: string,
  alleleSymbol: string,
) => {
  const chromosome: string = geneChromosomeMap[mgiGeneAccessionId];
  const id = mgiGeneAccessionId.replace(":", "_");
  return useQuery({
    queryKey: ["genes", mgiGeneAccessionId, "alleles", "ivp", alleleSymbol],
    queryFn: () =>
      fetchData(`${chromosome}/${id}/alleles/${alleleSymbol}/ivp.json`),
    placeholderData: [],
  });
};
