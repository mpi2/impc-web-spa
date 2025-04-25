
export type PhenotypeSearchResponseItem = {
  entityId: string;
  entityProperties: {
    definition: string;
    geneCount: string;
    geneCountNum: number;
    mpId: string;
    phenotypeName: string;
    synonyms: string;
    intermediateLevelParents: string;
    intermediateLevelParentsArray: Array<{mpTerm: string; mpId: string;}>;
    topLevelParents: string;
    topLevelParentsArray: Array<{mpTerm: string; mpId: string;}>;
  }
};

export type PhenotypeSearchResponse = {
  numResults: number;
  results: Array<PhenotypeSearchResponseItem>;
};

export type PhenotypeSearchItem = {
  entityId: string;
  definition: string;
  geneCountNum: number;
  mpId: string;
  phenotypeName: string;
  synonyms: string;
  intermediateLevelParentsArray: Array<{mpTerm: string; mpId: string;}>;
  topLevelParentsArray: Array<{mpTerm: string; mpId: string;}>;
}