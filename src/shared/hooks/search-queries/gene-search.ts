import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/api-service";
import { GeneSearchItem, GeneSearchResponse } from "@/models/gene";
import { useGeneSearchQuery, useSearchWebWorker } from "@/hooks";
import { useGeneSearchResultWorker } from "@/workers/useGeneSearchResultWorker.ts";
import { useEffect, useMemo } from "react";

const SEARCH_SERVICE_ENABLED =
  import.meta.env.VITE_SEARCH_SERVICE_ENABLED === "true";

export const useGeneSearch = (query: string) => {
  if (SEARCH_SERVICE_ENABLED) {
    return useQuery({
      queryKey: ["search", "genes", query],
      queryFn: () => fetchAPI(`/api/search/v1/search?prefix=${query}`),
      select: (data: GeneSearchResponse) =>
        data.results.map((r) => ({
          ...r.entityProperties,
          entityId: r.entityId,
        })) as Array<GeneSearchItem>,
    });
  } else {
    const { data, isLoading, isFetched } = useGeneSearchQuery();
    const { eventResult, sendMessage } = useGeneSearchResultWorker();
    const { searchResultIds, noMatches, indexLoaded, isSearching, sendQuery } =
      useSearchWebWorker(eventResult, sendMessage);

    useEffect(() => {
      if (query) {
        sendQuery(query);
      }
    }, [query]);

    const filteredData = useMemo(() => {
      if (noMatches) {
        return [];
      }
      if (query && searchResultIds.length) {
        return data?.filter((gene) =>
          searchResultIds.includes(gene.mgiGeneAccessionId),
        );
      } else {
        return data;
      }
    }, [data, query, searchResultIds, noMatches]);
    return {
      data: filteredData,
      isLoading: isLoading || !indexLoaded || isSearching,
      isFetched,
    };
  }
};
