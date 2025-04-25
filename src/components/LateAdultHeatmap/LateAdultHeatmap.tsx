"use client";
import {
  CSSProperties,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { scaleQuantize, scaleBand } from "@visx/scale";
import { LateAdultDataParsed, LateAdultRowResponse } from "@/models";
import { Group } from "@visx/group";
import { HeatmapRect } from "@visx/heatmap";
import { AxisLeft, AxisTop } from "@visx/axis";
import { Text } from "@visx/text";
import { ScaleBand, ScaleQuantize } from "d3-scale";
import { clamp, truncate } from "lodash";
import classNames from "classnames";
import { useRouter } from "next/navigation";

const binHeight = 25;
const scalePadding = 0.05;

type CellData = {
  x: number;
  y: number;
  geneSymbol: string;
  procedureName: string;
};

type HeatMapProps = {
  data: LateAdultDataParsed;
  xScale: ScaleBand<number>;
  yScale: ScaleBand<number>;
  colorScale: ScaleQuantize<string, never>;
  binWidth: number;
  allGenesList: Array<LateAdultRowResponse>;
  setSelectedCell: (data: CellData) => void;
  numOfCols: number;
  onClickCell: (mgiGeneAccessionId: string, columnName: string) => void;
};

const HeatMap = memo((props: HeatMapProps) => {
  const {
    data,
    xScale,
    yScale,
    colorScale,
    binWidth,
    allGenesList,
    numOfCols,
    setSelectedCell,
    onClickCell,
  } = props;
  return (
    <HeatmapRect
      data={data.data}
      xScale={(d) => xScale(d) ?? 0}
      yScale={(d) => yScale(d) ?? 0}
      colorScale={colorScale}
      binWidth={binWidth}
      binHeight={binHeight}
    >
      {(heatmap) =>
        heatmap.map((heatmapBins) =>
          heatmapBins.map((bin) => (
            <rect
              key={`heatmap-rect-${bin.row}-${bin.column}`}
              className={classNames("visx-heatmap-rect", {
                hasData: bin.count > 0,
              })}
              width={xScale.bandwidth()}
              height={yScale.bandwidth()}
              x={bin.x}
              y={bin.y}
              fill={bin.color}
              onMouseOver={() => {
                setSelectedCell({
                  x: bin.x,
                  y: bin.y,
                  geneSymbol: allGenesList[bin.row].markerSymbol,
                  procedureName: data.columns[bin.column],
                });
              }}
              onMouseLeave={() => {
                if (
                  bin.column === 0 ||
                  bin.column === numOfCols - 1 ||
                  bin.row === 0 ||
                  bin.row === allGenesList.length - 1
                ) {
                  setSelectedCell(undefined);
                }
              }}
              onClick={() =>
                onClickCell(
                  allGenesList[bin.row].mgiGeneAccessionId,
                  bin.datum.column,
                )
              }
            />
          )),
        )
      }
    </HeatmapRect>
  );
});

type Props = {
  width: number;
  data: LateAdultDataParsed;
  genesList: Array<LateAdultRowResponse>;
  selectedParam: string;
  onParamSelected: (param: string) => void;
  isFetchingParamData: boolean;
};

const LateAdultHeatmap = (props: Props) => {
  const {
    width,
    data,
    genesList,
    selectedParam,
    onParamSelected,
    isFetchingParamData,
  } = props;

  const router = useRouter();
  const numOfCols = data.columns.length;
  const binWidth = width / numOfCols;
  const maxWidth = width - 50;
  const [heatmapHeight, setHeatmapHeight] = useState<number>(undefined);
  const [selectedCell, setSelectedCell] = useState<CellData>(undefined);

  useEffect(() => {
    if (genesList) {
      const maxHeigth = genesList.length * binHeight + 170;
      if (heatmapHeight !== maxHeigth) {
        setHeatmapHeight(maxHeigth);
      }
    }
  }, [genesList.length, heatmapHeight]);

  const xScale = useMemo(
    () =>
      scaleBand<number>({
        domain: data.columns.map((_, index) => index),
        range: [50, maxWidth],
        round: true,
        paddingInner: scalePadding,
      }),
    [data, maxWidth, isFetchingParamData],
  );

  const yScale = useMemo(
    () =>
      scaleBand<number>({
        domain: genesList.map((_, index) => index),
        range: [100, heatmapHeight],
        paddingInner: scalePadding,
      }),
    [genesList, heatmapHeight, isFetchingParamData],
  );

  const colorScale = useMemo(
    () =>
      scaleQuantize({
        domain: [0, 2],
        range: ["#dedede8f", "#15a2b88f", "#ed7b25c4"],
      }),
    [],
  );

  const isSelectedGene = (geneSymbol: string) =>
    !!selectedCell && selectedCell.geneSymbol === geneSymbol;
  const isSelectedParam = (parameterName: string) =>
    !!selectedCell && selectedCell.procedureName === parameterName;

  const hasData = useMemo(
    () => data.data.some((col) => col.bins.length !== 0),
    [data],
  );

  const onClickCell = useCallback(
    (mgiGeneAccessionId: string, columnName: string) => {
      let url = `/genes/${mgiGeneAccessionId}?dataLifeStage=Late adult`;
      // if selectedParam is null, column name will contain a procedureName
      // when a user clicks a param, columnName will contain a parameterName
      if (!selectedParam) {
        url += `&dataSearch=${columnName}`;
      } else {
        url += `&dataSearch=${selectedParam}&dataQuery=${columnName}`;
      }
      url += "#data";
      router.push(url);
    },
    [router, selectedParam],
  );

  return (
    <svg
      width={width}
      height={heatmapHeight + 100}
      onMouseLeave={() => setSelectedCell(undefined)}
      data-testid="late-adult-heatmap"
    >
      <Text
        className={classNames({ "axis-link": !!selectedParam })}
        x={width / 2}
        y={20}
        style={{ textAnchor: "middle", fontSize: "1.3em", fontWeight: "700" }}
        onClick={() => {
          if (!!selectedParam) onParamSelected(undefined);
        }}
      >
        {!!selectedParam
          ? `← Genes vs ${selectedParam} parameters`
          : `Genes vs Procedures`}
      </Text>
      <Group top={100} left={50}>
        {!hasData && !isFetchingParamData && (
          <Text x={width / 2} y="120" style={{ textAnchor: "middle" }}>
            No genes match the inserted text
          </Text>
        )}
        {isFetchingParamData ? (
          <svg
            x={width / 2}
            y={heatmapHeight / 2}
            width="100"
            height="100"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z">
              <animateTransform
                attributeName="transform"
                type="rotate"
                dur="0.75s"
                values="0 12 12;360 12 12"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        ) : (
          <HeatMap
            data={data}
            allGenesList={genesList}
            xScale={xScale}
            yScale={yScale}
            colorScale={colorScale}
            binWidth={binWidth}
            numOfCols={numOfCols}
            setSelectedCell={setSelectedCell}
            onClickCell={onClickCell}
          />
        )}
        {!!selectedCell && (
          <>
            <rect
              style={{ fill: "rgba(0, 0, 0, 0.2)", pointerEvents: "none" }}
              x={xScale(0)}
              y={selectedCell.y}
              height={yScale.bandwidth()}
              width={clamp(
                selectedCell.x -
                  xScale(0) -
                  xScale.padding() * xScale.bandwidth(),
                0,
                maxWidth,
              )}
            />
            <rect
              style={{ fill: "rgba(0, 0, 0, 0.2)", pointerEvents: "none" }}
              y={100}
              x={selectedCell.x}
              width={xScale.bandwidth()}
              height={clamp(
                selectedCell.y - 100 - yScale.padding() * yScale.bandwidth(),
                0,
                heatmapHeight,
              )}
            />
            <rect
              style={{ fill: "rgba(0, 0, 0, 0.2)", pointerEvents: "none" }}
              x={
                selectedCell.x +
                xScale.bandwidth() +
                xScale.padding() * xScale.bandwidth()
              }
              y={selectedCell.y}
              height={yScale.bandwidth()}
              width={clamp(
                xScale(numOfCols - 1) -
                  selectedCell.x -
                  xScale.padding() * xScale.bandwidth(),
                0,
                maxWidth,
              )}
            />
          </>
        )}
      </Group>
      {hasData && (
        <AxisTop
          scale={xScale}
          top={190}
          left={48}
          tickFormat={(value) => data.columns[value as number]}
          tickValues={data.columns.map((col, index) => index)}
          tickComponent={({ formattedValue, ...rest }) => {
            const matchesParam = isSelectedParam(formattedValue);
            const style: CSSProperties = matchesParam
              ? { fontWeight: "bold" }
              : { fontWeight: "normal" };
            return (
              <text
                className={classNames({ "axis-link": !selectedParam })}
                style={style}
                {...rest}
                transform={`rotate(-50, ${rest.x}, 0)`}
                textAnchor="start"
                alignmentBaseline="middle"
                onClick={() => {
                  if (!selectedParam) onParamSelected(formattedValue);
                }}
              >
                <title>{formattedValue}</title>
                {truncate(formattedValue, { length: 25 })}
              </text>
            );
          }}
        />
      )}
      {hasData && (
        <AxisLeft
          scale={yScale}
          top={100}
          left={90}
          numTicks={genesList.length}
          tickFormat={(value) =>
            genesList[value as number]?.markerSymbol || "-"
          }
          tickComponent={({ formattedValue, ...rest }) => {
            const matchesGene = isSelectedGene(formattedValue);
            const style: CSSProperties = matchesGene
              ? { fontWeight: "bold", fontSize: "12px", fontStyle: "italic" }
              : { fontWeight: "normal", fontSize: "10px", fontStyle: "italic" };
            return (
              <Text style={style} {...rest}>
                {formattedValue}
              </Text>
            );
          }}
        />
      )}
    </svg>
  );
};

export default LateAdultHeatmap;
