import { useQuery } from "@tanstack/react-query";
import { GeneHistopathology } from "@/models/gene";
import { fetchAPI } from "@/api-service";
import geneChromosomeMap from "@/static-data/chromosome-map.json";

export const useGeneHistopathologyQuery = (
  mgiGeneAccessionId: string,
) => {
  const chromosome: string = geneChromosomeMap[mgiGeneAccessionId];
  const id = mgiGeneAccessionId.replace(":", "-");
  return useQuery<
    Array<GeneHistopathology>
  >({
    queryKey: ["genes", mgiGeneAccessionId, "histopathology"],
    queryFn: () =>
      fetchAPI(`${chromosome}/${id}/gene_histopathology.json`),
    enabled: !!mgiGeneAccessionId,
    select: (data) => data as Array<GeneHistopathology>,
  });
}