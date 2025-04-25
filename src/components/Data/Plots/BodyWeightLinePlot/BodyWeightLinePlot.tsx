import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  ChartData,
  ChartDataset,
  ChartType,
  DefaultDataPoint,
} from "chart.js";

type BodyWeightLinePlotProps<
  TType extends ChartType = ChartType,
  TData = DefaultDataPoint<TType>,
  TLabel = unknown,
> = {
  data: ChartData<TType, TData, TLabel>;
  options?: Record<string, any>;
  height?: number;
  width?: number;
};

export function setDatasets<
  TType extends ChartType = ChartType,
  TData = DefaultDataPoint<TType>,
  TLabel = unknown,
>(
  currentData: ChartData<TType, TData, TLabel>,
  nextDatasets: ChartDataset<TType, TData>[],
  datasetIdKey = "label",
) {
  const addedDatasets: ChartDataset<TType, TData>[] = [];

  currentData.datasets = nextDatasets.map(
    (nextDataset: Record<string, unknown>) => {
      // given the new set, find it's current match
      const currentDataset = currentData.datasets.find(
        (dataset: Record<string, unknown>) =>
          dataset[datasetIdKey] === nextDataset[datasetIdKey],
      );

      // There is no original to update, so simply add new one
      if (
        !currentDataset ||
        !nextDataset.data ||
        addedDatasets.includes(currentDataset)
      ) {
        return { ...nextDataset } as ChartDataset<TType, TData>;
      }

      addedDatasets.push(currentDataset);

      Object.assign(currentDataset, nextDataset);

      return currentDataset;
    },
  );
}

function BodyWeightLinePlot(props: BodyWeightLinePlotProps, ref) {
  const { data, options, width = 300, height = 150 } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>();

  const renderChart = () => {
    if (!canvasRef.current) return;
    chartRef.current = new ChartJS(canvasRef.current, {
      type: "lineWithErrorBars",
      data,
      options: options && { ...options },
    });
  };
  const destroyChart = () => {
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
  };

  useEffect(() => {
    if (chartRef.current && options) {
      Object.assign(chartRef.current.options, options);
    }
  }, [options]);

  useEffect(() => {
    if (chartRef.current && data.datasets) {
      setDatasets(chartRef.current.config.data, data.datasets);
    }
  }, [data.datasets]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.config.data.labels = data.labels;
    }
  }, [data.labels]);

  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.update();
  }, [options, data.labels, data.datasets]);

  useEffect(() => {
    renderChart();
    return () => destroyChart();
  }, []);

  return (
    <canvas
      data-testid="body-weight-canvas"
      ref={canvasRef}
      role="img"
      height={height}
      width={width}
    ></canvas>
  );
}

export default BodyWeightLinePlot;
