import { Dataset } from "@/models";

const parametersListPPI = [
  "IMPC_ACS_033_001", // % PP1
  "IMPC_ACS_034_001", // % PP2
  "IMPC_ACS_035_001", // % PP3
  "IMPC_ACS_036_001", // % PP4
];

export const useChartFlags = (datasets: Array<Dataset>, isError: boolean) => {
  const isABRChart = !isError
    ? !!datasets.some(
        (dataset) =>
          dataset.dataType === "unidimensional" &&
          dataset.procedureGroup === "IMPC_ABR"
      )
    : false;
  const isViabilityChart = !isError
    ? !!datasets.some((dataset) => dataset.procedureGroup === "IMPC_VIA")
    : false;
  const isTimeSeries = !isError
    ? !!datasets.some((dataset) => dataset.dataType === "time_series")
    : false;

  const isIPGTTChart = !isError
    ? !!datasets.some((dataset) => dataset.procedureStableId === "IMPC_IPG_001")
    : false;

  const isPPIChart = !isError
    ? !!datasets.some((dataset) =>
        parametersListPPI.includes(dataset.parameterStableId)
      )
    : false;

  const hasFlowCytometryImages = !isError
    ? !!datasets.some(
        (dataset) =>
          dataset.procedureStableId.startsWith("MGP_BMI") ||
          dataset.procedureStableId.startsWith("MGP_MLN") ||
          dataset.procedureStableId.startsWith("MGP_IMM")
      )
    : false;

  const isMiniSpecProcedure = !isError
    ? datasets.some((d) => d?.procedureStableId?.startsWith("HMGULA_MIN"))
    : false;

  const noStatisticsPerformed = !isError
    ? datasets.every((d) => d.status === "NotProcessed")
    : false;

  return {
    isABRChart,
    isViabilityChart,
    isTimeSeries,
    isIPGTTChart,
    isPPIChart,
    hasFlowCytometryImages,
    isMiniSpecProcedure,
    noStatisticsPerformed,
  };
};
