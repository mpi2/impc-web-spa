import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  TimeScale,
} from "chart.js";
import {
  BoxPlotController,
  BoxAndWiskers,
} from "@sgratzl/chartjs-chart-boxplot";
import { Chart } from "react-chartjs-2";
import { FC } from "react";
import { bgColors, borderColors } from "@/components/Data/Plots";
import displayTooltipLabelMultiline from "@/shared/chart-js-plugins/boxplot-tooltip-label-multiline";

interface UnidimensionalSeries {
  sex: "male" | "female";
  sampleGroup: "experimental" | "control";
  data: Array<number>;
}

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Legend,
  Tooltip,
  BoxPlotController,
  BoxAndWiskers,
  CategoryScale,
);

const shapes = { male: "triangle", female: "circle" };
const pointRadius = 5;

const getBoxPlotDataset = (series, zygosity) => {
  const labels = series.map(({ sex, sampleGroup }) => {
    const labelSex = sex[0].toUpperCase() + sex.slice(1);
    const labelZyg =
      zygosity === "homozygote"
        ? "HOM"
        : zygosity === "hemizygote"
          ? "HEM"
          : "HET";
    const labelGroup = sampleGroup == "experimental" ? labelZyg : "WT";
    return `${labelSex} ${labelGroup}`;
  });

  return {
    labels,
    datasets: [
      {
        type: "boxplot" as const,
        backgroundColor: (d) => bgColors[series[d.index]?.sampleGroup],
        data: series.map((s) => s.data.map((i) => +i.dataPoint)),
        borderColor: (d) => borderColors[series[d.index]?.sampleGroup],
        itemStyle: (d) => shapes[series[d.index]?.sex],
        borderWidth: 2,
        itemRadius: 0,
        padding: 100,
        outlierRadius: pointRadius,
      },
    ],
  };
};

interface IUnidimensionalBoxPlotProps {
  series: Array<UnidimensionalSeries>;
  zygosity: "homozygote" | "heterozygote" | "hemizygote";
  chartAdditionalOptions?: Record<string, any>;
  parameterName: string;
  unit: string;
}

const UnidimensionalBoxPlot: FC<IUnidimensionalBoxPlotProps> = ({
  series,
  zygosity,
  chartAdditionalOptions = {},
  parameterName,
  unit,
}) => {
  return (
    <Chart
      type="boxplot"
      data={getBoxPlotDataset(series, zygosity)}
      options={{
        maintainAspectRatio: true,
        aspectRatio: 1,
        scales: {
          y: {
            type: "linear",
            // max: max,
            // min: min,
            beginAtZero: false,
            ticks: {
              align: "center",
              crossAlign: "center",
            },
            title: {
              text: `${parameterName} ${
                unit && unit.trim() !== "" ? "(" + unit + ")" : ""
              }`,
              display: true,
              align: "center",
              padding: 5,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
            position: "bottom",
            labels: {
              usePointStyle: true,
              padding: 0,
            },
          },
          tooltip: {
            callbacks: {
              label: displayTooltipLabelMultiline,
            },
          },
        },
        ...chartAdditionalOptions,
      }}
    />
  );
};

export default UnidimensionalBoxPlot;
