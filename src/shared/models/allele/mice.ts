type OtherLinks = {
  genbankFile: string;
  alleleImage: string;
  alleleSimpleImage: string;
  vectorGenbankFile: string;
  vectorAlleleImage: string;
};

type QcDatum = {
  productionQc: ProductionQc;
};

type ProductionQc = {
  tvBackboneAssay: string;
  fivePrimeCassetteIntegrity: string;
  neoCountQpcr: string;
  loaQpcr: string;
  laczSrPcr: string;
  mutantSpecificSrPcr: string;
  loxpConfirmation: string;
  fivePrimeLrPcr: string;
  homozygousLoaSrPcr: string;
  threePrimeLrPcr: string;
};

export type AlelleMice = {
  productId: string;
  alleleId: number;
  geneSymbol: string;
  mgiGeneAccessionId: string;
  alleleType: string;
  alleleName: string;
  alleleDescription: string;
  alleleCategory: string;
  alleleHasIssue: boolean;
  name: string;
  productionCentre: string;
  status: string;
  statusDate: Date;
  associatedProductEsCellName: string;
  associatedProductColonyName: string;
  associatedProductVectorName: string;
  ikmcProjectId: string;
  designId: number;
  designIdData: boolean;
  designLink: string;
  cassette: string;
  backgroundColonyStrain: string;
  deleterStrain: string;
  testStrain: string;
  qcData: Array<QcDatum>;
  typeOfMicroinjection: string;
  contactNames: string;
  orders: Array<{
    orderName: string;
    orderLink: string;
  }>;
  alleleDesignProject: string;
  type: string;
  productionCompleted: boolean;
  contactLinks: string;
  otherLinks: OtherLinks;
  tissueDistribution: Array<any>;
  displayStrainName?: string;
};
