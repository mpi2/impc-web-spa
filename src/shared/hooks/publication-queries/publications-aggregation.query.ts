import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/api-service";
import { PublicationAggregationDataResponse } from "@/models";

export const usePublicationsAggregationQuery = () => {
  return useQuery({
    queryKey: ["publications", "aggregation"],
    queryFn: () => fetchData(`publications_aggregation.json`),
    select: (aggregationData: PublicationAggregationDataResponse) => {
      const yearlyIncrementData = aggregationData.incrementalCountsByYear;
      const allGrantsData = aggregationData.publicationsByGrantAgency;
      const publicationsByGrantsChartData = allGrantsData.filter(
        (pubCount) => pubCount.count > 8,
      );
      const publicationsByQuarter = aggregationData.publicationsByQuarter.map(
        (year) => {
          return {
            ...year,
            byQuarter: year.byQuarter.sort((q1, q2) => q1.quarter - q2.quarter),
          };
        },
      );

      return {
        yearlyIncrementData,
        publicationsByGrantsChartData,
        publicationsByQuarter,
        allGrantsData,
      };
    },
    placeholderData: {
      incrementalCountsByYear: [],
      publicationsByGrantAgency: [],
      publicationsByQuarter: [],
    },
  });
};
