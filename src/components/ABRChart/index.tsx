"use client";

import { mutantChartColors, wildtypeChartColors } from "@/utils/chart";
import { Chart } from "react-chartjs-2";
import errorbarsPlugin from "@/utils/chart/errorbars.plugin";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineController,
  BarController
);

const ABRChart = ({ geneData }) => {
  const getChartLabels = () => {
    return [
      "Click-evoked ABR threshold",
      null,
      "6kHz-evoked ABR Threshold",
      "12kHz-evoked ABR Threshold",
      "18kHz-evoked ABR Threshold",
      "24kHz-evoked ABR Threshold",
      "30kHz-evoked ABR Threshold",
    ];
  };

  const getPointStyle = (zygosity, sex) => {
    if (zygosity === "WT" && sex === "Male") {
      return "rectRot";
    } else if (zygosity === "WT" && sex === "Female") {
      return "rect";
    } else if (zygosity !== "WT" && sex === "Male") {
      return "circle";
    } else if (zygosity !== "WT" && sex === "Female") {
      return "triangle";
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    scales: {
      y: {
        min: 0,
        max: 120,
        title: {
          display: true,
          text: "dB SPL",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { usePointStyle: true },
      },
      tooltip: {
        usePointStyle: true,
        title: { padding: { top: 10 } },
        callbacks: {
          label: (ctx) => {
            const minValue = ctx.raw.yMin.toFixed(2);
            const maxValue = ctx.raw.yMax.toFixed(2);
            return `${ctx.dataset.label}: ${ctx.formattedValue} (SD: ${minValue} - ${maxValue})`;
          },
        },
      },
    },
  };
  const processData = () => {
    return geneData.map((dataset) => {
      const sexKey = dataset.sex === "female" ? "Female" : "Male";
      const zygLabel =
        dataset.zygosity === "wildtype"
          ? "WT"
          : dataset.zygosity === "heterozygote"
          ? "Het"
          : "Hom";
      const label = `${sexKey} ${zygLabel}`;
      return {
        type: "line" as const,
        label: label,
        data: dataset.values.map((val, index) => {
          if (val === null) {
            return { x: null, y: null };
          }
          const { min, max } = dataset.sd[index];
          return {
            y: val,
            yMin: min,
            yMax: max,
            x: getChartLabels()[index],
          };
        }),
        borderColor:
          zygLabel === "WT"
            ? wildtypeChartColors.fullOpacity
            : mutantChartColors.fullOpacity,
        backgroundColor:
          zygLabel === "WT"
            ? wildtypeChartColors.halfOpacity
            : mutantChartColors.halfOpacity,
        pointStyle: getPointStyle(zygLabel, sexKey),
      };
    });
  };

  const chartData = {
    labels: getChartLabels(),
    datasets: processData(),
  };

  const chartPlugins = [errorbarsPlugin];

  return (
    <>
      <div style={{ textAlign: "center", marginTop: "1.5em" }}>
        <h3 style={{ marginBottom: 0 }}>
          Evoked ABR Threshold (6, 12, 18, 24, 30kHz)
        </h3>
        <a
          className="primary link"
          href="https://www.mousephenotype.org/impress/ProcedureInfo?action=list&procID=542"
        >
          Auditory Brain Stem Response
        </a>
      </div>
      <div style={{ position: "relative", height: "300px" }}>
        <Chart
          type="bar"
          data={chartData}
          options={chartOptions}
          plugins={chartPlugins}
        />
      </div>
    </>
  );
};
export default ABRChart;
