type OtherLinks = {
  genbankFile: string;
  alleleImage: string;
  alleleSimpleImage: string;
  vectorGenbankFile: string;
  vectorAlleleImage: string;
};

type QcDatum = {
  userQc: UserQc;
};

type UserQc = {
  threePrimeLrPcr: string;
};

export type AlleleEsCell = {
  productId: string;
  alleleId: number;
  geneSymbol: string;
  mgiGeneAccessionId: string;
  alleleHasIssue: boolean;
  name: string;
  productionPipeline: string;
  statusDate: Date;
  associatedProductVectorName: string;
  ikmcProjectId: string;
  designId: number;
  designIdData: boolean;
  designLink: string;
  cassette: string;
  alleleType: string;
  alleleName: string;
  alleleDescription: string;
  alleleCategory: string;
  strain: string;
  cassetteType: string;
  parentEsCellLine: string;
  qcData: Array<QcDatum>;
  associatedProductsColonyNames: Array<string>;
  orders: Array<{
    orderName: string;
    orderLink: string;
  }>;
  alleleDesignProject: string;
  type: string;
  productionCompleted: boolean;
  status: string;
  otherLinks: OtherLinks;
};
