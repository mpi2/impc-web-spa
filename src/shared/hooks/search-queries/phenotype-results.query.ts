import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/api-service";
import { PhenotypeSearchResponse } from "@/models/phenotype";
import { processPhenotypeResults } from "./shared.ts";

export const usePhenotypeResultsQuery = () => {
  return useQuery({
    queryKey: ["search", "phenotypes"],
    queryFn: () => fetchData<PhenotypeSearchResponse>("phenotype_search.json"),
    select: processPhenotypeResults,
    placeholderData: { results: [] },
    staleTime: Infinity,
  });
};
