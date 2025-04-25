import { TooltipItem } from "chart.js";

function displayTooltipLabelMultiline(context: TooltipItem<"boxplot">) {
  return context.formattedValue.toString().slice(1, -1).split(",");
}

export default displayTooltipLabelMultiline;
