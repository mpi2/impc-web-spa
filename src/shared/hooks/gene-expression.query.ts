import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/api-service";
import { GeneExpression } from "@/models/gene";
import { orderBy } from "lodash";

const getExpressionRate = (p) => {
  return p.expression || p.noExpression
    ? Math.round((p.expression * 10000) / (p.expression + p.noExpression)) / 100
    : -1;
};

export const useGeneExpressionQuery = (
  mgiGeneAccessionId: string,
  routerIsReady: boolean,
  sortOptions: string,
  initialData: Array<GeneExpression>,
) => {
  return useQuery({
    queryKey: ["gene", mgiGeneAccessionId, "expression"],
    queryFn: () =>
      fetchAPI<Array<Partial<GeneExpression>>>(
        `/api/v1/genes/${mgiGeneAccessionId}/expression`,
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
    enabled: routerIsReady,
    placeholderData: [],
  });
};
