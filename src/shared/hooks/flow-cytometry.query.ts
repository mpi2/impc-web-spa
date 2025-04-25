import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/api-service";
import { Image } from "@/models/gene";

export const useFlowCytometryQuery = (
  mgiGeneAccessionId: string,
  parameterStableId: string,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: ['dataset', mgiGeneAccessionId, 'flow-cytometry', parameterStableId],
    queryFn: () =>
      fetchAPI(`/api/v1/images/findByMgiGeneAccessionIdOrControlAndParameterStableId?mgiGeneAccessionId=${mgiGeneAccessionId}&parameterStableId=${parameterStableId}`),
    enabled,
    select: data => data as Array<Image>,
    placeholderData: [],
  });
}