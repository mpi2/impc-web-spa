export type SampleCounts = {
  phenotypingCentre: string;
  mutantLines: number;
  mutantSpecimens: number;
  controlSpecimens: number;
};

export type DataQualityCheck = {
  dataType: string;
  count: number;
};

export type StatusCount = {
  centre: string;
  count: number;
  status: string;
  originalStatus: string;
};

export type ProdStatusByCenter = {
  statusType: string;
  counts: Array<StatusCount>;
};

export type SummaryCount = {
  phenotypedGenes: number;
  phenotypedLines: number;
  phentoypeCalls?: number;
  phenotypeCalls: number;
};

export type dataPointType =
  | "categorical"
  | "image_record"
  | "ontological"
  | "text"
  | "time_series"
  | "unidimensional";

export type dataPointCountByDR = {
  dataType: dataPointType;
  count: number;
};

export type SummaryCounts = Record<string, SummaryCount>;

export type DataPointCount = Record<string, Array<dataPointCountByDR>>;

export type ReleaseMetadata = {
  dataReleaseDate: string;
  dataReleaseNotes: string;
  dataReleaseVersion: string;
  genomeAssembly: { species: string; version: string };
  statisticalAnalysisPackage: { name: string; version: string };
  summaryCounts: SummaryCounts;
  dataQualityChecks: Array<DataQualityCheck>;
  phenotypeAnnotations: Array<{
    topLevelPhenotype: string;
    total: number;
    counts: Array<{ zygosity: string; count: number }>;
  }>;
  phenotypeAssociationsByProcedure: Array<{
    procedure_name: string;
    total: number;
    counts: Array<{ lifeStage: string; count: number }>;
  }>;
  productionStatusByCenter: Array<ProdStatusByCenter>;
  productionStatusOverall: Array<{
    statusType: string;
    counts: Array<{ count: number; status: string }>;
  }>;
  sampleCounts: Array<SampleCounts>;
  dataPointCount: DataPointCount;
};
