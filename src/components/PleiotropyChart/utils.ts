import { ChartDimensions, PleiotropyData } from "@/models";

export function getDimensions({
  width,
  height,
}: {
  width: number;
  height: number;
}): ChartDimensions {
  const margin = {
    top: 50,
    right: 10,
    bottom: 50,
    left: 70,
  };

  return {
    margin,
    boundedWidth: width - margin.left - margin.right,
    boundedHeight: height - margin.top - margin.bottom,
  };
}

export const yAccessor = (d: PleiotropyData) => d.phenotypeCount;
export const xAccessor = (d: PleiotropyData) => d.otherPhenotypeCount;
