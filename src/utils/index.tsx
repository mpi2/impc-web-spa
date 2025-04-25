import _ from "lodash";
import {
  faMars,
  faMarsAndVenus,
  faVenus,
} from "@fortawesome/free-solid-svg-icons";
import { Dataset } from "@/models";
import moment from "moment";

export const allBodySystems = [
  "adipose tissue phenotype",
  "behavior/neurological phenotype",
  "cardiovascular system phenotype",
  "craniofacial phenotype",
  "digestive/alimentary phenotype",
  "embryo phenotype",
  "endocrine/exocrine gland phenotype",
  "growth/size/body region phenotype",
  "hearing/vestibular/ear phenotype",
  "hematopoietic system phenotype",
  "homeostasis/metabolism phenotype",
  "immune system phenotype",
  "integument phenotype",
  "limbs/digits/tail phenotype",
  "liver/biliary system phenotype",
  "mortality/aging",
  "muscle phenotype",
  "nervous system phenotype",
  "pigmentation phenotype",
  "renal/urinary system phenotype",
  "reproductive system phenotype",
  "respiratory system phenotype",
  "skeleton phenotype",
  "vision/eye phenotype",
];
export const formatBodySystems = (systems: string[] | string = []) => {
  return _.capitalize(
    (typeof systems === "string" ? systems : systems.join(", "))
      .replace(/ phenotype/g, "")
      .replace(/\//g, " / "),
  );
};

export const formatAlleleSymbol = (allele: string) => {
  if (!allele) {
    return ["", ""];
  }
  return allele.slice(0, allele.length - 1).split("<");
};

export const formatPValue = (pValue: number) => {
  if (pValue === null || pValue === undefined) {
    return null;
  }
  const pValueArray = Number.parseFloat(String(pValue))
    .toExponential(2)
    .split("e");
  const base = Number(pValueArray[0]);
  const exponent = Number(pValueArray[1]);
  return (
    <>
      {base}
      {exponent !== 0 ? (
        <>
          x10<sup>{pValueArray[1].replace("+", "")}</sup>
        </>
      ) : null}
    </>
  );
};

export const formatESCellName = (src: string) => {
  const [name, superscript, end] = src.split(/<|>/);
  return (
    <>
      {name}
      <sup>{superscript}</sup>
      {end}
    </>
  );
};

const fetchCache = {};
export { fetchCache };

export const toSentenceCase = (camelCase) => {
  if (camelCase) {
    const result = camelCase.replace(/([A-Z])/g, " $1");
    return result[0].toUpperCase() + result.substring(1).toLowerCase();
  }
  return "";
};

export const csvToJSON = (csv: string, valueSeparator = ",") => {
  const lines = csv.split("\n");
  const result = [];
  const headers = lines[0].split(valueSeparator);
  for (let i = 1; i < lines.length; i++) {
    const obj: any = {};

    if (lines[i] == undefined || lines[i].trim() == "") {
      continue;
    }

    const words = lines[i].split(valueSeparator);
    for (var j = 0; j < words.length; j++) {
      obj[headers[j].trim()] = words[j];
    }

    result.push(obj);
  }
  return result;
};

export const getSexLabel = (sex: string) => {
  switch (sex) {
    case "male":
      return "Male";
    case "female":
      return "Female";
    default:
      return "Combined";
  }
};

export const getIcon = (sex: string) => {
  switch (sex) {
    case "male":
      return faMars;
    case "female":
      return faVenus;
    default:
      return faMarsAndVenus;
  }
};

export const getSmallestPValue = (summaries: Array<Dataset>): number => {
  const pValues = summaries
    .flatMap((d) => {
      return [
        d.statisticalMethod?.attributes?.femaleKoEffectPValue,
        d.statisticalMethod?.attributes?.maleKoEffectPValue,
        d.reportedPValue,
      ];
    })
    .filter(Boolean);
  return Math.min(...pValues, 1);
};

export const getDatasetByKey = (
  summaries: Array<Dataset>,
  keyToFind: string,
) => {
  return summaries.find((dataset) => {
    const {
      alleleAccessionId,
      parameterStableId,
      zygosity,
      phenotypingCentre,
      colonyId,
      significantPhenotype,
      lifeStageName,
      sex,
    } = dataset;
    const phenotypeId = significantPhenotype?.id || "";
    const key = `${phenotypeId}-${alleleAccessionId}-${parameterStableId}-${zygosity}-${phenotypingCentre}-${colonyId}-${lifeStageName}-${sex}`;
    return key === keyToFind;
  });
};

function calculateAgeInWeeks(
  dateOfBirth: string,
  experimentDate: string,
): number {
  const birthDate = moment(dateOfBirth);
  const experimentDateObj = moment(experimentDate);

  const diffDuration = moment.duration(experimentDateObj.diff(birthDate));
  const weeks = Math.floor(diffDuration.asWeeks());

  return weeks;
}

export const getPhenStatReadyData = (datasetMetadata: Dataset, data: any) => {
  const phenstatCols = [
    "pipeline_name",
    "Pipeline",
    "procedure_name",
    "Procedure",
    "parameter_name",
    "Parameter",
    "strain_accession_id",
    "Strain",
    "genetic_background",
    "gene_symbol",
    "Gene",
    "allele_symbol",
    "Allele",
    "Center",
    "Genotype",
    "Assay.Date",
    "date_of_birth",
    "age_in_weeks",
    "developmental_stage_name",
    "Zygosity",
    "Sex",
    "biological_sample_group",
    "external_sample_id",
    "Metadata",
    "MetadataGroup",
    "Weight",
    "production_center",
    "Value",
  ];

  const csvRows: string[] = [phenstatCols.join(",")];

  data.series.forEach((series) => {
    series.observations.forEach((observation) => {
      const row: string[] = [];
      const age = calculateAgeInWeeks(
        observation.specimenDateOfBirth,
        observation.dateOfExperiment,
      );
      row.push(
        datasetMetadata.pipelineName,
        datasetMetadata.pipelineStableId,
        datasetMetadata.procedureName,
        datasetMetadata.procedureStableId,
        datasetMetadata.parameterName,
        datasetMetadata.parameterStableId,
        datasetMetadata.strainAccessionId,
        datasetMetadata.strainName,
        datasetMetadata.geneticBackground,
        series.sampleGroup === "control" ? "-" : datasetMetadata.geneSymbol,
        series.sampleGroup === "control"
          ? "-"
          : datasetMetadata.mgiGeneAccessionId,
        series.sampleGroup === "control" ? "-" : datasetMetadata.alleleSymbol,
        series.sampleGroup === "control"
          ? "-"
          : datasetMetadata.alleleAccessionId,
        datasetMetadata.phenotypingCentre,
        series.sampleGroup === "control" ? "+/+" : datasetMetadata.colonyId,
        observation.dateOfExperiment,
        observation.specimenDateOfBirth,
        age.toString(),
        datasetMetadata.lifeStageName,
        datasetMetadata.zygosity,
        series.specimenSex,
        series.sampleGroup,
        observation.specimenId,
        "-",
        datasetMetadata.metadataGroup,
        observation?.bodyWeight?.toString() || "-",
        datasetMetadata.productionCentre,
        observation?.dataPoint?.toString() || observation.category,
      );
      csvRows.push(row.join(","));
    });
  });

  const blob = new Blob([csvRows.join("\n")], {
    type: "text/comma-separated-value;charset=utf-8",
  });

  return blob;
};

export const getDownloadData = (datasetMetadata: Dataset, data: any) => {
  const fileName = `${datasetMetadata.parameterName}_${datasetMetadata.mgiGeneAccessionId}`;
  const outputData = [];
  data?.series.forEach((series) => {
    series?.observations.forEach((observation) => {
      let row = {};
      const age = calculateAgeInWeeks(
        observation.specimenDateOfBirth,
        observation.dateOfExperiment,
      );
      row = {
        pipeline_name: datasetMetadata.pipelineName,
        pipeline_stable_id: datasetMetadata.pipelineStableId,
        procedure_name: datasetMetadata.procedureName,
        procedure_stable_id: datasetMetadata.procedureStableId,
        parameter_name: datasetMetadata.parameterName,
        parameter_stable_id: datasetMetadata.parameterStableId,
        strain_accession_id: datasetMetadata.strainAccessionId,
        strain_name: datasetMetadata.strainName,
        genetic_background: datasetMetadata.geneticBackground,
        gene_symbol:
          series.sampleGroup === "control" ? "-" : datasetMetadata.geneSymbol,
        gene_accession_id:
          series.sampleGroup === "control"
            ? "-"
            : datasetMetadata.mgiGeneAccessionId || "-",
        allele_symbol:
          series.sampleGroup === "control"
            ? "-"
            : datasetMetadata.alleleSymbol || "-",
        allele_accession_id:
          series.sampleGroup === "control"
            ? "-"
            : datasetMetadata.alleleAccessionId || "-",
        phenotyping_centre: datasetMetadata.phenotypingCentre,
        colony_id:
          series.sampleGroup === "control" ? "-" : datasetMetadata.colonyId,
        date_of_experiment: observation.dateOfExperiment,
        specimen_date_of_birth: observation.specimenDateOfBirth,
        age_in_weeks: age.toString(),
        life_stage_name: datasetMetadata.lifeStageName,
        zygosity: datasetMetadata.zygosity,
        sex: series.specimenSex,
        biological_sample_group: series.sampleGroup,
        external_sample_id: observation.specimenId,
        metadata: "-",
        metadata_group: datasetMetadata.metadataGroup,
        weight: observation?.bodyWeight?.toString() || "-",
        production_centre: datasetMetadata.productionCentre,
      };
      if (datasetMetadata.dataType === "categorical")
        row["category"] = observation.category;
      else row["data_point"] = observation.dataPoint;

      if (observation.windowWeight)
        row["window_weight"] = observation.windowWeight;

      if (observation.discretePoint)
        row["discrete_point"] = observation.discretePoint;
      outputData.push(row);
    });
  });

  return {
    fileName,
    data: outputData,
    fields: outputData[0]
      ? Object.keys(outputData[0]).map((f) => ({ key: f, label: f }))
      : [],
  };
};

export const getBodyWeightDownloadData = (
  datasetMetadata: Dataset,
  observations: any,
) => {
  const fileName = `${datasetMetadata.parameterName}_${datasetMetadata.mgiGeneAccessionId}`;
  const outputData = [];
  observations.forEach((observation) => {
    let row = {};
    const age = calculateAgeInWeeks(
      observation.specimenDateOfBirth,
      observation.dateOfExperiment,
    );
    row = {
      pipeline_name: datasetMetadata.pipelineName,
      pipeline_stable_id: datasetMetadata.pipelineStableId,
      procedure_name: datasetMetadata.procedureName,
      procedure_stable_id: datasetMetadata.procedureStableId,
      parameter_name: datasetMetadata.parameterName,
      parameter_stable_id: datasetMetadata.parameterStableId,
      strain_accession_id: datasetMetadata.strainAccessionId,
      strain_name: datasetMetadata.strainName,
      genetic_background: datasetMetadata.geneticBackground,
      gene_symbol:
        observation.sampleGroup === "control"
          ? "-"
          : datasetMetadata.geneSymbol,
      gene_accession_id:
        observation.sampleGroup === "control"
          ? "-"
          : datasetMetadata.mgiGeneAccessionId,
      allele_symbol:
        observation.sampleGroup === "control"
          ? "-"
          : datasetMetadata.alleleSymbol,
      allele_accession_id:
        observation.sampleGroup === "control"
          ? "-"
          : datasetMetadata.alleleAccessionId,
      phenotyping_centre: datasetMetadata.phenotypingCentre,
      colony_id:
        observation.sampleGroup === "control" ? "-" : datasetMetadata.colonyId,
      date_of_experiment: observation.dateOfExperiment,
      specimen_date_of_birth: observation.specimenDateOfBirth,
      age_in_weeks: age.toString(),
      life_stage_name: datasetMetadata.lifeStageName,
      zygosity: datasetMetadata.zygosity,
      sex: observation.sex,
      biological_sample_group: observation.sampleGroup,
      external_sample_id: observation.specimenId,
      metadata: "-",
      metadata_group: datasetMetadata.metadataGroup,
      weight: observation?.bodyWeight?.toString() || "-",
      production_centre: datasetMetadata.productionCentre,
    };
    if (datasetMetadata.dataType === "categorical")
      row["category"] = observation.category;
    else row["data_point"] = observation.dataPoint;

    if (observation.windowWeight)
      row["window_weight"] = observation.windowWeight;

    if (observation.discretePoint)
      row["discrete_point"] = observation.discretePoint;
    outputData.push(row);
  });

  return {
    fileName,
    data: outputData,
    fields: outputData[0]
      ? Object.keys(outputData[0]).map((f) => ({ key: f, label: f }))
      : [],
  };
};

export const buildURL = (url: string, params: Record<string, string>) => {
  let newURL = url;
  Object.entries(params)
    .filter(([, value]) => !!value)
    .forEach(([key, value], index) => {
      if (index === 0) {
        newURL += `?${key}=${value}`;
      } else {
        newURL += `&${key}=${value}`;
      }
    });
  return newURL;
};

// Function to check if iframe is loaded
// Ideally this should go in node-modules but will keep here for dev.
export const isIframeLoaded = (iframe: HTMLIFrameElement) => {
  console.log("Loading iframe");
  return new Promise((resolve, reject) => {
    if (!iframe) {
      reject("No iframe found");
    }
    iframe.addEventListener("load", () => resolve(iframe));
    iframe.addEventListener("error", () => reject("Error loading iframe"));
  });
};
