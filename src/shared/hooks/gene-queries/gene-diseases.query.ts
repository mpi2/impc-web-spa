import geneChromosomeMap from "@/static-data/chromosome-map.json";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/api-service";
import { GeneDisease } from "@/models/gene";

export const useGeneDiseasesQuery = (
  mgiGeneAccessionId: string,
  type: "associated" | "predicted",
) => {
  const chromosome: string = geneChromosomeMap[mgiGeneAccessionId];
  const id = mgiGeneAccessionId?.replace(":", "_");
  const url =
    type === "associated"
      ? `${chromosome}/${id}/associated-diseases.json`
      : `${chromosome}/${id}/predicted-diseases.json`;
  return useQuery<Array<GeneDisease>>({
    queryKey: ["genes", mgiGeneAccessionId, "disease", type],
    queryFn: () => fetchData(url),
    enabled: !!mgiGeneAccessionId && !!id,
    placeholderData: [],
  });
};
