

export type LateAdultRowResponse = {
  markerSymbol: string;
  mgiGeneAccessionId: string;
  significance?: Array<number>;
};

export type LateAdultDataResponse = {
  columns: Array<string>;
  rows: Array<LateAdultRowResponse>;
}

export type LateAdultDataParsed = {
  columns: Array<string>;
  data: Array<{
    bin: number;
    column: string;
    bins: Array<{ bin: number; count: number; }>
  }>;
}
