import { useEffect, useMemo, useState } from "react";
import { SearchWebWorkerResult } from "@/models";

export const useSearchWebWorker = (
  eventResult: SearchWebWorkerResult | null,
  sendMessage: (val: string) => void,
) => {
  const [indexLoaded, setIndexLoaded] = useState(false);
  const [searchResultIds, setSearchResultIds] = useState<Array<string>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [noMatches, setNoMatches] = useState<boolean>(false);

  useEffect(() => {
    if (eventResult) {
      switch (eventResult.type) {
        case "index-loaded":
          setIndexLoaded(true);
          break;
        case "query-result":
          setSearchResultIds(eventResult.result);
          setNoMatches(eventResult.noMatches);
          setIsSearching(false);
          break;
      }
    }
  }, [eventResult]);

  const sendQuery = useMemo(
    () => (val: string) => {
      sendMessage(val);
      setIsSearching(true);
    },
    [sendMessage],
  );

  return {
    indexLoaded,
    searchResultIds,
    isSearching,
    noMatches,
    sendQuery,
  };
};
