import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/api-service";
import { PhenotypeSearchResponse } from "@/models/phenotype";
import { processPhenotypeResults } from "@/hooks/search-queries/shared.ts";

export const usePhenotypeServiceResultsQuery = (query: string | undefined) => {
  return useQuery({
    queryKey: ["search", "phenotypes", query],
    queryFn: () =>
      fetchAPI<PhenotypeSearchResponse>(
        `/api/search/v1/search?prefix=${query}&type=PHENOTYPE`,
      ),
    select: processPhenotypeResults,
  });
};
