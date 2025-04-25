import {
  DataPointCount,
  dataPointCountByDR,
  dataPointType,
} from "@/models/release";
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
} from "chart.js";
import { useMemo } from "react";
import { Chart } from "react-chartjs-2";

ChartJS.register(
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController
);

type Props = {
  data: DataPointCount;
};

const getCountByDataType = (
  drPoints: Array<dataPointCountByDR>,
  type: dataPointType
) => {
  return drPoints.find((d) => d.dataType === type).count;
};

const DataPointsTrendChart = (props: Props) => {
  const { data } = props;

  const chartData = useMemo(() => {
    const sortedKeys = Object.keys(data).sort((a, b) => {
      const firstNum = parseFloat(a);
      const secondNum = parseFloat(b);
      return firstNum - secondNum;
    });
    const sortedData = sortedKeys.map((key) => data[key]);
    return {
      labels: sortedKeys,
      datasets: [
        {
          label: "Categorical (QC passed)",
          tension: 0.1,
          fill: false,
          pointStyle: "crossRot",
          borderColor: "#DDCC77",
          backgroundColor: "#DDCC77",
          data: sortedData.map((dataPoints) =>
            getCountByDataType(dataPoints, "categorical")
          ),
        },
        {
          label: "Time series (QC passed)",
          tension: 0.1,
          fill: false,
          pointStyle: "triangle",
          borderColor: "#117733",
          backgroundColor: "#117733",
          data: sortedData.map((dataPoints) =>
            getCountByDataType(dataPoints, "time_series")
          ),
        },
        {
          label: "Image record (QC passed)",
          tension: 0.1,
          fill: false,
          pointStyle: "star",
          borderColor: "#44AA99",
          backgroundColor: "#44AA99",
          data: sortedData.map((dataPoints) =>
            getCountByDataType(dataPoints, "image_record")
          ),
        },
        {
          label: "Ontological datapoints (QC passed)",
          tension: 0.1,
          fill: false,
          pointStyle: "rectRot",
          borderColor: "#88CCEE",
          backgroundColor: "#88CCEE",
          data: sortedData.map((dataPoints) =>
            getCountByDataType(dataPoints, "ontological")
          ),
        },
        {
          label: "Text (QC passed)",
          tension: 0.1,
          pointStyle: "rect",
          borderColor: "#882255",
          backgroundColor: "#882255",
          fill: false,
          data: sortedData.map((dataPoints) =>
            getCountByDataType(dataPoints, "text")
          ),
        },
        {
          label: "Unidimensional (QC passed)",
          tension: 0.1,
          fill: false,
          borderColor: "#CC6677",
          backgroundColor: "#CC6677",
          data: sortedData.map((dataPoints) =>
            getCountByDataType(dataPoints, "unidimensional")
          ),
        },
      ],
    };
  }, [data]);

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
          title: {
            display: true,
            text: "Data points",
          },
        },
        x: {
          grid: {
            drawOnChartArea: false,
          },
        },
      },
      elements: {
        point: {
          radius: 4,
        },
      },
    };
  }, []);

  return <Chart type="line" data={chartData} options={chartOptions} />;
};

export default DataPointsTrendChart;
