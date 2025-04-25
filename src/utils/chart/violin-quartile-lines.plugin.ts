
function drawLine(ctx, plotData, propDataKey, dashLinePattern) {
  const {
    x: xValue,
    width,
    maxEstimate = 1,
    coords = [],
  } = plotData;
  const yValue = plotData[propDataKey];
  const closestValue = coords.reduce((prev, curr) =>
    Math.abs(curr.v - yValue) < Math.abs(prev - yValue) ? curr.v : prev
  , Infinity);
  // need to make same calculations as plugin to match violin border
  // https://github.com/sgratzl/chartjs-chart-boxplot/blob/c247c6beca9925c4bb5c29aa8af4e306ff8faacc/src/elements/Violin.ts#L73
  const estimate = coords.find(c => c.v === closestValue)?.estimate || 1;
  const factor = width / 2 / maxEstimate;
  const xInitialPos = xValue - (estimate * factor);
  const xFinalPos = xValue + (estimate * factor);
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#333';
  ctx.beginPath();
  ctx.setLineDash(dashLinePattern);
  ctx.moveTo(xInitialPos, yValue);
  ctx.lineTo(xFinalPos, yValue);
  ctx.stroke();
  ctx.restore();
}
// only meant to be used with violin plots
export default {
  id: "quartile-lines",
  afterDatasetsDraw: (chart) => {
    const allViolinPlotsData  = chart.data.datasets
      .flatMap((_, index) => chart.getDatasetMeta(index))
      .filter(datasetMeta => !datasetMeta.hidden)
      .flatMap(datasetMeta => datasetMeta.data);

    allViolinPlotsData.forEach(plotData => {
      drawLine(chart.ctx, plotData, 'q1', [3, 3]);
      drawLine(chart.ctx, plotData, 'median',[8, 8]);
      drawLine(chart.ctx, plotData, 'q3', [3, 3]);
    });
  },
}