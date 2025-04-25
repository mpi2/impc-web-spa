import { Chart } from "react-chartjs-2";
import { CategoricalSeries } from "..";

import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  TimeScale,
  BarElement,
} from "chart.js";
import { getZygosityLabel } from "@/components/Data/Utils";
import { capitalize, uniq } from "lodash";

const colorArray = [
  "#D41159",
  "#0978a1",
  "#117733",
  "#44AA99",
  "#88CCEE",
  "#DDCC77",
  "#CC6677",
  "#AA4499",
];

ChartJS.register(
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  TimeScale,
  Legend,
  Tooltip,
  CategoryScale
);

const getChartLabel = (series: CategoricalSeries, zygosity) => {
  const labelSex = capitalize(series.sex);
  const labelGroup = getZygosityLabel(zygosity, series.sampleGroup);
  return `${labelSex} ${labelGroup}`;
};

const getCategoricalBarDataset = (
  series: CategoricalSeries,
  zygosity,
  categories,
  labels: Array<string>
) => {
  const dataset = {
    backgroundColor: colorArray[categories.indexOf(series.category)],
    label: series.category,
    stack: "0",
    data: labels.map(() => 0),
  };
  const seriesLabel = getChartLabel(series, zygosity);
  const labelPos = labels.findIndex((label) => label === seriesLabel);
  dataset.data.splice(labelPos, 1, series.value);
  return dataset;
};

const CategoricalBarPlot = ({ series, zygosity }) => {
  const datasets = {};
  const categories = series.map((s) => s.category);
  const labels: Array<string> = uniq(
    series.map((s) => getChartLabel(s, zygosity))
  );
  series.forEach((s) => {
    if (!datasets[s.category]) {
      datasets[s.category] = getCategoricalBarDataset(
        s,
        zygosity,
        categories,
        labels
      );
    } else {
      const seriesLabel = getChartLabel(s, zygosity);
      const labelPos = labels.findIndex((label) => label === seriesLabel);
      datasets[s.category].data.splice(labelPos, 1, s.value);
    }
  });

  return (
    <Chart
      type="bar"
      data={{
        datasets: Object.values(datasets),
        labels: labels.filter(
          (value, index, self) => self.indexOf(value) === index
        ),
      }}
      options={{
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || "";
                return `${label}: ${context.parsed.y?.toFixed(2)}%`;
              },
            },
          },
        },
        scales: {
          y: {
            type: "linear",
            display: true,
            stacked: true,
            position: "left",
            max: 100,
            min: 0,
            title: { text: "Percent occurrence", display: true },
          },
          x: { stacked: true, display: true, position: "bottom" },
        },
      }}
    />
  );
};

export default CategoricalBarPlot;
