type OtherLinks = {
  genbankFile: string;
  alleleImage: string;
  alleleSimpleImage: null;
  vectorGenbankFile: null;
  vectorAlleleImage: null;
};

export type AlleleTvp = {
  productId: string;
  alleleId: number;
  geneSymbol: string;
  mgiGeneAccessionId: string;
  ikmcProjectId: string;
  designId: number;
  designIdData: boolean;
  designLink: string;
  cassette: string;
  alleleHasIssue: boolean;
  name: string;
  productionPipeline: string;
  statusDate: Date;
  alleleType: string;
  alleleDescription: string;
  alleleName: string;
  alleleDesignProject: string;
  type: string;
  productionCompleted: boolean;
  status: string;
  cassetteType: string;
  backbone: string;
  orders: Array<{
    orderName: string;
    orderLink: string;
  }>;
  otherLinks: OtherLinks;
  associatedProductsEsCellNames?: Array<string>;
};
