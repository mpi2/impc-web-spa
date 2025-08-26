import { GeneSummary } from "@/models/gene";
import { Helmet } from "react-helmet";

type GeneMetadataProps = {
  geneSummary: GeneSummary;
};

const GeneMetadata = ({ geneSummary }: GeneMetadataProps) => {
  if (!geneSummary) {
    return null;
  }
  const { geneSymbol, geneName } = geneSummary;
  const title = `${geneSymbol} | ${geneName} mouse gene | IMPC`;
  const description = `Discover mouse gene {geneSymbol} significant phenotypes, expression, images, histopathology and more. Data for gene {geneSymbol} is freely available to download.`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta
        name="keywords"
        content="{geneSymbol}, {geneName}, mouse, gene, phenotypes, alleles, diseases"
      />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
};

export default GeneMetadata;
