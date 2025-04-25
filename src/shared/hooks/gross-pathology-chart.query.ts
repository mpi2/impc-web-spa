import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/api-service";
import { GrossPathology, GrossPathologyDataset } from "@/models";

export const useGrossPathologyChartQuery = (
  mgiGeneAccessionId: string,
  grossPathParameterStableId: string,
  routerIsReady: boolean
) => {
  return useQuery({
    queryKey: ["genes", mgiGeneAccessionId, "gross-pathology"],
    queryFn: () => fetchAPI(`/api/v1/genes/${mgiGeneAccessionId}/pathology`),
    placeholderData: [],
    enabled: routerIsReady,
    select: (data: Array<GrossPathology>) => {
      const counts = {};
      const specimens = new Set();
      const filteredData = !!grossPathParameterStableId
        ? data.filter((d) => d.parameterStableId === grossPathParameterStableId)
        : data;
      let datasetsFiltered = filteredData.flatMap((byParameter) =>
        byParameter.datasets.map((d) => ({
          ...d,
          anatomyTerm: byParameter.parameterName,
        }))
      );

      datasetsFiltered.forEach((dataset) => {
        specimens.add(dataset.externalSampleId);
        const isNormal = dataset.ontologyTerms.find(
          (ontologyTerm) =>
            ontologyTerm.termName === "no abnormal phenotype detected"
        );
        const key = `${dataset.zygosity}-${dataset.phenotypingCenter}-${
          isNormal ? "normal" : "abnormal"
        }`;
        if (counts[key] === undefined) {
          counts[key] = 0;
        }
        counts[key] += 1;
      });
      datasetsFiltered = [
        ...new Map(
          datasetsFiltered.map((d) => [
            JSON.stringify([d.zygosity, d.phenotypingCenter]),
            d,
          ])
        ).values(),
      ];
      return datasetsFiltered.map((dataset) => {
        const abnormalCountsKey = `${dataset.zygosity}-${dataset.phenotypingCenter}-abnormal`;
        const normalCountsKey = `${dataset.zygosity}-${dataset.phenotypingCenter}-normal`;
        return {
          ...dataset,
          abnormalCounts: counts[abnormalCountsKey]?.toString() || "0",
          normalCounts: counts[normalCountsKey]?.toString() || "0",
          specimenCount: specimens.size,
        };
      }) as Array<GrossPathologyDataset>;
    },
  });
};
