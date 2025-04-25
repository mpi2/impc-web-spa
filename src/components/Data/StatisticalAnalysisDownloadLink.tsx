import { Dataset } from "@/models/dataset";
import { getPhenStatReadyData } from "@/utils";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type StatisticalAnalysisDownloadLinkProps = {
  datasetSummary: Dataset;
  type: "statistical-result" | "genotype-phenotype";
  data?: any;
};

const StatisticalAnalysisDownloadLink = ({
  datasetSummary,
  type,
  data = null,
}) => {
  let url = "";
  let label = "";
  let format = "XML";
  switch (type) {
    case "statistical-result":
      url = `https://www.ebi.ac.uk/mi/impc/solr/statistical-result/select?q=*:*&rows=2147483647&sort=p_value+asc&wt=xml&fq=marker_accession_id:%22${datasetSummary.mgiGeneAccessionId}%22&fq=phenotyping_center:(%22${datasetSummary.phenotypingCentre}%22)&fq=metadata_group:${datasetSummary.metadataGroup}&fq=allele_accession_id:%22${datasetSummary.alleleAccessionId}%22&fq=pipeline_stable_id:${datasetSummary.pipelineStableId}&fq=parameter_stable_id:${datasetSummary.parameterStableId}&fq=zygosity:${datasetSummary.zygosity}&fq=strain_accession_id:%22${datasetSummary.strainAccessionId}%22`;
      label = "Statistical result";
      break;
    case "genotype-phenotype":
      url = `https://www.ebi.ac.uk/mi/impc/solr/genotype-phenotype/select?q=*:*&rows=2147483647&sort=p_value+asc&wt=xml&fq=marker_accession_id:%22${datasetSummary.mgiGeneAccessionId}%22&fq=phenotyping_center:(%22${datasetSummary.phenotypingCentre}%22)&fq=allele_accession_id:%22${datasetSummary.alleleAccessionId}%22&fq=pipeline_stable_id:${datasetSummary.pipelineStableId}&fq=parameter_stable_id:${datasetSummary.parameterStableId}&fq=zygosity:${datasetSummary.zygosity}&fq=strain_accession_id:%22${datasetSummary.strainAccessionId}%22`;
      label = "Genotype phentoype association";
      break;
    case "phenstat-data":
      url = data
        ? URL.createObjectURL(getPhenStatReadyData(datasetSummary, data))
        : null;
      label = "PhenStat ready data";
      format = "CSV";
      break;
  }

  return (
    <a target="_blank" className="link" href={url}>
      {label} ({format}) <FontAwesomeIcon size="xs" icon={faExternalLinkAlt} />
    </a>
  );
};

export default StatisticalAnalysisDownloadLink;
