import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/api-service";
import { Dataset } from "@/models";
import geneChromosomeMap from "@/static-data/chromosome-map.json";

export const useViabilityQuery = (mgiGeneAccessionId: string) => {
  const chromosome: string = geneChromosomeMap[mgiGeneAccessionId];
  const id = mgiGeneAccessionId.replace(":", "_");
  const { data, isLoading, ...rest } = useQuery({
    queryKey: ["genes", mgiGeneAccessionId, "all", "viability"],
    queryFn: () => fetchData(`${chromosome}/${id}/viability.json`),
    select: (data) => {
      const groupedData = data.reduce((acc, d) => {
        const {
          alleleAccessionId,
          parameterStableId,
          zygosity,
          phenotypingCentre,
          colonyId,
        } = d;

        const key = `${alleleAccessionId}-${parameterStableId}-${zygosity}-${phenotypingCentre}-${colonyId}`;
        if (!acc[key]) {
          acc[key] = {
            ...d,
            key,
          };
        }
        return acc;
      }, {});
      return Object.values(groupedData) as Array<Dataset>;
    },
    enabled: !!mgiGeneAccessionId,
  });
  return {
    viabilityData: data,
    isViabilityLoading: isLoading,
    ...rest,
  };
};
