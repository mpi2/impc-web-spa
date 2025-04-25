
export type HistopathologyResponse = {
  id: string;
  mgiGeneAccessionId: string;
  datasets: Array<{
    tissue: string;
    observations: Array<{
      alleleAccessionId: string;
      alleleSymbol: string;
      externalSampleId: string;
      lifeStageName: string;
      parameterName: string;
      parameterStableId: string;
      phenotypingCenter: string;
      pipelineStableId: string;
      procedureStableId: string;
      specimenId: string;
      tissue: string;
      zygosity: string;
      ontologyTerms: Array<{ termId: string; termName: string }>;
      category: string | null;
      textValue: string | null;
      thumbnailUrl: string | null;
      omeroId: string | null;
    }>
  }>
}

export type Histopathology = {
  alleleAccessionId: string;
  alleleSymbol: string;
  lifeStageName: string;
  specimenId: string;
  specimenNumber: string;
  tissue: string;
  zygosity: string;
  description: string;
  maTerm: string;
  maId: string;
  mPathId: string;
  mPathTerm: string;
  severityScore: string;
  significanceScore: string;
  descriptorPATO: string;
  freeText: string;
  thumbnailUrl: string;
}