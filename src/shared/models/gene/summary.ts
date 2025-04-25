export type GeneSummary = {
  adultExpressionObservationsCount?: number;
  alleleNames: Array<string>;
  assignmentStatus: string;
  associatedDiseasesCount: number;
  embryoExpressionObservationsCount?: number;
  geneName: string;
  geneSymbol: string;
  hasBodyWeightData: boolean;
  hasEmbryoImagingData: boolean;
  hasImagingData: boolean;
  hasHistopathologyData: boolean;
  hasLacZData: boolean;
  hasViabilityData: boolean;
  humanGeneSymbols: Array<string>;
  humanSymbolSynonyms: Array<string>;
  id: string;
  mgiGeneAccessionId: string;
  notSignificantTopLevelPhenotypes: Array<string>;
  significantPhenotypesCount: number;
  significantTopLevelPhenotypes: Array<string>;
  synonyms: Array<string>;
};

export const emptyGeneSummary = (): GeneSummary => ({
  alleleNames: [],
  assignmentStatus: "",
  associatedDiseasesCount: 0,
  geneName: "",
  geneSymbol: "",
  hasBodyWeightData: false,
  hasEmbryoImagingData: false,
  hasImagingData: false,
  hasHistopathologyData: false,
  hasLacZData: false,
  hasViabilityData: false,
  humanGeneSymbols: [],
  humanSymbolSynonyms: [],
  id: "",
  mgiGeneAccessionId: "",
  notSignificantTopLevelPhenotypes: [],
  significantPhenotypesCount: 0,
  significantTopLevelPhenotypes: [],
  synonyms: [],
});
