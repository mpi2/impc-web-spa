export type PublicationsByGrantAgency = Array<{
  agency: string;
  count: number;
}>;
export type PublicationsIncrementalCountsByYear = Array<{
  pubYear: number;
  count: number;
}>;
export type PublicationsByQuarter = Array<{
  pubYear: number;
  count: number;
  byQuarter: Array<{ quarter: number; count: number }>;
}>;

export type PublicationAggregationDataResponse = {
  incrementalCountsByYear: PublicationsIncrementalCountsByYear;
  publicationsByQuarter: PublicationsByQuarter;
  publicationsByGrantAgency: PublicationsByGrantAgency;
};
