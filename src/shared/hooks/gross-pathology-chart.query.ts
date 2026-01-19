import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/api-service";
import { GrossPathology, GrossPathologyDataset } from "@/models";
import geneChromosomeMap from "@/static-data/chromosome-map.json";

export const useGrossPathologyChartQuery = (
  mgiGeneAccessionId: string,
  grossPathParameterStableId: string,
  routerIsReady: boolean,
) => {
  return useQuery({
    queryKey: ["genes", mgiGeneAccessionId, "gross-pathology"],
    queryFn: () => {
      const chromosome: string = (geneChromosomeMap as Record<string, string>)[
        mgiGeneAccessionId
      ];
      const id = mgiGeneAccessionId?.replace(":", "_");
      return fetchData(`/${chromosome}/${id}/pathology.json`);
    },
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
        })),
      );

      datasetsFiltered.forEach((dataset) => {
        specimens.add(dataset.externalSampleId);
        const isNormal = dataset.ontologyTerms.find(
          (ontologyTerm) =>
            ontologyTerm.termName === "no abnormal phenotype detected",
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
          ]),
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
