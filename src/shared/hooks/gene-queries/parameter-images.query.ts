import { useQuery } from "@tanstack/react-query";
import { GeneImageCollection } from "@/models/gene";
import { fetchData } from "@/api-service";
import geneChromosomeMap from "@/static-data/chromosome-map.json";

export const useGeneParameterImages = (
  mgiGeneAccessionId: string,
  parameterStableId: string,
  type: "mutant" | "wildtype",
) => {
  const chromosome: string = geneChromosomeMap[mgiGeneAccessionId];
  const id = mgiGeneAccessionId.replace(":", "_");
  return useQuery<Array<GeneImageCollection>>({
    queryKey: ["genes", mgiGeneAccessionId, "images", parameterStableId, type],
    queryFn: () => fetchData(`${chromosome}/${id}/images/${parameterStableId}/${type}.json`),
    enabled: !!parameterStableId && !!mgiGeneAccessionId,
    placeholderData: [],
  })
};
