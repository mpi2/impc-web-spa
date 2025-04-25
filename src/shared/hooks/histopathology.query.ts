import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/api-service";
import { Histopathology, HistopathologyResponse } from "@/models";
import { groupBy } from "lodash";

type SpecimenData = {
  lifeStageName: string;
  specimenId: string;
  zygosity: string;
  alleleAccessionId: string;
  alleleSymbol: string;
  tissues: Record<
    string,
    {
      description: string;
      maTerm: string;
      maId: string;
      mPathId: string;
      mPathTerm: string;
      severityScore: string;
      significanceScore: string;
      descriptorPATO: string;
      freeText: string;
    }
  >;
};

type HistopathologyImage = {
  zygosity: string;
  tissue: string;
  alleleSymbol: string;
  thumbnailUrl: string;
  maTerm: string;
  maId: string;
  omeroId: string;
  specimenNumber: string;
  specimenId: string;
};

export const useHistopathologyQuery = (
  mgiGeneAccessionId: string,
  routerIsReady: boolean,
  initialData: HistopathologyResponse,
) => {
  return useQuery({
    queryKey: ["histopathology", mgiGeneAccessionId],
    queryFn: () =>
      fetchAPI(`/api/v1/genes/${mgiGeneAccessionId}/histopathology`),
    enabled: routerIsReady,
    select: (data: HistopathologyResponse) => {
      const specimensData: Record<string, SpecimenData> = {};
      let images: Array<HistopathologyImage> = [];
      data.datasets.forEach((dataset) => {
        dataset.observations.forEach((observation) => {
          if (specimensData[observation.specimenId] === undefined) {
            specimensData[observation.specimenId] = {
              tissues: {},
              specimenId: observation.specimenId,
              zygosity: observation.zygosity,
              lifeStageName: observation.lifeStageName,
              alleleAccessionId: observation.alleleAccessionId,
              alleleSymbol: observation.alleleSymbol,
            };
          }
          if (
            specimensData[observation.specimenId].tissues[dataset.tissue] ===
            undefined
          ) {
            specimensData[observation.specimenId].tissues[dataset.tissue] = {
              description: "N/A",
              maTerm: "N/A",
              maId: "N/A",
              mPathId: "N/A",
              mPathTerm: "N/A",
              severityScore: "0",
              significanceScore: "0",
              descriptorPATO: "N/A",
              freeText: "N/A",
            };
          }
          const specimenTissueData =
            specimensData[observation.specimenId].tissues[dataset.tissue];
          if (
            observation.parameterName.includes(
              "MPATH pathological process term",
            ) ||
            observation.parameterName.includes("MPATH pathological entity term")
          ) {
            specimenTissueData.mPathId = observation.ontologyTerms[0].termId;
            specimenTissueData.mPathTerm =
              observation.ontologyTerms[0].termName;
          } else if (observation.parameterName.includes("MA term")) {
            specimenTissueData.maId = observation.ontologyTerms[0].termId;
            specimenTissueData.maTerm = observation.ontologyTerms[0].termName;
          } else if (observation.parameterName.includes("Severity score")) {
            specimenTissueData.severityScore = observation.category;
          } else if (observation.parameterName.includes("Significance score")) {
            specimenTissueData.significanceScore = observation.category;
          } else if (observation.parameterName.includes("Descriptor PATO")) {
            specimenTissueData.descriptorPATO = observation.ontologyTerms
              .map((term) => term.termName)
              .join(" ");
          } else if (
            observation.parameterName.includes("Free text diagnostic term")
          ) {
            specimenTissueData.freeText = observation.textValue;
          } else if (observation.parameterName.includes("Description")) {
            specimenTissueData.description = observation.textValue;
          } else if (observation.parameterName.includes("Images")) {
            images.push({
              zygosity: observation.zygosity,
              tissue: dataset.tissue,
              alleleSymbol: observation.alleleSymbol,
              thumbnailUrl: observation.thumbnailUrl,
              omeroId: observation.omeroId,
              maId: observation.ontologyTerms?.[0]?.termId || "N/A",
              maTerm: observation.ontologyTerms?.[0]?.termName || "N/A",
              specimenId: observation.specimenId,
              specimenNumber: "",
            });
          }
        });
      });
      const histopathologyData = Object.entries(specimensData).flatMap(
        ([specimenId, specimen], index) => {
          return Object.entries(specimen.tissues).map(([tissue, data]) => {
            return {
              ...data,
              specimenId,
              tissue,
              lifeStageName: specimen.lifeStageName,
              zygosity: specimen.zygosity,
              specimenNumber: `#${index + 1}`,
            } as Histopathology;
          });
        },
      );
      const specimenIds = Object.keys(specimensData);
      images = images.map((image) => ({
        ...image,
        specimenNumber: `#${specimenIds.findIndex((id) => id === image.specimenId) + 1}`,
      }));
      return {
        histopathologyData,
        images: groupBy(images, (image) => image.tissue),
      };
    },
  });
};
