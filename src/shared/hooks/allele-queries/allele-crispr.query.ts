import geneChromosomeMap from "@/static-data/chromosome-map.json";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/api-service";

export const useAlleleCRISPRQuery = (
  mgiGeneAccessionId: string,
  alleleSymbol: string,
) => {
  const chromosome: string = geneChromosomeMap[mgiGeneAccessionId];
  const id = mgiGeneAccessionId.replace(":", "-");
  return useQuery({
    queryKey: ["genes", mgiGeneAccessionId, "alleles", "CRISPR", alleleSymbol],
    queryFn: () => fetchData(`${chromosome}/${id}/alleles/${alleleSymbol}/crispr.json`),
    select: (data) => (data ?? [])[0] || undefined,
  });
}