import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/api-service";
import _ from "lodash";

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
    queryFn: () => fetchAPI(`/api/v1/genes/gene_external_links/providers`),
    select: (providerList) =>
      providerList.reduce((acc, provider) => {
        acc[provider.providerName] = provider.providerDescription;
        return acc;
      }, {}),
    placeholderData: [],
  });

  const hasLoadedProvidersData =
    !!providers && Object.keys(providers).length > 0;
  const linksQuery = useQuery({
    queryKey: ["gene", mgiGeneAccessionId, "external-links"],
    queryFn: () =>
      fetchAPI(`/api/v1/genes/${mgiGeneAccessionId}/gene_external_links`),
    enabled: routerIsReady && hasLoadedProvidersData,
    select: (linkList) => {
      const linksByProvider = _.groupBy(linkList, (link) => link.providerName);
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
