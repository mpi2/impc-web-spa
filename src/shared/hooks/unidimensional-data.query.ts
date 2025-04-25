import { useQuery } from "@tanstack/react-query";
import { fetchDatasetFromS3 } from "@/api-service";
import moment, { Moment } from "moment";
import { sortBy } from "lodash";

/*type DataSerie = {
  observations: Array<{
    bodyWeight: number;
    dataPoint: number;
    dateOfExperiment: string;
    specimenDateOfBirth: string;
    specimenId: string;
    windowWeight: number;
  }>;
  sampleGroup: "control" | "experimental";
  specimenSex: "male" | "female";
};

type ChartObservation = DataSerie["observations"][number] & { x: Moment; y: number; };
type ChartSeries = Omit<DataSerie, "observations" | "specimenSex"> & { data: Array<ChartObservation>, sex: "male" | "female"};*/

type ChartSeries = {
  data: Array<any>;
  sampleGroup: "control" | "experimental";
  sex: "male" | "female";
};

const getScatterSeries = (dataSeries, sex: "male" | "female", sampleGroup: "control" | "experimental") => {
  if (!dataSeries) {
    return null;
  }
  const data =
    dataSeries
      .find(p => p.sampleGroup === sampleGroup && p.specimenSex === sex)?.observations
      .map(p => ({
        ...p,
        x: moment(p.dateOfExperiment),
        y: +p.dataPoint,
      })) || [];

  return {
    sex,
    sampleGroup,
    data,
  };
};

const filterChartSeries = (
  zygosity: string,
  seriesArray: Array<ChartSeries>
) => {
  if (zygosity === "hemizygote") {
    return seriesArray.filter((c) => c.sex === "male");
  }
  const validExperimentalSeries = seriesArray.filter(
    (c) => c.sampleGroup === "experimental" && c.data.length > 0
  );
  const validExperimentalSeriesSexes = validExperimentalSeries.map(
    (c) => c.sex
  );
  const controlSeries = seriesArray.filter(
    (c) =>
      c.sampleGroup === "control" &&
      validExperimentalSeriesSexes.includes(c.sex)
  );
  return [...controlSeries, ...validExperimentalSeries];
};


export const useUnidimensionalDataQuery = (
  parameterName: string,
  datasetId: string,
  zygosity: string,
  isEnabled: boolean
) => {
  return useQuery({
    queryKey: [
      "dataset",
      parameterName,
      datasetId,
    ],
    queryFn: () => fetchDatasetFromS3(datasetId),
    select: (response) => {
      const dataSeries = response.series;
      const femaleWTPoints = getScatterSeries(dataSeries, "female", "control");
      const maleWTPoints = getScatterSeries(dataSeries, "male", "control");
      const femaleHomPoints = getScatterSeries(
        dataSeries,
        "female",
        "experimental"
      );
      const maleHomPoints = getScatterSeries(
        dataSeries,
        "male",
        "experimental"
      );
      const windowPoints = [...dataSeries.flatMap((s) => s.observations)]
        .filter((p) => p.windowWeight)
        .map((p) => ({
          ...p,
          x: moment(p.dateOfExperiment),
          y: p.windowWeight ? +p.windowWeight : null,
        }));
      windowPoints.sort((a, b) => a.x - b.x);

      const chartSeries = sortBy(filterChartSeries(zygosity, [
        femaleWTPoints,
        maleWTPoints,
        femaleHomPoints,
        maleHomPoints,
      ]), ["sex", "sampleGroup"]);

      return {
        chartSeries,
        lineSeries: [windowPoints],
        originalData: response,
      };
    },
    enabled: isEnabled,
    placeholderData: { series: [] },
  });
}