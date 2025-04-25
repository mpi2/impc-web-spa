type EmbryoLandingPageData = {
  primaryViabilityTable: Array<{
    outcome: string;
    genes: Array<{ mgiGeneAccessionId: string; geneSymbol: string }>;
  }>;
  primaryViabilityChart: Array<{
    outcome: string;
    genes: Array<{ mgiGeneAccessionId: string; geneSymbol: string }>;
  }>;
  secondaryViabilityData: Array<{
    windowOfLethality: string;
    genes: Array<{ mgiGeneAccessionId: string; geneSymbol: string }>;
  }>;
  embryoDataAvailabilityGrid: Array<EmbryoDataAvailabilityGrid>;
};

type EmbryoDataAvailabilityGrid = {
  mgiGeneAccessionId: string;
  geneSymbol: string;
  analysisViewUrl?: string;
  hasAutomatedAnalysis: boolean;
  embryoViewerUrl: string;
  isUmassGene: boolean;
  procedureNames: Array<string>;
};
