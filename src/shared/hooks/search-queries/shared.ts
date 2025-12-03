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
