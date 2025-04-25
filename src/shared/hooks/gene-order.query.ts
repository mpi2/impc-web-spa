import { fetchAPI } from "@/api-service";
import { GeneOrder } from "@/models/gene";
import { useQuery } from "@tanstack/react-query";

export const processGeneOrderResponse = (data) => {
  return data
    .filter(
      (d) =>
        d.productTypes.length > 1 ||
        !["intermediate_vector", "crispr"].includes(d.productTypes[0])
    )
    .map((d) => ({ ...d, phenotyped: null })) as Array<GeneOrder>;
};

export const useGeneOrderQuery = (
  mgiGeneAccessionId: string,
  routerIsReady: boolean
) => {
  return useQuery({
    queryKey: ["genes", mgiGeneAccessionId, "order"],
    queryFn: () => fetchAPI(`/api/v1/genes/${mgiGeneAccessionId}/order`),
    select: (data) => processGeneOrderResponse(data),
    enabled: routerIsReady,
  });
};
