import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/api-service";
import geneChromosomeMap from "@/static-data/chromosome-map.json";

export const useAlleleESCellQuery = (
  mgiGeneAccessionId: string,
  alleleSymbol: string,
) => {
  const chromosome: string = geneChromosomeMap[mgiGeneAccessionId];
  const id = mgiGeneAccessionId.replace(":", "-");
  return useQuery({
    queryKey: ["genes", mgiGeneAccessionId, "alleles", alleleSymbol, "es_cell"],
    queryFn: () => fetchData(`${chromosome}/${id}/alleles/${alleleSymbol}/es_cell.json`),
    enabled: !!mgiGeneAccessionId,
  });
}