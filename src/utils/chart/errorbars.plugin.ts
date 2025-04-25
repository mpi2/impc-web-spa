
export default {
  id: 'errorbars',
  afterDatasetsDraw: (chart, _, opts) => {
    const getBarchartBaseCoords = (chart) => {
      return chart.data.datasets.filter((_, i) => {
        const dsMeta = chart.getDatasetMeta(i);
        return !dsMeta.hidden;
      }).flatMap((d, i) => {
        const dsMeta = chart.getDatasetMeta(i);
        const values = d.data;
        return dsMeta.data.map((b, i) => {
          return {
            value: values[i]?.y,
            x: b.x,
            yMin: values[i]?.yMin,
            yMax: values[i]?.yMax,
            backgroundColor: d.backgroundColor,
          };
        }).filter(c => !!c.value);
      });
    };
    const drawErrorBar = (ctx, point, maxValuePixel, minValuePixel) => {
      const barWidth = 10;
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = point.backgroundColor;
      ctx.beginPath();

      ctx.moveTo(point.x - barWidth / 2, maxValuePixel);
      ctx.lineTo(point.x + barWidth / 2, maxValuePixel);
      ctx.moveTo(point.x, maxValuePixel);
      ctx.lineTo(point.x, minValuePixel);
      ctx.moveTo(point.x - barWidth / 2, minValuePixel);
      ctx.lineTo(point.x + barWidth / 2, minValuePixel);

      ctx.stroke();
      ctx.restore();
    };
    const { ctx } = chart;
    const barchartCoords = getBarchartBaseCoords(chart);
    const scale = chart.scales.y;
    barchartCoords.forEach(point => {
      const maxValuePixel = scale.getPixelForValue(point.yMax);
      const minValuePixel = scale.getPixelForValue(point.yMin);
      drawErrorBar(ctx, point, maxValuePixel, minValuePixel);
    })
  },
}