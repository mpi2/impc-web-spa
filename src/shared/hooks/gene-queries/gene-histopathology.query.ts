import { useQuery } from "@tanstack/react-query";
import { GeneHistopathology } from "@/models/gene";
import { fetchData } from "@/api-service";
import geneChromosomeMap from "@/static-data/chromosome-map.json";

export const useGeneHistopathologyQuery = (
  mgiGeneAccessionId: string,
) => {
  const chromosome: string = geneChromosomeMap[mgiGeneAccessionId];
  const id = mgiGeneAccessionId?.replace(":", "_");
  return useQuery<
    Array<GeneHistopathology>
  >({
    queryKey: ["genes", mgiGeneAccessionId, "histopathology"],
    queryFn: () => fetchData(`${chromosome}/${id}/gene-histopathology.json`),
    enabled: !!mgiGeneAccessionId && !!id,
    select: (data) => data as Array<GeneHistopathology>,
  });
}