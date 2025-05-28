import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/api-service";
import { GeneExpression } from "@/models/gene";
import { orderBy } from "lodash";
import geneChromosomeMap from "@/static-data/chromosome-map.json";

const getExpressionRate = (p) => {
  return p.expression || p.noExpression
    ? Math.round((p.expression * 10000) / (p.expression + p.noExpression)) / 100
    : -1;
};

export const useGeneExpressionQuery = (
  mgiGeneAccessionId: string,
  routerIsReady: boolean,
  sortOptions: string,
) => {
  const chromosome: string = geneChromosomeMap[mgiGeneAccessionId];
  const id = mgiGeneAccessionId?.replace(":", "_");
  return useQuery({
    queryKey: ["gene", mgiGeneAccessionId, "expression"],
    queryFn: () =>
      fetchData<Array<Partial<GeneExpression>>>(
        `${chromosome}/${id}/expression.json`,
      ),
    select: (raw) => {
      const processed = raw.map((d) => ({
        ...d,
        expressionRate: getExpressionRate(d.mutantCounts),
        wtExpressionRate: getExpressionRate(d.controlCounts),
      }));
      const [field, order] = sortOptions.split(";");
      return orderBy(processed, field, order as "asc" | "desc");
    },
    enabled: routerIsReady && !!id,
    placeholderData: [],
  });
};
