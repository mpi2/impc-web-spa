import { Dataset } from "@/models";
import {
  BodyWeightChart,
  Categorical,
  EmbryoViability,
  Histopathology,
  TimeSeries,
  Unidimensional,
  Viability,
  GrossPathology,
} from "@/components/Data";
import { ReactNode } from "react";

export const getZygosityLabel = (zygosity: string, sampleGroup: string) => {
  const labelZyg =
    zygosity === "hemizygote"
      ? "HEM"
      : zygosity === "homozygote"
      ? "HOM"
      : "HET";
  return sampleGroup == "control" ? "WT" : labelZyg;
};
export const getChartType = (
  datasetSummary: Dataset,
  isVisible: boolean = true,
  extraChildren: ReactNode = <></>
) => {
  let chartType = datasetSummary?.dataType;
  if (chartType == "line" || chartType == "embryo") {
    chartType =
      datasetSummary.procedureGroup == "IMPC_VIA"
        ? "viability"
        : datasetSummary.procedureGroup == "IMPC_FER"
        ? "fertility"
        : ["IMPC_EVL", "IMPC_EVM", "IMPC_EVP", "IMPC_EVO"].includes(
            datasetSummary.procedureGroup
          )
        ? "embryo_viability"
        : chartType;
  }

  if (
    chartType === "time_series" &&
    datasetSummary.procedureGroup === "IMPC_BWT"
  ) {
    chartType = "bodyweight";
  }

  let Chart = null;
  switch (chartType) {
    case "unidimensional":
      Chart = (
        <Unidimensional datasetSummary={datasetSummary} isVisible={isVisible}>
          {extraChildren}
        </Unidimensional>
      );
      break;
    case "categorical":
      Chart = (
        <Categorical datasetSummary={datasetSummary} isVisible={isVisible}>
          {extraChildren}
        </Categorical>
      );
      break;
    case "time_series":
      Chart = (
        <TimeSeries datasetSummary={datasetSummary} isVisible={isVisible}>
          {extraChildren}
        </TimeSeries>
      );
      break;
    case "viability":
      Chart = (
        <Viability datasetSummary={datasetSummary} isVisible={isVisible} />
      );
      break;
    case "embryo_viability":
      Chart = (
        <EmbryoViability
          datasetSummary={datasetSummary}
          isVisible={isVisible}
        />
      );
      break;
    case "embryo":
      Chart = (
        <Categorical datasetSummary={datasetSummary} isVisible={isVisible} />
      );
      break;
    case "histopathology":
      Chart = <Histopathology datasetSummary={datasetSummary} />;
      break;
    case "bodyweight":
      Chart = <BodyWeightChart datasetSummary={datasetSummary} />;
      break;
    case "adult-gross-path":
      Chart = <GrossPathology datasetSummary={datasetSummary} />;
      break;
  }
  return { Chart, chartType };
};
