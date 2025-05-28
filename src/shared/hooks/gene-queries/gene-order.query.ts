import { fetchData } from "@/api-service";
import { GeneOrder } from "@/models/gene";
import { useQuery } from "@tanstack/react-query";
import geneChromosomeMap from "@/static-data/chromosome-map.json";

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
  const chromosome: string = geneChromosomeMap[mgiGeneAccessionId];
  const id = mgiGeneAccessionId?.replace(":", "-");
  return useQuery({
    queryKey: ["genes", mgiGeneAccessionId, "order"],
    queryFn: () => fetchData(`${chromosome}/${id}/order.json`),
    select: (data) => processGeneOrderResponse(data),
    enabled: routerIsReady && !!id,
  });
};
