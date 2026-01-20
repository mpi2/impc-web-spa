import { Dataset } from "@/models";
import { fetchData } from "@/api-service";
import _ from "lodash";
import { useEffect, useState } from "react";
import geneChromosomeMap from "@/static-data/chromosome-map.json";
const clone = (obj: any) => JSON.parse(JSON.stringify(obj));

export const useRelatedParametersQuery = (
  allDatasets: Array<Dataset>,
  allParametersList: Array<string>,
  onMissingProceduresFetched: (datasets: Array<Dataset>) => void,
) => {
  const [datasets, setDatasets] = useState<Array<Dataset>>(allDatasets);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const {
      mgiGeneAccessionId,
      alleleAccessionId,
      pipelineStableId,
      zygosity,
      procedureStableId,
      phenotypingCentre,
      metadataGroup,
    } = allDatasets[0];
    setIsLoading(true);
    const proceduresWithData = allDatasets.map((d) => d.parameterStableId);
    const missingParameters = allParametersList.filter(
      (p) => !proceduresWithData.includes(p),
    );
    const chromosome: string = (geneChromosomeMap as Record<string, string>)[
      mgiGeneAccessionId
    ];
    const id = mgiGeneAccessionId?.replace(":", "_");
    const allProcedureData = fetchData(
      `${chromosome}/${id}/pipelines/${pipelineStableId}/${procedureStableId}.json`,
    );
    allProcedureData
      .then((allDatasets) =>
        allDatasets.filter(
          (ds) =>
            ds.alleleAccessionId === alleleAccessionId &&
            ds.zygosity === zygosity &&
            ds.phenotypingCentre === phenotypingCentre &&
            missingParameters.includes(ds.parameterStableId),
        ),
      )
      .then((allDatasets) => {
        const proceduresData: Array<any> = [];
        allDatasets
          .filter((ds) => ds.metadataGroup === metadataGroup)
          .forEach(({ id, ...ds }) => {
            if (!proceduresData.find((d) => _.isEqual(d, ds))) {
              proceduresData.push({ id, ...ds });
            }
          });
        return proceduresData;
      })
      .then((missingProcedureData) => {
        // get data from props first, then add missing data
        const allData = clone(allDatasets);
        missingProcedureData.forEach((d) => allData.push(d));
        allData.sort((d1, d2) =>
          d1.parameterStableId.localeCompare(d2.parameterStableId),
        );
        onMissingProceduresFetched(missingProcedureData);
        setIsLoading(false);
        setDatasets(allData);
      });
  }, [allDatasets]);
  return { datasets, datasetsAreLoading: isLoading };
};
