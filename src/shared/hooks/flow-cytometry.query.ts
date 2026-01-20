import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/api-service";
import { Image } from "@/models/gene";
import geneChromosomeMap from "@/static-data/chromosome-map.json";

export const useFlowCytometryQuery = (
  mgiGeneAccessionId: string,
  parameterStableId: string,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: [
      "dataset",
      mgiGeneAccessionId,
      "flow-cytometry",
      parameterStableId,
    ],
    queryFn: () => {
      const chromosome: string = (geneChromosomeMap as Record<string, string>)[
        mgiGeneAccessionId
      ];
      const id = mgiGeneAccessionId?.replace(":", "_");
      return fetchData(`${chromosome}/${id}/flow-cytometry-images.json`);
    },
    enabled,
    select: (data: Array<any>) =>
      data.filter(
        (image) =>
          image.parameterStableIdFromFilename === parameterStableId &&
          image.omeroId !== "-1",
      ) as Array<Image>,
    placeholderData: [],
  });
};
