import geneChromosomeMap from "@/static-data/chromosome-map.json";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/api-service";
import { Publication } from "@/components/PublicationsList/types.ts";

export const useGenePublicationsQuery = (
  mgiGeneAccessionId: string,
) => {
  const chromosome: string = geneChromosomeMap[mgiGeneAccessionId];
  const id = mgiGeneAccessionId?.replace(":", "-");
  return useQuery<Array<Publication>>({
    queryKey: ["genes", mgiGeneAccessionId, "publications"],
    queryFn: () => fetchData(`${chromosome}/${id}/publications.json`),
    enabled: !!mgiGeneAccessionId && !!id,
  });
}