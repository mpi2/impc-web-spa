import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/api-service";
import { GenePhenotypeHits } from "@/models/gene";

const ABRProcedures = ["IMPC_ACS_001", "IMPC_ACS_002", "IMPC_ACS_003"];

const PPIParameters = [
  "PPI1", // % PP1
  "PPI2", // % PP2
  "PPI3", // % PP3
  "PPI4", // % PP4
];

export const processGenePhenotypeHitsResponse = (
  data: Array<GenePhenotypeHits>
) => {
  const group: Record<string, GenePhenotypeHits> = {};
  const significantData = data.filter(
    (phenotypeHit) =>
      (phenotypeHit.pValue < 0.0001 ||
        phenotypeHit.assertionType === "manual") &&
      !!phenotypeHit.phenotype.id
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
      };
    } else if (group[key].datasetId !== datasetId) {
      // check for PPI related parameters and only count the PPI1, PPI2, PPI3 and PPI4
      if (
        ABRProcedures.includes(group[key].procedureStableId) &&
        PPIParameters.some((param) => item.parameterName.includes(param))
      ) {
        group[key].datasetsIds.push(datasetId);
      } else if (!group[key].datasetsIds.includes(datasetId)) {
        group[key].datasetsIds.push(datasetId);
      }
    }
  });
  return Object.values(group).filter(
    (phenotype) => !phenotype.procedureStableId.includes("HIS")
  );
};

export const useSignificantPhenotypesQuery = (
  mgiGeneAccessionId: string,
  routerIsReady: boolean
) => {
  const { data, isLoading, isError, isFetching, ...rest } = useQuery({
    queryKey: ["genes", mgiGeneAccessionId, "phenotype-hits"],
    queryFn: () =>
      fetchAPI(`/api/v1/genes/${mgiGeneAccessionId}/phenotype-hits`),
    enabled: routerIsReady,
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
