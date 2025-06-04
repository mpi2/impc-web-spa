import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/api-service";
import {
  PhenotypeSearchItem,
  PhenotypeSearchResponse,
} from "@/models/phenotype";
import lunr from "lunr";

const parsePhenotypeString = (value: string) => {
  const [mpId, mpTerm] = value.split("|");
  return {
    mpId: mpId.replace(`___${mpTerm}`, ""),
    mpTerm,
  };
};

export const processPhenotypeResults = (
  data: PhenotypeSearchResponse,
): Array<PhenotypeSearchItem> => {
  return data.results.map((item) => ({
    ...item,
    ...item.entityProperties,
    geneCountNum: item.entityProperties.geneCount.endsWith(";")
      ? Number.parseInt(item.entityProperties.geneCount, 10)
      : 0,
    intermediateLevelParentsArray:
      item.entityProperties.intermediateLevelParents
        .split(";")
        .map(parsePhenotypeString),
    topLevelParentsArray: !!item.entityProperties.topLevelParents
      ? item.entityProperties.topLevelParents
          .split(";")
          .map(parsePhenotypeString)
      : [],
  }));
};

export const usePhenotypeResultsQuery = () => {
  return useQuery({
    queryKey: ["search", "phenotypes"],
    queryFn: () => fetchData<PhenotypeSearchResponse>("phenotype_search.json"),
    select: processPhenotypeResults,
    staleTime: Infinity,
  });
};

export const usePhenotypeSearchIndexQuery = () => {
  return useQuery({
    queryKey: ["search", "phenotypes", "search_index"],
    queryFn: () => fetchData(`phenotype_search_index.json`),
    select: (data) => lunr.Index.load(data),
    staleTime: Infinity,
  });
};
