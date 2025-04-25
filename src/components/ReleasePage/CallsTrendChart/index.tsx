import { SummaryCounts } from "@/models/release";
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController,
} from "chart.js";
import { useMemo } from "react";
import { Chart } from "react-chartjs-2";

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController
);

type Props = {
  data: SummaryCounts;
};

const CallsTrendChart = (props: Props) => {
  const { data } = props;
  const chartData = useMemo(() => {
    const sortedKeys = Object.keys(data).sort((a, b) => {
      const firstNum = parseFloat(a);
      const secondNum = parseFloat(b);
      return firstNum - secondNum;
    });
    return {
      labels: sortedKeys,
      datasets: [
        {
          type: "line" as const,
          label: "MP calls",
          borderColor: "#004D40",
          backgroundColor: "#004D40",
          borderWidth: 2,
          fill: false,
          yAxisID: "y1",
          data: sortedKeys
            .map((key) => data[key])
            .map(
              (summary) => summary.phenotypeCalls || summary.phentoypeCalls || 0
            ),
        },
        {
          type: "bar" as const,
          label: "Phenotyped genes",
          backgroundColor: "rgb(239, 123, 11)",
          yAxisID: "y",
          data: sortedKeys
            .map((key) => data[key])
            .map((summary) => summary.phenotypedGenes || 0),
        },
        {
          type: "bar" as const,
          label: "Phenotyped lines",
          backgroundColor: "rgb(9, 120, 161)",
          yAxisID: "y",
          data: sortedKeys
            .map((key) => data[key])
            .map((summary) => summary.phenotypedLines || 0),
        },
      ],
    };
  }, [data]);

  const latestPhenotypedLinesCount = chartData.datasets[2]?.data.slice(-1)[0];
  const suggestedLeftAxisMax = latestPhenotypedLinesCount * 1.2;

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          mode: "index" as const,
        },
        legend: {
          position: "bottom" as const,
        },
      },
      scales: {
        y: {
          type: "linear" as const,
          display: true,
          position: "left" as const,
          title: {
            display: true,
            text: "Genes/Mutant Lines",
          },
          suggestedMax: suggestedLeftAxisMax,
        },
        y1: {
          type: "linear" as const,
          display: true,
          position: "right" as const,
          title: {
            display: true,
            text: "Phenotype Calls",
          },
          grid: {
            drawOnChartArea: false,
          },
        },
        x: {
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    };
  }, [suggestedLeftAxisMax]);

  return <Chart type="bar" data={chartData} options={chartOptions} />;
};

export default CallsTrendChart;
