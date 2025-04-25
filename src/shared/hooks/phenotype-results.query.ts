import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/api-service";
import {
  PhenotypeSearchItem,
  PhenotypeSearchResponse,
} from "@/models/phenotype";

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

export const usePhenotypeResultsQuery = (
  query: string | undefined,
  initialData: PhenotypeSearchResponse,
) => {
  return useQuery({
    queryKey: ["search", "phenotypes", query],
    queryFn: () =>
      fetchAPI<PhenotypeSearchResponse>(
        `/api/search/v1/search?prefix=${query}&type=PHENOTYPE`,
      ),
    select: processPhenotypeResults,
    initialData: () => {
      if (initialData.numResults !== -1) {
        return initialData;
      }
      return undefined;
    },
  });
};
