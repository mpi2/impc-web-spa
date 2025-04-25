import { Dataset } from "@/models/dataset";
import { ReactNode } from "react";

export type GeneralChartProps = {
  datasetSummary: Dataset;
  isVisible: boolean;
  children?: ReactNode;
};

export type ChartSeries<T> = {
  data: Array<T>;
  sampleGroup: "control" | "experimental";
  specimenSex: "male" | "female";
};

export type PleiotropyData = {
  marker_accession_id: string;
  marker_symbol: string;
  phenotypeCount: number;
  otherPhenotypeCount: number;
};

export type ChartDimensions = {
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  boundedWidth: number;
  boundedHeight: number;
};

export type ChartPageParams =
  | "mpTermId"
  | "alleleAccessionId"
  | "zygosity"
  | "parameterStableId"
  | "pipelineStableId"
  | "procedureStableId"
  | "phenotypingCentre"
  | "metadataGroup";

export type ChartPageParamsObj = Record<ChartPageParams, string>;
