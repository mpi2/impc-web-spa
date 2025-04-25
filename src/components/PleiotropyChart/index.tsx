"use client";

import { useCallback, useMemo, useState, MouseEvent, TouchEvent } from "react";
import { maybe } from "acd-utils";
import { extent } from "d3-array";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Circle } from "@visx/shape";
import { useTooltip } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { voronoi } from "@visx/voronoi";
import { Text } from "@visx/text";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";

import { PleiotropyData } from "@/models";
import { LoadingProgressBar } from "@/components";
import { getDimensions, yAccessor, xAccessor } from "./utils";
import Tooltip, { TooltipData } from "./tooltip";
import { useRerender } from "@/hooks";

interface Props {
  title: string;
  data: Array<PleiotropyData>;
  isLoading: boolean;
  phenotypeName: string;
  width: number;
  height: number;
}
const PleiotropyChart = ({
  title,
  data = [],
  phenotypeName,
  width: parentWidth,
  height: parentHeight,
  isLoading,
}: Props) => {
  const width = parentWidth * 0.8;
  const height = parentHeight;

  useRerender([width, height]);

  const {
    showTooltip,
    hideTooltip,
    tooltipOpen,
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
  } = useTooltip<TooltipData>({
    tooltipOpen: false,
    tooltipLeft: 0,
    tooltipTop: 0,
    tooltipData: {},
  });

  const { margin, boundedWidth, boundedHeight } = getDimensions({
    width,
    height,
  });

  const [activeEntry, setActiveEntry] = useState<PleiotropyData>();

  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [0, boundedWidth],
        domain: extent(data, xAccessor) as [number, number],
        nice: true,
      }),
    [boundedWidth, data]
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [boundedHeight, 0],
        domain: extent(data, yAccessor) as [number, number],
        nice: true,
      }),
    [boundedHeight, data]
  );

  const voronoiLayout = useMemo(() => {
    return voronoi<PleiotropyData>({
      x: (d) => xScale(xAccessor(d)),
      y: (d) => yScale(yAccessor(d)),
      width: boundedWidth,
      height: boundedHeight,
    })(data);
  }, [boundedWidth, boundedHeight, xScale, yScale, data]);

  const voronoiPolygons = useMemo(
    () => voronoiLayout.polygons(),
    [voronoiLayout]
  );

  const handleMouseMove = useCallback(
    (e: TouchEvent<SVGSVGElement> | MouseEvent<SVGSVGElement>) => {
      const point = localPoint(e);
      if (!point) return hideTooltip();

      const { x, y } = point;
      const neighborRadius = 100;
      const closest = voronoiLayout.find(
        x - margin.left,
        y - margin.top,
        neighborRadius
      );

      if (!closest) return;

      maybe(
        data.find((d) => d.marker_symbol === closest.data.marker_symbol)
      ).map(setActiveEntry);

      showTooltip({
        tooltipLeft: xScale(xAccessor(closest.data)) + margin.left,
        tooltipTop: yScale(yAccessor(closest.data)) + margin.top,
        tooltipData: {
          markerSymbol: closest.data.marker_symbol,
          phenotypeCount: closest.data.phenotypeCount,
          otherPhenotypeCount: closest.data.otherPhenotypeCount,
          phenotypeName,
        },
      });
    },
    [xScale, yScale, voronoiLayout, voronoiPolygons]
  );

  const dots = useMemo(
    () =>
      data.map((d) => (
        <Circle
          key={d.marker_symbol}
          fill="rgba(239, 123, 11,0.7)"
          cx={xScale(xAccessor(d))}
          cy={yScale(yAccessor(d))}
          r={5}
        />
      )),
    [xScale, yScale, data]
  );

  const activeDot = activeEntry && (
    <Circle
      key={`active-${activeEntry.marker_symbol}`}
      cx={xScale(xAccessor(activeEntry))}
      cy={yScale(yAccessor(activeEntry))}
      r={5}
      fill="rgb(0,0,0)"
    />
  );

  const axisLeftLabel = (
    <Text
      textAnchor="middle"
      verticalAnchor="end"
      angle={-90}
      style={{ fontSize: "12px" }}
      y={boundedHeight / 2}
      x={0}
      dx={-50}
    >
      Number of phenotype associations
    </Text>
  );

  const axisBottomLabel = (
    <Text
      style={{ fontSize: "12px" }}
      textAnchor="middle"
      verticalAnchor="start"
      y={boundedHeight}
      x={boundedWidth / 2}
      dy={30}
    >
      Number of associations to other phenotypes
    </Text>
  );

  if (!data || isLoading) {
    return (
      <div
        className="mt-4"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <LoadingProgressBar />
      </div>
    );
  }
  return (
    <div style={{ position: "relative" }}>
      <svg
        role="figure"
        width={width}
        height={height}
        onTouchStart={handleMouseMove}
        onTouchMove={handleMouseMove}
        onMouseMove={handleMouseMove}
      >
        <Group top={margin.top} left={margin.left}>
          <AxisLeft
            scale={yScale}
            top={0}
            tickLabelProps={() => ({
              fill: "#1c1917",
              fontSize: 10,
              textAnchor: "end",
              verticalAnchor: "middle",
              x: -10,
            })}
          />
          {axisLeftLabel}
          <AxisBottom
            top={boundedHeight}
            scale={xScale}
            tickLabelProps={() => ({
              fill: "#1c1917",
              fontSize: 11,
              textAnchor: "middle",
            })}
          />
          {axisBottomLabel}
          {dots}
          {activeDot}
        </Group>
      </svg>
      <Tooltip
        isTooltipOpen={tooltipOpen}
        left={tooltipLeft}
        top={tooltipTop}
        data={tooltipData}
        phenotypeName={phenotypeName}
      />
    </div>
  );
};

export default PleiotropyChart;
