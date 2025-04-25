
export type PhenotypeStatsResultsItem = {
  chrName: string;
  chrStrand: string;
  markerSymbol: string;
  mgiGeneAccessionId: string;
  reportedEffectSize: number | null;
  reportedPValue: number | null;
  resourceFullName: string;
  seqRegionStart: number;
  seqRegionEnd: number;
  significant: boolean;
};

export type PhenotypeStatsResults = {
  phenotypeId: string;
  results: Array<PhenotypeStatsResultsItem>;
}