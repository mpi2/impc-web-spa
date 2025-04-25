export type AlleleSummary = {
  id: string;
  mgiGeneAccessionId: string;
  geneSymbol: string;
  alleleName: string;
  alleleDescription: string;
  emsembleUrl: string;
  doesMiceProductsExist: boolean;
  doesEsCellProductsExist: boolean;
  doesCrisprProductsExist: boolean;
  doesIntermediateVectorProductsExist: boolean;
  doesTargetingVectorProductsExist: boolean;
};
