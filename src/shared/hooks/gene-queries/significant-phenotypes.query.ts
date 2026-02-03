import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/api-service";
import { GenePhenotypeHits } from "@/models/gene";
import geneChromosomeMap from "@/static-data/chromosome-map.json";

const ABRParameters = [
  "IMPC_ABR_002_001",
  "IMPC_ABR_004_001",
  "IMPC_ABR_006_001",
  "IMPC_ABR_008_001",
  "IMPC_ABR_010_001",
  "IMPC_ABR_012_001",
];

const PPIParameters = [
  "PPI1", // % PP1
  "PPI2", // % PP2
  "PPI3", // % PP3
  "PPI4", // % PP4
  "IMPC_ACS_033_001", // % PP1
  "IMPC_ACS_034_001", // % PP2
  "IMPC_ACS_035_001", // % PP3
  "IMPC_ACS_036_001", // % PP4
  "IMPC_ACS_037_001", // % Global
];

export const processGenePhenotypeHitsResponse = (
  data: Array<GenePhenotypeHits>,
) => {
  const group: Record<string, GenePhenotypeHits> = {};
  const significantData = data.filter(
    (phenotypeHit) => !!phenotypeHit.phenotype.id,
  );
  significantData.forEach((item) => {
    const {
      datasetId,
      phenotype: { id },
      alleleAccessionId,
      zygosity,
      sex,
      pValue,
      lifeStageName,
    } = item;
    const key = `${id}-${alleleAccessionId}-${zygosity}-${lifeStageName}`;
    const pValueKey = `pValue_${sex}`;
    if (group[key] !== undefined && group[key].pValue > pValue) {
      group[key].pValue = pValue;
      group[key].sex = sex;
    } else if (
      group[key] !== undefined &&
      (group[key][pValueKey] === undefined || group[key][pValueKey] > pValue)
    ) {
      group[key][pValueKey] = pValue;
    }
    if (group[key] === undefined) {
      group[key] = {
        ...item,
        [pValueKey]: pValue,
        topLevelPhenotypeName: item.topLevelPhenotypes?.[0]?.name || null,
        phenotypeName: item.phenotype.name,
        id: item.phenotype.id,
        phenotypeId: item.phenotype.id,
        datasetsIds: [datasetId],
        paramsTrackedIds: [item.parameterStableId],
      };
    } else if (group[key].datasetId !== datasetId) {
      // for PPI and ABR,
      if (
        (item.procedureStableId.includes("ACS") ||
          item.procedureStableId.includes("ABR")) &&
        !group[key].paramsTrackedIds!.includes(item.parameterStableId)
      ) {
        if (
          ABRParameters.includes(item.parameterStableId) ||
          PPIParameters.includes(item.parameterStableId)
        ) {
          group[key].datasetsIds!.push(datasetId);
          group[key].paramsTrackedIds!.push(item.parameterStableId);
        }
      } else if (!group[key].datasetsIds!.includes(datasetId)) {
        group[key].datasetsIds!.push(datasetId);
      }
    }
  });
  return Object.values(group).filter(
    (phenotype) => !phenotype.procedureStableId.includes("HIS"),
  );
};

export const useSignificantPhenotypesQuery = (
  mgiGeneAccessionId: string,
  routerIsReady: boolean,
) => {
  const chromosome: string = geneChromosomeMap[mgiGeneAccessionId];
  const id = mgiGeneAccessionId?.replace(":", "_");
  const { data, isLoading, isError, isFetching, ...rest } = useQuery({
    queryKey: ["genes", mgiGeneAccessionId, "phenotype-hits"],
    queryFn: () => fetchData(`${chromosome}/${id}/phenotypehits.json`),
    enabled: routerIsReady && !!id,
    select: (data: Array<GenePhenotypeHits>) =>
      processGenePhenotypeHitsResponse(data),
    placeholderData: [],
  });
  return {
    phenotypeData: data as Array<GenePhenotypeHits>,
    isPhenotypeLoading: isLoading,
    isPhenotypeError: isError,
    isPhenotypeFetching: isFetching,
    ...rest,
  };
};
