import { PhenotypeSummary } from "@/models/phenotype";
import { Helmet } from "react-helmet";

type PhenotypeMetadataProps = {
  phenotypeSummary: PhenotypeSummary;
};

const PhenotypeMetadata = ({ phenotypeSummary }: PhenotypeMetadataProps) => {
  if (!phenotypeSummary) {
    return null;
  }
  const { phenotypeName, phenotypeId } = phenotypeSummary;
  const title = `${phenotypeId} (${phenotypeName}) phenotype | IMPC`;
  const description = `Discover ${phenotypeName} significant genes, associations, procedures and more. Data for phenotype ${phenotypeName} is all freely available for download.`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta
        name="keywords"
        content={`${phenotypeId}, ${phenotypeName}, mouse, gene, phenotypes, alleles, diseases`}
      />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
};

export default PhenotypeMetadata;
