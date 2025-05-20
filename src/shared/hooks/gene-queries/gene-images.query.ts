import { useQuery } from "@tanstack/react-query";
import { GeneImage } from "@/models/gene";
import { fetchData } from "@/api-service";
import geneChromosomeMap from "@/static-data/chromosome-map.json";


export const useGeneImagesQuery = (
  mgiGeneAccessionId: string,
) => {
  const chromosome: string = geneChromosomeMap[mgiGeneAccessionId];
  const id = mgiGeneAccessionId.replace(":", "-");
  return useQuery<Array<GeneImage>>({
    queryKey: ["genes", mgiGeneAccessionId, "images"],
    queryFn: () => fetchData(`${chromosome}/${id}/images.json`),
    enabled: !!mgiGeneAccessionId,
    select: (data) => data as Array<GeneImage>,
  });
}