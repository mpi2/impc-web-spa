import { allBodySystems } from "@/utils";

export type CatType = "ALL" | "BODY_SYSTEMS" | "PROCEDURES";

export const cats: { [key: string]: CatType } = {
  ALL: "ALL",
  BODY_SYSTEMS: "BODY_SYSTEMS",
  PROCEDURES: "PROCEDURES",
};

export const options = [
  {
    label: "None",
    category: cats.SIGNIFICANT,
  },
  {
    label: "Physiological systems",
    category: cats.BODY_SYSTEMS,
  },

  {
    label: "Procedures",
    category: cats.PROCEDURES,
  },
];

export type Cat = { type: CatType; meta?: any };

type ChartLabel = { color: string, shape: string };
export type ChartLabels = Record<string, ChartLabel>;
export const colorArray = [
  "#FF6633",
  "#FFB399",
  "#FF33FF",
  "#00B3E6",
  "#E6B333",
  "#3366E6",
  "#999966",
  "#99FF99",
  "#B34D4D",
  "#80B300",
  "#809900",
  "#E6B3B3",
  "#6680B3",
  "#66991A",
  "#FF99E6",
  "#CCFF1A",
  "#FF1A66",
  "#E6331A",
  "#33FFCC",
  "#66994D",
  "#B366CC",
  "#4D8000",
  "#B33300",
  "#CC80CC",
  "#66664D",
  "#991AFF",
  "#E666FF",
  "#4DB3FF",
  "#1AB399",
  "#E666B3",
  "#33991A",
  "#CC9999",
  "#B3B31A",
  "#00E680",
  "#4D8066",
  "#809980",
  "#E6FF80",
  "#1AFF33",
  "#999933",
  "#FF3380",
  "#CCCC00",
  "#66E64D",
  "#4D80CC",
  "#9900B3",
  "#E64D66",
  "#4DB380",
  "#FF4D4D",
  "#99E6E6",
  "#6666FF",
];
export const systemColorMap: ChartLabels = {};
export const getProcedureColorMap = (labels: Array<string>): ChartLabels => {
  const tempLabels = [...labels].sort();
  const result: ChartLabels = {};
  colorArray.forEach((color, i) => {
    const firstProd = tempLabels.shift();
    const secondProd = tempLabels.shift();
    if (firstProd) {
      result[firstProd] = { color, shape: 'circle' };
    }
    if (secondProd) {
      result[secondProd] = { color, shape: 'diamond' };
    }
  });
  return result;
}
allBodySystems.forEach((system, index) => {
  systemColorMap[system] = { color: colorArray[index], shape: undefined };
});