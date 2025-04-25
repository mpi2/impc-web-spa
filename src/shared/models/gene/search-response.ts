
export type GeneSearchResponseItem = {
  entityId: string;
  entityProperties: {
    esCellProductionStatus: string;
    geneName: string;
    geneSymbol: string;
    humanGeneSymbols: string;
    humanSymbolSynonyms: string;
    mgiGeneAccessionId: string;
    mouseProductionStatus: string;
    phenotypeStatus: string;
    phenotypingDataAvailable: string;
    synonyms: string;
  };
};

export type GeneSearchResponse = {
  numResults: number;
  results: Array<GeneSearchResponseItem>;
}