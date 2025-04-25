import { useQuery } from "@tanstack/react-query";
import { fetchLandingPageData } from "@/api-service";

export const useEmbryoLandingQuery = () => {
  return useQuery({
    queryKey: ["landing-page", "embryo", "wol"],
    queryFn: () => fetchLandingPageData("embryo_landing"),
    placeholderData: [],
    select: (data) => data as EmbryoLandingPageData,
  });
};
