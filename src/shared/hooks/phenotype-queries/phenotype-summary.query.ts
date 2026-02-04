import { useQuery } from "@tanstack/react-query";
import { PhenotypeSummary } from "@/models/phenotype";
import { fetchData } from "@/api-service";

export const usePhenotypeSummaryQuery = (phenotypeId: string) => {
  const id = phenotypeId.replace(":", "_");
  return useQuery<PhenotypeSummary>({
    queryKey: ["phenotype", phenotypeId, "summary"],
    queryFn: () => fetchData(`phenotypes/${id}/summary.json`),
    enabled: !!phenotypeId,
  });
};
