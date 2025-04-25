type Assay = {
  numFounderPups: number;
  numFounderSelectedForBreeding: number;
  founderNumAssays: number;
  numDeletionG0Mutants: null;
  numG0WhereMutationDetected: null;
  numHdrG0Mutants: null;
  numHdrG0MutantsAllDonorsInserted: null;
  numHdrG0MutantsSubsetDonorsInserted: null;
  numHrG0Mutants: number;
  numNhejG0Mutants: number;
  assayType: string;
};

type Attempt = {
  miDate: Date;
  miExternalRef: string;
  mutagenesisExternalRef: string;
  totalEmbryosInjected: number;
  totalEmbryosSurvived: number;
  embryoTwoCell: null;
  comment: null;
  embryoTransferDay: string;
  totalTransferred: number;
  strainName: string;
  mgiStrainAccessionId: string;
};

type GenotypePrimer = {
  sequence: string;
  name: string;
};

type Guide = {
  sequence: string;
  guideSequence: string;
  pam: string;
  chr: string;
  start: number;
  stop: number;
  strand: string;
  genomeBuild: string;
  grnaConcentration: number;
  truncatedGuide: boolean;
  reversed: boolean;
  sangerService: boolean;
  guideFormat: null;
  guideSource: null;
};

type Nuclease = {
  nucleaseType: string;
  nucleaseClass: string;
};

export type AlleleCrispr = {
  mutationId: string;
  mgiAlleleId: string;
  alleleSuperscript: string;
  mgiGeneAccessionId: string;
  alleleSymbol: string;
  planIdentifier: string;
  attempt: Attempt;
  outcomeIdentifier: string;
  colonyName: string;
  guides: Guide[];
  nucleases: Nuclease[];
  genotypePrimers: GenotypePrimer[];
  assay: Assay;
};
