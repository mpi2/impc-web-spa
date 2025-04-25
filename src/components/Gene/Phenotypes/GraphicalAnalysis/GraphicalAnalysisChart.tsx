import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Cat, ChartLabels, systemColorMap } from "./shared";
import { scaleLinear } from "@visx/scale";
import { Group } from "@visx/group";
import { AreaClosed } from "@visx/shape";
import { GridColumns, GridRows } from "@visx/grid";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { withTooltip, Tooltip } from "@visx/tooltip";
import { WithTooltipProvidedProps } from "@visx/tooltip/lib/enhancers/withTooltip";
import { GlyphTriangle, GlyphDiamond, GlyphCircle } from "@visx/glyph";
import { curveMonotoneY } from "@visx/curve";
import { PatternLines } from "@visx/pattern";
import { Brush } from "@visx/brush";
import BaseBrush from "@visx/brush/lib/BaseBrush";
import { BrushHandleRenderProps } from "@visx/brush/lib/BrushHandle";
import { Bounds } from "@visx/brush/lib/types";
import { max, extent } from "@visx/vendor/d3-array";
import { useDebounceCallback } from "usehooks-ts";
import { groupBy } from "lodash";
import chroma from "chroma-js";
import { GeneStatisticalResult } from "@/models/gene";
import { LinearGradient } from "@visx/gradient";

const BrushHandle = ({ y, width, isBrushActive }: BrushHandleRenderProps) => {
  if (!isBrushActive) {
    return null;
  }

  return (
    <Group left={width / 2 + 7.5} top={y + 8}>
      <path
        fill="#f2f2f2"
        d="M -9 1 L 7 1 L 7 31 L -9 31 L -9 1 M -3 8 L -3 24 M 1 8 L 1 24"
        stroke="#999999"
        strokeWidth="1"
        style={{ cursor: "ns-resize", transform: "rotateZ(90deg)" }}
      />
    </Group>
  );
};

const TooltipContent = ({ statResult }: { statResult: any }) => {
  return (
    <div>
      <h3>{statResult.parameterName}</h3>
      <span>{statResult.topLevelPhenotypeList[0]}</span>
      <br />
      <span>
        {statResult.pValue === 0 && statResult.significant
          ? "Manual association"
          : `P-value: ${parseFloat(statResult.pValue).toExponential(3)}`}
      </span>
      <br />
      <span>
        <strong>Zygosity:</strong> {statResult.zygosity}
      </span>
      <br />
      <span>
        <strong>Procedure:</strong> {statResult.procedureName}
      </span>
      <br />
      {statResult.maleMutantCount && statResult.femaleMutantCount && (
        <>
          <span>
            <strong>Mutants:</strong> {statResult.maleMutantCount || 0} males &{" "}
            {statResult.femaleMutantCount || 0} females
          </span>
          <br />
        </>
      )}
      {statResult.effectSize && (
        <>
          <span>
            <strong>Effect size:</strong> {statResult.effectSize}
          </span>
          <br />
        </>
      )}
      <span>
        <strong>Metadata group:</strong> {statResult.metadataGroup}
      </span>
    </div>
  );
};

type Props = {
  data: Array<GeneStatisticalResult>;
  width: number;
  height: number;
  isByProcedure: boolean;
  category: Cat;
  significantOnly: boolean;
  procedureColorMap: ChartLabels;
};

type TooltipData = {
  statResult: GeneStatisticalResult;
};

let tooltipTimeout: number;
const selectedBrushStyle = {
  fill: `url(#brush_pattern)`,
  stroke: "#CCC",
};

const GraphicalAnalysisChart = withTooltip<Props, TooltipData>(
  (props: Props & WithTooltipProvidedProps<TooltipData>) => {
    const {
      data,
      width,
      height,
      isByProcedure,
      hideTooltip,
      showTooltip,
      tooltipOpen,
      tooltipData,
      tooltipTop,
      tooltipLeft,
      category,
      significantOnly,
      procedureColorMap,
    } = props;

    const [filteredData, setFilteredData] = useState(data);
    const yMax = height - 140;
    const brushHeight = yMax - 40;
    const svgRef = useRef<SVGSVGElement>(null);
    const brushRef = useRef<BaseBrush | null>(null);
    const xMax = useMemo(
      () =>
        data.reduce((acc, x) => (x.chartValue > acc ? x.chartValue : acc), 0),
      [data],
    );
    const brushMaxWidth = 0.1 * width;
    const yAxisWidth = 0.15 * width;
    const chartWidth = width - brushMaxWidth - yAxisWidth;

    useEffect(() => {
      setFilteredData(data);
      brushRef.current?.reset();
    }, [category, significantOnly]);

    const numOfTicks = useMemo(() => {
      if (filteredData.length <= 50) {
        return filteredData.length;
      }
      let divisor = 100;
      while (filteredData.length / divisor <= 20) divisor -= 1;
      return filteredData.length / divisor;
    }, [filteredData, category]);

    const xScale = useMemo(() => {
      // use whole data collection - avoid threshold line position changes
      const [minDomain, maxDomain] = extent(data, (d) => d.chartValue);
      // add 25% padding for space between most significant data and brush control
      const domain = [minDomain, maxDomain * 1.15];
      return scaleLinear<number>({
        range: [yAxisWidth, chartWidth],
        domain,
      });
    }, [chartWidth, data, category]);

    const brushXScale = useMemo(
      () =>
        scaleLinear<number>({
          range: [0, brushMaxWidth],
          domain: [0, xMax + 5],
        }),
      [width, xMax],
    );

    const yScale = useMemo(
      () =>
        scaleLinear<number>({
          range: [40, yMax],
          domain: extent(filteredData, (d) => d.arrPos),
        }),
      [height, filteredData, category],
    );

    const brushYScale = useMemo(
      () =>
        scaleLinear<number>({
          range: [0, brushHeight],
          domain: [0, max(data, (d) => d.arrPos) || 0],
        }),
      [height, data],
    );

    const initialBrushPosition = useMemo(
      () => ({
        start: { y: 0 },
        end: { y: brushHeight },
      }),
      [brushYScale, data, yMax],
    );

    const handleMouseMove = useCallback(
      (x, y, data) => {
        if (tooltipTimeout) clearTimeout(tooltipTimeout);
        if (!svgRef) return;
        showTooltip({
          tooltipLeft: x,
          tooltipTop: y,
          tooltipData: { statResult: data },
        });
      },
      [xScale, yScale, showTooltip],
    );

    const handleMouseLeave = useCallback(() => {
      tooltipTimeout = window.setTimeout(() => {
        hideTooltip();
      }, 300);
    }, [hideTooltip]);

    const onBrushChanges = (domain: Bounds | null) => {
      if (!domain) return;
      const { y0, y1 } = domain;
      const newFilteredData = data.filter(
        (d) => d.arrPos > y0 && d.arrPos < y1,
      );
      setFilteredData(newFilteredData);
    };

    const onBrushDebounced = useDebounceCallback(onBrushChanges, 1);

    const chartData = groupBy(
      filteredData,
      isByProcedure ? "procedureName" : "topLevelPhenotypeList[0]",
    );

    if (!data || height === 0) {
      return null;
    }

    return (
      <div>
        <svg width={width} height={height} ref={svgRef}>
          <GridColumns
            scale={xScale}
            width={width}
            top={40}
            height={yMax}
            stroke="#e0e0e0"
          />
          <GridRows
            scale={yScale}
            width={chartWidth - yAxisWidth + 10}
            left={yAxisWidth - 10}
            numTicks={numOfTicks}
            stroke="#e0e0e0"
          />
          <line
            x1={xScale(4)}
            x2={xScale(4)}
            y1={40}
            y2={yMax}
            stroke="#000"
            strokeWidth={2}
            strokeDasharray="5 4"
          />
          {Object.entries(chartData).map(([item, points]) => {
            const chartLabel = isByProcedure
              ? procedureColorMap[item]
              : systemColorMap[item];
            const GlyphIcon =
              !isByProcedure || chartLabel.shape === "circle"
                ? GlyphCircle
                : GlyphDiamond;
            const isMatchingTooltip = isByProcedure
              ? tooltipData?.statResult.procedureName === item
              : tooltipData?.statResult.topLevelPhenotypeList.includes(item);
            const fillColor =
              !tooltipData || isMatchingTooltip
                ? chartLabel.color
                : chroma(chartLabel.color).alpha(0.1);
            return (
              <Group fill={fillColor}>
                {points.map((x, i) => {
                  const sharedProps = {
                    key: i,
                    onMouseMove: () =>
                      handleMouseMove(
                        xScale(x.chartValue),
                        yScale(x.arrPos),
                        x,
                      ),
                    onMouseLeave: handleMouseLeave,
                    onTouchMove: () =>
                      handleMouseMove(
                        xScale(x.chartValue),
                        yScale(x.arrPos),
                        x,
                      ),
                    onTouchEnd: handleMouseLeave,
                  };
                  // always display manual associations as triangles
                  if (x.pValue === 0 && x.significant) {
                    return (
                      <GlyphTriangle
                        left={xScale(x.chartValue)}
                        top={yScale(x.arrPos)}
                        size={110}
                        fill={
                          !tooltipData || isMatchingTooltip
                            ? "#FFF"
                            : "rgba(255, 255, 255, 0.1)"
                        }
                        stroke={fillColor}
                        strokeWidth={3}
                        {...sharedProps}
                      />
                    );
                  }
                  return (
                    <GlyphIcon
                      left={xScale(x.chartValue)}
                      top={yScale(x.arrPos)}
                      size={80}
                      {...sharedProps}
                    />
                  );
                })}
              </Group>
            );
          })}
          <Group left={chartWidth} top={40}>
            <Group top={0}>
              <LinearGradient
                id="brushGradient"
                from="#000"
                to="#000"
                vertical={false}
              />
              <AreaClosed
                data={data}
                height={brushHeight}
                x={(d) => brushXScale(d.chartValue) || 0}
                y={(d) => brushYScale(d.arrPos) || 0}
                yScale={brushYScale}
                strokeWidth={1}
                stroke="url(#brushGradient)"
                fill="url(#brushGradient)"
                curve={curveMonotoneY}
              />
            </Group>
            <PatternLines
              id="brush_pattern"
              height={8}
              width={8}
              stroke="#AAA"
              strokeWidth={1}
              orientation={["diagonal"]}
            />
            <Brush
              xScale={brushXScale}
              yScale={brushYScale}
              width={brushMaxWidth}
              height={brushHeight}
              handleSize={16}
              innerRef={brushRef}
              resizeTriggerAreas={["top", "bottom"]}
              brushDirection="vertical"
              selectedBoxStyle={selectedBrushStyle}
              onChange={onBrushDebounced}
              onClick={() => setFilteredData(data)}
              initialBrushPosition={initialBrushPosition}
              useWindowMoveEvents
              renderBrushHandle={(props) => <BrushHandle {...props} />}
            />
          </Group>
          <AxisLeft
            scale={yScale}
            top={0}
            left={yAxisWidth - 10}
            numTicks={numOfTicks}
            tickFormat={(value) =>
              filteredData.find((d) => d.arrPos === value)?.parameterName
            }
          />
          <AxisBottom
            top={yMax}
            scale={xScale}
            numTicks={10}
            label="log₁₀(P-value)"
          />
        </svg>
        {tooltipOpen && tooltipData && (
          <Tooltip left={tooltipLeft} top={tooltipTop}>
            <TooltipContent statResult={tooltipData.statResult} />
          </Tooltip>
        )}
      </div>
    );
  },
);

export default GraphicalAnalysisChart;
