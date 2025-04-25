
type Procedure = {
  description: string;
  pipelineName: string;
  pipelineStableId: string;
  procedureName: string;
  procedureStableId: string;
  procedureStableKey: number;
}

export type PhenotypeSummary = {
  id: string;
  notSignificantGenes: number;
  phenotypeDefinition: string;
  phenotypeId: string;
  phenotypeName: string;
  phenotypeSynonyms: Array<string>;
  procedures: Array<Procedure>;
  significantGenes: number;
  topLevelPhenotypes: Array<{ id: string | null; name: string; }>
};