import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/api-service";
import { Publication } from "@/components/PublicationsList/types.ts";
import lunr from "lunr";

export const usePublicationsQuery = (onlyConsortiumPublications: boolean) => {
  return useQuery<Array<Publication>>({
    queryKey: ["publications", onlyConsortiumPublications],
    queryFn: () => {
      let fileName = onlyConsortiumPublications
        ? "publications/consortium_publications.json"
        : "publications/all_publications.json";
      return fetchData(fileName);
    },
    staleTime: Infinity,
  });
};

export const usePublicationsSearchIndexQuery = (
  onlyConsortiumPublications: boolean,
) => {
  return useQuery({
    queryKey: ["publications", "search-index", onlyConsortiumPublications],
    queryFn: () => {
      let fileName = onlyConsortiumPublications
        ? "publications/consortium_publications_index.json"
        : "publications/all_publications_index.json";
      return fetchData(fileName);
    },
    select: (data) => lunr.Index.load(data),
    staleTime: Infinity,
  });
};
