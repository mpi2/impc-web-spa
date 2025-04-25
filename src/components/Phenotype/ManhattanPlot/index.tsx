import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Scatter } from "react-chartjs-2";
import { chartColors } from "@/utils/chart";
import { useQuery } from "@tanstack/react-query";
import { fetchMHPlotDataFromS3 } from "@/api-service";
import { useEffect, useMemo, useRef, useState } from "react";
import { isEqual } from "lodash";
import styles from "./styles.module.scss";
import LoadingProgressBar from "@/components/LoadingProgressBar";
import Form from "react-bootstrap/Form";
import { PhenotypeStatsResults } from "@/models/phenotype";
import { formatPValue } from "@/utils";
import Link from "next/link";
import { Alert } from "react-bootstrap";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

type ChromosomeDataPoint = {
  chrName: string;
  markerSymbol: string;
  mgiGeneAccessionId: string;
  reportedPValue: number;
  seqRegionStart: number;
  seqRegionEnd: number;
  significant: boolean;
  // fields created by FE
  pos?: number;
};

type ChartChromosome = {
  x: number;
  y: number;
  geneSymbol: string;
  pValue: number;
  mgiGeneAccessionId: string;
  chromosome: string;
  significant: boolean;
};

type TooltipData = {
  chromosome: string;
  genes: Array<ChartChromosome>;
};

type Point = { x: number; y: number; geneList: string };

const clone = (obj) => JSON.parse(JSON.stringify(obj));

const transformPValue = (value: number, significant: boolean) => {
  if (value === 0 && significant) {
    // put a high value to show they are really significant
    return 30;
  }
  return -Math.log10(value);
};
const ManhattanPlot = ({ phenotypeId }) => {
  let ghostPoint: Point = { x: -1, y: -1, geneList: "" };
  const chartRef = useRef(null);
  const [clickTooltip, setClickTooltip] = useState<TooltipData>({
    chromosome: "",
    genes: [],
  });
  const [point, setPoint] = useState<Point>({ x: -1, y: -1, geneList: "" });
  const [geneFilter, setGeneFilter] = useState("");

  const ticks: Array<{ value: number; label: string }> = [];
  let originalTicks = [];
  const validChromosomes = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "X",
  ];

  const getChromosome = (tooltip) => {
    if (tooltip.chromosome === "20") {
      return "X";
    } else if (tooltip.chromosome === "21") {
      return "Y";
    }
    return tooltip.chromosome;
  };

  const getTooltipContent = (gene) => {
    if (gene.significant && gene.pValue === 0) {
      return <span>Manually annotated as significant</span>;
    }
    return (
      <span>P-value: {!!gene.pValue ? formatPValue(gene.pValue) : "-"}</span>
    );
  };

  const associationMatchesFilter = (rawDataPoint) => {
    if (geneFilter.includes(",")) {
      const filterValues = geneFilter.split(",").map((value) => value.trim());
      return filterValues.some(
        (value) =>
          rawDataPoint.geneSymbol?.toLowerCase() === value.toLowerCase() ||
          rawDataPoint?.mgiGeneAccessionId === value,
      );
    }
    return (
      rawDataPoint.geneSymbol?.toLowerCase() === geneFilter.toLowerCase() ||
      rawDataPoint?.mgiGeneAccessionId === geneFilter
    );
  };

  const areTheSamePoint = (p1: Point, p2: Point, ignoreGeneList = false) => {
    const limit = 8;
    const xDelta = Math.abs(p1.x - p2.x);
    const yDelta = Math.abs(p1.y - p2.y);
    if (ignoreGeneList) {
      return xDelta <= limit && yDelta <= limit;
    }
    return (
      xDelta <= limit && yDelta <= limit && p1.geneList.includes(p2.geneList)
    );
  };

  const generatePointFromCtx = (ctx) => ({
    x: ctx.element.x,
    y: ctx.element.y,
    geneList: ctx.parsed.geneSymbol,
  });

  const getThresholdXPos = (
    chr: string,
    datapoints: Array<ChromosomeDataPoint>,
  ): number => {
    switch (chr) {
      case "1":
        return 0;
      case "X":
        return datapoints[datapoints.length - 1].pos;
      default:
        return datapoints[Math.floor(datapoints.length / 2)].pos;
    }
  };

  const options = useMemo(
    () => ({
      responsive: true,
      animation: false,
      maintainAspectRatio: false,
      scales: {
        x: {
          display: true,
          max: 0,
          ticks: { autoSkip: false },
          grid: { display: false },
          title: { display: true, text: "chromosome" },
          afterBuildTicks: (axis) => {
            if (ticks.length) {
              axis.ticks = ticks;
            }
          },
          afterTickToLabelConversion: (axis) => {
            if (ticks.length) {
              axis.ticks.forEach((tick) => {
                let label = originalTicks.find(
                  (t) => t.value === tick.value,
                ).label;
                if (label === "20") {
                  label = "X";
                } else if (label === "21") {
                  label = "Y";
                }
                tick.label = label;
              });
            }
          },
        },
        y: {
          title: { display: true, text: "-log₁₀(P-value)" },
          min: 0,
          max: 45,
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: false,
          mode: "point",
          external: (context) => {},
        },
      },
      elements: {
        point: {
          radius: (ctx) => {
            if (!!geneFilter && associationMatchesFilter(ctx.raw)) {
              return 10;
            }
            if (areTheSamePoint(point, generatePointFromCtx(ctx))) {
              return 9;
            }
            return 3;
          },
          hoverRadius: (ctx) => {
            if (!!geneFilter && associationMatchesFilter(ctx.raw)) {
              return 10;
            }
            if (areTheSamePoint(point, generatePointFromCtx(ctx))) {
              return 9;
            }
            return 3;
          },
          pointBackgroundColor: (ctx) => {
            const shouldBeHighlighted =
              !!geneFilter && associationMatchesFilter(ctx.raw);
            const currentPoint = generatePointFromCtx(ctx);
            if (shouldBeHighlighted) {
              // double check to avoid multiple calls to setState with same state
              if (
                !areTheSamePoint(point, currentPoint) &&
                !areTheSamePoint(currentPoint, ghostPoint, true)
              ) {
                // Side effect to set point based on search
                setPoint(currentPoint);
                ghostPoint = { ...currentPoint };
              }
              return "#F7DC4A";
            }
            if (areTheSamePoint(point, currentPoint)) {
              return "#00b0b0";
            }
            if (!ctx.raw.pValue) {
              return `rgba(0, 159, 129, ${matchesAnotherGene ? "0.1" : "0.4"})`;
            }
            return ctx.raw.y >= 4
              ? `rgba(26, 133, 255, ${matchesAnotherGene ? "0.1" : "0.4"})`
              : `rgba(212, 17, 89, ${matchesAnotherGene ? "0.1" : "0.3"})`;
          },
        },
      },
      onHover: (e, elements) =>
        !!elements.length
          ? (e.native.target.style.cursor = "pointer")
          : (e.native.target.style.cursor = "auto"),
      onClick: (e, elements) => {
        if (!!elements.length && !areTheSamePoint(point, e, true)) {
          const geneList = elements
            .map((e) => e.element.$context.parsed?.geneSymbol || null)
            .sort()
            .join("|");
          setPoint({ x: e.x, y: e.y, geneList });
        }
        if (elements.length) {
          const newTooltipData = {
            chromosome: elements[0]?.element["$context"].raw.chromosome,
            genes: elements
              .map((point) => point.element["$context"].raw)
              .map((rawData) => {
                return {
                  geneSymbol: rawData.geneSymbol,
                  mgiGeneAccessionId: rawData.mgiGeneAccessionId,
                  pValue: rawData.pValue,
                  significant: rawData.significant,
                };
              }),
          };
          if (!isEqual(clickTooltip, newTooltipData)) {
            setClickTooltip(newTooltipData);
          }
        } else if (
          !areTheSamePoint(point, { x: -1, y: -1, geneList: "" }, true)
        ) {
          setPoint({ x: -1, y: -1, geneList: "" });
          setClickTooltip({ chromosome: "", genes: [] });
        }
      },
    }),
    [geneFilter, point, ticks],
  );

  const { data, isFetching, isError } = useQuery({
    queryKey: ["phenotype", phenotypeId, "mh-plot-data"],
    queryFn: () => fetchMHPlotDataFromS3(phenotypeId),
    enabled: !!phenotypeId,
    select: (response: PhenotypeStatsResults) => {
      const data = response.results;
      const genes = new Set<string>();
      const mgiAccessionIds = new Set<string>();
      // use a object to store points and access it by chromosome and then mgiAccessionId
      // to avoid duplication of data, select point with lowest pValue
      const groupedByChr: Record<string, Map<string, ChromosomeDataPoint>> = {};
      data.forEach((point) => {
        const chromosome = point.chrName;
        const isAValidChromosome = validChromosomes.includes(chromosome);
        if (chromosome && !groupedByChr[chromosome] && isAValidChromosome) {
          groupedByChr[chromosome] = new Map();
        }
        if (chromosome && isAValidChromosome) {
          genes.add(point.markerSymbol);
          mgiAccessionIds.add(point.mgiGeneAccessionId);
          const choromosomeGeneMap = groupedByChr[chromosome];
          if (choromosomeGeneMap.has(point.mgiGeneAccessionId)) {
            const existingPoint = choromosomeGeneMap.get(
              point.mgiGeneAccessionId,
            );
            // check if current point has a different value than null, comparison it's going to be always true with null
            if (
              point.reportedPValue !== null &&
              point.reportedPValue < existingPoint.reportedPValue
            ) {
              choromosomeGeneMap.set(existingPoint.mgiGeneAccessionId, point);
            }
          } else {
            choromosomeGeneMap.set(point.mgiGeneAccessionId, point);
          }
        }
      });
      let basePoint = 0;
      // create another object with arrays, to generate the position for each point and being
      // able to sort them
      const listOfGenesByChromosome: Record<
        string,
        Array<ChromosomeDataPoint>
      > = {};
      Object.keys(groupedByChr).forEach((chr) => {
        let arrayOfPoints = Array.from(groupedByChr[chr].values());
        arrayOfPoints = arrayOfPoints.map((value) => ({
          ...value,
          pos: value.seqRegionStart + basePoint,
        }));
        arrayOfPoints.sort((g1, g2) => {
          const { seqRegionStart: seqRS1 } = g1;
          const { seqRegionStart: seqRS2 } = g2;
          return seqRS1 - seqRS2;
        });
        const maxPoint = arrayOfPoints.slice(-1)[0];
        const minPoint = arrayOfPoints[0];
        basePoint = maxPoint.pos;
        ticks.push({
          value: (maxPoint.pos + minPoint.pos) / 2 + 1,
          label: chr,
        });
        listOfGenesByChromosome[chr] = arrayOfPoints;
      });
      originalTicks = clone(ticks);
      options.scales.x.max = basePoint;
      const result = {
        datasets: Object.keys(listOfGenesByChromosome).map((chr, i) => ({
          label: chr,
          data: Array.from(listOfGenesByChromosome[chr].values()).map(
            ({
              pos,
              reportedPValue,
              markerSymbol,
              mgiGeneAccessionId,
              significant,
            }) => ({
              x: pos,
              y: transformPValue(reportedPValue, significant),
              geneSymbol: markerSymbol,
              pValue: reportedPValue,
              mgiGeneAccessionId,
              chromosome: chr,
              significant,
            }),
          ),
          backgroundColor: chartColors[i],
          parsing: false,
        })),
      };
      result.datasets.push({
        label: "P-value threshold",
        type: "line" as const,
        data: Object.keys(listOfGenesByChromosome).map((chr) => ({
          x: getThresholdXPos(chr, listOfGenesByChromosome[chr]),
          y: 4,
        })),
        borderColor: "black",
        pointStyle: "rect",
        borderDash: [5, 5],
        radius: 0,
      } as any);
      return {
        chartData: result,
        listOfGenes: [...genes],
        listOfAccessions: [...mgiAccessionIds],
      };
    },
    retry: 1,
  });

  const matchesAnotherGene = useMemo(() => {
    if (!!geneFilter) {
      return false;
    }
    if (geneFilter.includes(",")) {
      const filterValues = geneFilter.split(",").map((value) => value.trim());
      return (
        data?.listOfGenes?.some((geneSymbol) =>
          filterValues.includes(geneSymbol),
        ) || data?.listOfAccessions?.some((id) => filterValues.includes(id))
      );
    }
    return (
      data?.listOfGenes?.includes(geneFilter) ||
      data?.listOfAccessions?.includes(geneFilter)
    );
  }, [geneFilter, data]);

  useEffect(() => {
    if (!!geneFilter) {
      const allData =
        data?.chartData.datasets.flatMap((dataset) => dataset.data) ?? [];
      const filteredGenes = allData.filter(associationMatchesFilter) || [];
      if (filteredGenes.length) {
        const newTooltipData = {
          chromosome: filteredGenes.map((g) => g.chromosome).join(","),
          genes: filteredGenes,
        };
        if (!isEqual(clickTooltip, newTooltipData)) {
          setClickTooltip(newTooltipData);
        }
      } else {
        if (clickTooltip.genes.length !== 0) {
          setClickTooltip({ chromosome: "", genes: [] });
        }
      }
    }
  }, [geneFilter, data, clickTooltip, point]);

  if (isError) {
    return (
      <div>
        <Alert variant="primary">
          Associations data not available for this phenotype
        </Alert>
      </div>
    );
  }

  return (
    <div className={styles.mainWrapper}>
      <div className="chart">
        <div className={styles.labelsWrapper}>
          <div style={{ fontSize: "90%" }}>
            <i
              className="fa fa-circle"
              style={{ color: "rgb(212, 17, 89)" }}
            ></i>
            &nbsp;&nbsp;Not significant
            <i
              className="fa fa-circle"
              style={{ color: "rgb(26, 133, 255)", marginLeft: "1rem" }}
            ></i>
            &nbsp;&nbsp;Significant
            <i
              className="fa fa-circle"
              style={{ color: "rgb(0, 159, 129)", marginLeft: "1rem" }}
            ></i>
            &nbsp;&nbsp;Manual associations
            <div style={{ display: "inline-block" }}>
              <hr
                style={{
                  border: "none",
                  borderTop: "3px dashed #000",
                  height: "3px",
                  width: "50px",
                  display: "inline-block",
                  margin: "0 0 0 0.5rem",
                  opacity: 1,
                }}
              />
              &nbsp;&nbsp;Significant P-value threshold (P &lt; 0.0001)
            </div>
          </div>
          <div
            style={{
              display: "flex",
              whiteSpace: "nowrap",
              alignItems: "center",
            }}
          >
            <label
              className="grey"
              htmlFor="geneHighlight"
              style={{ marginRight: "0.5rem" }}
            >
              Find gene:
            </label>
            <Form.Control
              id="geneHighlight"
              type="text"
              value={geneFilter}
              onChange={(e) => setGeneFilter(e.target.value)}
            />
          </div>
        </div>
        <i className="grey" style={{ padding: "0 2rem" }}>
          Associations appearing in the region of 1x10<sup>-30</sup> are
          manually annotated as significant.
        </i>
        {isFetching ? (
          <div
            className="mt-4"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <LoadingProgressBar />
          </div>
        ) : (
          !!data && (
            <div className={styles.chartWrapper}>
              <Scatter
                id="manhattan-plot"
                ref={chartRef}
                aria-label="Manhattan Plot"
                options={options as any}
                data={data.chartData as any}
              />
            </div>
          )
        )}
      </div>
      <div className={styles.resultsSection}>
        <h3>Associations details of selected gene(s):</h3>
        {!!clickTooltip.genes.length && (
          <>
            <span>
              <strong>Chromosome: </strong>
              {getChromosome(clickTooltip)}
            </span>
            <ul>
              {clickTooltip.genes.map((gene) => (
                <li key={gene.mgiGeneAccessionId}>
                  <Link
                    className="primary link"
                    target="_blank"
                    href={`/genes/${gene.mgiGeneAccessionId}`}
                  >
                    <i>{gene.geneSymbol}</i>
                  </Link>
                  <br />
                  {getTooltipContent(gene)}
                </li>
              ))}
            </ul>
          </>
        )}
        {!clickTooltip.genes.length && !geneFilter && (
          <i className="grey">
            Click on a point of the chart to see the details of an association.
          </i>
        )}
        {!clickTooltip.genes.length && geneFilter && (
          <i className="grey">No data matches with the filter provided.</i>
        )}
      </div>
    </div>
  );
};

export default ManhattanPlot;
