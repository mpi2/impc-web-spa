export interface UnidimensionalSeries {
  sex: "male" | "female";
  sampleGroup: "experimental" | "control";
  data: Array<number>;
}
export interface CategoricalSeries {
  sex: "male" | "female";
  sampleGroup: "experimental" | "control";
  category: string;
  value: number;
}

export const bgColors = {
  control: "rgba(212, 17, 89, 0.2)",
  experimental: "rgba(26, 133, 255, 0.7)",
};
export const borderColors = {
  control: "rgba(212, 17, 89, 0.5)",
  experimental: "rgba(26, 133, 255, 0.7)",
};
export const shapes = { male: "triangle", female: "circle" };
export const pointRadius = 5;
