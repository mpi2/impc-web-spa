import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/api-service";
import { Publication } from "@/components/PublicationsList/types.ts";

export const usePublicationsQuery = (onlyConsortiumPublications: boolean) => {
  return useQuery<Array<Publication>>({
    queryKey: ["publications", onlyConsortiumPublications],
    queryFn: () => {
      let fileName = onlyConsortiumPublications
        ? "consortium_publications.json"
        : "all_publications.json";
      return fetchData(fileName);
    },
  });
};
