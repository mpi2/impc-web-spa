
export type Publication = {
  title: string;
  authorString: string;
  consortiumPaper: boolean;
  publicationDate: string;
  journalTitle: string;
  abstractText: string;
  pmId: string;
  alleles: Array<{mgiGeneAccessionId: string; alleleSymbol: string}>;
  meshHeadingList: Array<string>;
  grantsList: Array<{ acronym: string; agency: string; grantId: string; orderIn: number }>;
  // TODO: update types after it becomes available from the backend
  doi?: string;
}