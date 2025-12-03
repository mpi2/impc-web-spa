import { usePhenotypeServiceResultsQuery } from "@/hooks/search-queries/phenotype-service-results.query.ts";
import { usePhenotypeResultsQuery, useSearchWebWorker } from "@/hooks";
import { usePhenotypeSearchResultWorker } from "@/workers/usePhenotypeSearchResultWorker.ts";
import { useEffect, useMemo } from "react";

const SEARCH_SERVICE_ENABLED =
  import.meta.env.VITE_SEARCH_SERVICE_ENABLED === "true";

export const usePhenotypeSearch = (query: string) => {
  if (SEARCH_SERVICE_ENABLED) {
    return usePhenotypeServiceResultsQuery(query);
  } else {
    const { data, isLoading, isFetched } = usePhenotypeResultsQuery();

    const { eventResult, sendMessage } = usePhenotypeSearchResultWorker();
    const { indexLoaded, searchResultIds, noMatches, isSearching, sendQuery } =
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
        return data?.filter((gene) => searchResultIds.includes(gene.mpId));
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
