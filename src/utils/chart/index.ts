import moment from "moment/moment";
import { ChartSeries, Dataset } from "@/models";
import _ from "lodash";

export const chartColors = [
  'rgba(9, 120, 161, 1)',
  'rgba(255, 201, 67, 1)',
  'rgba(239, 123, 11, 1)',
  'rgba(119, 119, 119, 1)',
  'rgba(36, 139, 75, 1)',
  'rgba(238, 238, 180, 1)',
  'rgba(191, 75, 50, 1)',
  'rgba(191, 151, 50, 1)',
  'rgba(239, 123, 11, 1)',
  'rgba(247, 157, 70, 1)',
  'rgba(247, 181, 117, 1)',
  'rgba(191, 75, 50, 1)',
  'rgba(151, 51, 51, 1)',
  "rgb(239, 123, 11)",
  "rgb(9, 120, 161)",
  "rgb(119, 119, 119)",
  "rgb(238, 238, 180)",
  "rgb(36, 139, 75)",
  "rgb(191, 75, 50)",
  "rgb(255, 201, 67)",
  "rgb(191, 151, 50)",
  "rgb(239, 123, 11)",
  "rgb(247, 157, 70)",
  "rgb(247, 181, 117)",
  "rgb(191, 75, 50)",
  "rgb(151, 51, 51)",
  "rgb(144, 195, 212)"
];

export const mutantChartColors = {
  fullOpacity: 'rgb(26, 133, 255)',
  halfOpacity: 'rgba(26, 133, 255, 0.5)'
};
export const wildtypeChartColors = {
  fullOpacity: 'rgb(212, 17, 89)',
  halfOpacity: 'rgba(212, 17, 89, 0.5)',
};

export const getScatterSeries = (
  dataSeries: Array<ChartSeries<any>>,
  specimenSex: "male" | "female",
  sampleGroup: "control" | "experimental"
) => {
  if (!dataSeries) {
    return null;
  }
  const data =
    dataSeries
      .find((p) => p.sampleGroup === sampleGroup && p.specimenSex === specimenSex)
      ?.["observations"].map((p) => {
        return {
          ...p,
          x: moment(p.dateOfExperiment),
          y: +p.dataPoint,
        };
    }) || [];
  return {
    specimenSex,
    sampleGroup,
    data,
  };
};

export const filterChartSeries = (
  zygosity: string,
  seriesArray: Array<ChartSeries<any>>
) => {
  if (zygosity === "hemizygote") {
    return seriesArray.filter((c) => c.specimenSex === "male");
  }
  const validExperimentalSeries = seriesArray.filter(
    (c) => c.sampleGroup === "experimental" && c.data.length > 0
  );
  const validExperimentalSeriesSexes = validExperimentalSeries.map(
    (c) => c.specimenSex
  );
  const controlSeries = seriesArray.filter(
    (c) =>
      c.sampleGroup === "control" &&
      validExperimentalSeriesSexes.includes(c.specimenSex)
  );
  return [...controlSeries, ...validExperimentalSeries];
};

export const updateSummaryStatistics = (datasetSummary: Dataset, chartSeries: Array<ChartSeries<any>>) => {
  const zygosity = datasetSummary.zygosity;
  return chartSeries.map((serie) => {
    const { sampleGroup, specimenSex } = serie;
    const sampleGroupKey = sampleGroup === "control" ? "Control" : "Mutant";
    const meanKey = `${specimenSex}${sampleGroupKey}Mean`;
    const stddevKey = `${specimenSex}${sampleGroupKey}Sd`;
    const countKey = `${specimenSex}${sampleGroupKey}Count`;
    return {
      label: `${_.capitalize(specimenSex)} ${
        sampleGroup === "control" ? "Control" : _.capitalize(zygosity)
      }`,
      mean: Number(datasetSummary.summaryStatistics?.[meanKey]).toFixed(3),
      stddev: Number(datasetSummary.summaryStatistics?.[stddevKey]).toFixed(3),
      count: datasetSummary.summaryStatistics?.[countKey] || 0,
    };
  });
};

export const generateSummaryStatistics = (dataset: Dataset, dataSeries: Array<any>) => {
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
  const allSeries = filterChartSeries(dataset.zygosity, [
    femaleWTPoints,
    maleWTPoints,
    femaleHomPoints,
    maleHomPoints,
  ]);
  return updateSummaryStatistics(dataset, allSeries);
}
