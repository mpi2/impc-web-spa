"use client";
import { chartColors as defaultChartColors } from "../../utils/chart";
import { Pie } from "react-chartjs-2";
import { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

type DataArray = Array<{ label: string; value: number }>;

interface Props {
  title?: string;
  data: DataArray;
  chartColors?: Array<string>;
}
const PieChart = ({ title, data, chartColors }: Props) => {
  const [total, setTotal] = useState(1);
  useEffect(() => {
    setTotal(data.reduce((acc, data) => acc + data.value, 0));
  }, [data]);

  return (
    <Pie
      data={{
        labels: data.map((value) => value.label),
        datasets: [
          {
            label: title,
            data: data.map(({ value }) => Math.max((value / total) * 100, 1)),
            backgroundColor: chartColors || defaultChartColors,
          },
        ],
      }}
      options={{
        maintainAspectRatio: false,
        plugins: {
          title: { display: !!title, text: title },
          legend: { position: "bottom", align: "start" },
          tooltip: {
            mode: "index",
            callbacks: {
              label: (item) => {
                const dataset = item.dataset;
                const currentValue = data.find(
                  (val) => val.label === item.label,
                ).value;
                const percentage = parseFloat(
                  ((currentValue / total) * 100).toFixed(2),
                );
                return `${item.label} - ${percentage}%`;
              },
            },
          },
        },
      }}
    />
  );
};

export default PieChart;
