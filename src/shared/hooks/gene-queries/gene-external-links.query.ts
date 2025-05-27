import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/api-service";
import { groupBy } from "lodash";
import geneChromosomeMap from "@/static-data/chromosome-map.json";

type ExternalLinks = {
  providerName: string;
  providerDescription: string;
  links: Array<{
    href: string;
    label: string;
    mgiGeneAccessionId: string;
    providerName: string;
    description: string;
  }>;
};

export const useGeneExternalLinksQuery = (
  mgiGeneAccessionId: string,
  routerIsReady: boolean,
) => {
  const { data: providers, isFetching: providersIsFetching } = useQuery({
    queryKey: ["external-links-providers"],
    queryFn: () => fetchData(`providers.json`),
    select: (providerList) =>
      providerList.reduce((acc, provider) => {
        acc[provider.providerName] = provider.providerDescription;
        return acc;
      }, {}),
    placeholderData: [],
  });

  const hasLoadedProvidersData =
    !!providers && Object.keys(providers).length > 0;
  const chromosome: string = geneChromosomeMap[mgiGeneAccessionId];
  const id = mgiGeneAccessionId.replace(":", "-");
  const linksQuery = useQuery({
    queryKey: ["gene", mgiGeneAccessionId, "external-links"],
    queryFn: () =>
      fetchData(`${chromosome}/${id}/external-links.json`),
    enabled: routerIsReady && hasLoadedProvidersData,
    select: (linkList) => {
      const linksByProvider = groupBy(linkList, (link) => link.providerName);
      return Object.entries(linksByProvider)
        .map(([providerName, links]) => ({
          providerName,
          providerDescription: Object.values(providers).find((desc: string) =>
            desc.includes(providerName),
          ),
          links,
        }))
        .sort((p1, p2) =>
          p1.providerName.localeCompare(p2.providerName),
        ) as Array<ExternalLinks>;
    },
    placeholderData: [],
  });
  return {
    ...linksQuery,
    isFetching: providersIsFetching || linksQuery.isFetching,
  };
};
