import { Moment } from "moment";

export type GeneImage = {
  count: number;
  fileType: string;
  mgiGeneAccessionId: string;
  parameterName: string;
  parameterStableId: string;
  procedureName: string;
  procedureStableId: string;
  strainAccessionId: string;
  thumbnailUrl: string;
  isSpecialFormat: boolean;
};

export type GeneImageCollection = {
  id: string;
  mgiGeneAccessionId: string;
  geneSymbol: string;
  strainAccessionId: string;
  pipelineStableId: string;
  procedureStableId: string;
  procedureName: string;
  parameterStableId: string;
  parameterName: string;
  biologicalSampleGroup: string;
  images: Array<Image>;
  metadataGroup: string;
  experimentDate?: Moment;
  phenotypingCentre: string;
};

export type Image = {
  thumbnailUrl: null | string;
  downloadUrl: string;
  jpegUrl: string;
  fileType: string | null;
  observationId: string;
  specimenId: string;
  colonyId: string;
  sex: string;
  zygosity: string;
  ageInWeeks: number;
  alleleSymbol: string;
  associatedParameters: Array<AssociatedParameter> | null;
  dateOfExperiment: string;
  experimentDate: Moment;
  biologicalSampleGroup: string;
  imageLink: string | null;
};

export type AssociatedParameter = {
  stableId: string;
  associationSequenceId: null | string;
  name: string;
  value: string;
};
