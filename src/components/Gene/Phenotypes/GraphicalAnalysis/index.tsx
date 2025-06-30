import { useState, useMemo, useEffect, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckSquare } from "@fortawesome/free-solid-svg-icons";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import styles from "./styles.module.scss";
import { Alert, Form } from "react-bootstrap";
import { GeneStatisticalResult } from "@/models/gene";
import { useGeneAllStatisticalResData } from "@/hooks";
import { AllelesStudiedContext, GeneContext } from "@/contexts";
import {
  Cat,
  CatType,
  cats,
  options,
  systemColorMap,
  getProcedureColorMap,
} from "./shared";
import GraphicalAnalysisChart from "./GraphicalAnalysisChart";
import LoadingProgressBar from "@/components/LoadingProgressBar";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import classNames from "classnames";
import BodySystemIcon from "@/components/BodySystemIcon";
import { formatBodySystems } from "@/utils";
import { sortBy, uniq } from "lodash";

type Props = {
  mgiGeneAccessionId: string;
  routerIsReady: boolean;
  chartIsVisible: boolean;
};

const transformPValue = (value: number, significant: boolean) => {
  if (value === 0 && significant) {
    // put a high value to show they are really significant
    return 15;
  } else if (value === 0) {
    return 0;
  }
  return -Math.log10(value);
};
const getSignificants = (data: Array<GeneStatisticalResult>) => {
  return data.filter((item) => {
    const pValueThreshold = item.projectName === "PWG" ? 3 : 4;
    return -Math.log10(Number(item.pValue)) >= pValueThreshold;
  });
};
const processData = (
  data: Array<GeneStatisticalResult>,
  { type }: Cat,
  significantOnly: boolean,
) => {
  const { BODY_SYSTEMS, PROCEDURES } = cats;
  const significants = getSignificants(data);
  let results: Array<GeneStatisticalResult> = data;
  let fieldsToSort: Array<string>;
  switch (type) {
    case BODY_SYSTEMS:
      fieldsToSort = ["topLevelPhenotypeList", "parameterName"];
      if (significantOnly) {
        const bodySystems = Array.from(
          new Set(significants.map((x) => x.topLevelPhenotypeList[0])),
        );
        results = data.filter((x) => {
          return x.topLevelPhenotypeList.some((y) => bodySystems.includes(y));
        });
      }
      break;
    case PROCEDURES:
      fieldsToSort = ["procedureName", "parameterName"];
      if (significantOnly) {
        const procedures = Array.from(
          new Set(significants.map((x) => x.procedureName)),
        );
        results = data.filter((x) => {
          return procedures.includes(x.procedureName);
        });
      }
      break;
    default:
      results = significantOnly ? significants : data;
      fieldsToSort = ["pValue", "desc"];
  }
  return sortBy(results, fieldsToSort).map((d, index) => ({
    ...d,
    arrPos: index,
    chartValue: transformPValue(d.pValue, d.significant),
  }));
};

const GraphicalAnalysis = (props: Props) => {
  const { mgiGeneAccessionId, routerIsReady, chartIsVisible } = props;
  const gene = useContext(GeneContext);
  const { setAllelesStudiedLoading } = useContext(AllelesStudiedContext);
  const [cat, setCat] = useState<Cat | null>({
    type: cats.BODY_SYSTEMS,
  });
  const [significantOnly, setSignificantOnly] = useState<boolean>(false);

  const { geneData, isGeneFetching, isGeneError } =
    useGeneAllStatisticalResData(
      mgiGeneAccessionId,
      routerIsReady && chartIsVisible,
    );

  useEffect(() => setAllelesStudiedLoading(isGeneFetching), [isGeneFetching]);

  const filteredData = useMemo(() => {
    const allData = {};
    geneData.forEach((result) => {
      const {
        mgiGeneAccessionId,
        parameterStableId,
        alleleAccessionId,
        metadataGroup,
        pValue,
      } = result;
      const hash = `${mgiGeneAccessionId}-${parameterStableId}-${alleleAccessionId}-${metadataGroup}-${pValue}`;
      if (result[hash] === undefined) {
        allData[hash] = result;
      }
    });
    return Object.values(allData) as Array<GeneStatisticalResult>;
  }, [geneData]);

  const dataWithPValue = useMemo(
    () =>
      filteredData
        .filter((x) => x.topLevelPhenotypes?.length)
        .map((x, index) => ({
          ...x,
          pValue: Number(x.pValue) || 0,
          topLevelPhenotypeList: x.topLevelPhenotypes.map((y) => y.name),
        })),
    [filteredData],
  );

  const processed = useMemo(
    () => processData(dataWithPValue, cat, significantOnly),
    [dataWithPValue, cat, significantOnly],
  );

  const isByProcedure = cat.type === cats.PROCEDURES;
  const yAxisLabels = useMemo(
    () =>
      isByProcedure
        ? uniq(processed.map((x) => x.procedureName))
        : uniq(processed.map((x) => x.topLevelPhenotypeList[0])),
    [processed, isByProcedure],
  );

  const procedureColorMap = useMemo(
    () => getProcedureColorMap(uniq(filteredData.map((x) => x.procedureName))),
    [processed, isByProcedure],
  );

  const handleToggle = () => {
    setSignificantOnly(!significantOnly);
  };

  const significantSuffix = useMemo(() => {
    if (cat.type === cats.BODY_SYSTEMS) {
      return "physiological systems";
    } else if (cat.type === cats.PROCEDURES) {
      return "procedures";
    }
    return "";
  }, [cat]);

  const hasDataRelatedToPWG = geneData.some(
    (item) => item.projectName === "PWG",
  );

  if (geneData.length === 0 && isGeneError) {
    return (
      <Alert variant="primary" className="mt-3">
        No phenotype data available for <i>{gene.geneSymbol}</i>
      </Alert>
    );
  }

  return (
    <>
      <div
        style={{
          paddingLeft: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <p>
          <label
            htmlFor="groupBy"
            className="grey"
            style={{ marginRight: "0.5rem" }}
          >
            Include in groups:
          </label>
          <Form.Select
            style={{ display: "inline-block", width: 280, marginRight: "2rem" }}
            aria-label="Group by"
            // value={cat.type}
            defaultValue={cat.type}
            id="groupBy"
            className="bg-white"
            onChange={(el) => {
              setCat({ type: el.target.value as CatType });
            }}
          >
            {options.map(({ label, category }, index) => (
              <option key={category} value={category} key={index}>
                {label}
              </option>
            ))}
          </Form.Select>
          <button onClick={handleToggle} className={styles.inlineButton}>
            <FontAwesomeIcon
              icon={significantOnly ? faCheckSquare : faSquare}
              className={significantOnly ? "primary" : "grey"}
            />{" "}
            Only show significant {significantSuffix}
          </button>
        </p>
      </div>
      {isGeneFetching ? (
        <div
          className="mt-4"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <LoadingProgressBar />
        </div>
      ) : (
        <div>
          <div className={classNames(styles.labels, styles.icons)}>
            {yAxisLabels.filter(Boolean).map((item, index) => {
              const chartLabel = isByProcedure
                ? procedureColorMap[item]
                : systemColorMap[item];
              return (
                <span className="grey" key={item}>
                  <span
                    className={classNames(styles.icon, {
                      [styles.circle]:
                        chartLabel.shape === "circle" ||
                        chartLabel.color === undefined,
                      [styles.diamond]: chartLabel.shape === "diamond",
                      [styles.phenotype]: !isByProcedure,
                    })}
                    style={{ backgroundColor: chartLabel.color }}
                  >
                    {isByProcedure ? null : (
                      <BodySystemIcon name={item} color="white" size="1x" />
                    )}
                  </span>
                  &nbsp;
                  <small>{formatBodySystems(item)}</small>
                </span>
              );
            })}
            <span
              className="grey"
              style={{ display: "inline-block", whiteSpace: "nowrap" }}
            >
              <hr className={styles.dashedLine} />
              <small>Significant P-Value threshold (P &lt; 0.0001)</small>
            </span>
          </div>
          <div className={classNames(styles.labels, "grey")}>
            <div className={styles.figureContainer}>
              <div className={styles.circle} />
              Statistical annotations
            </div>
            <div className={styles.figureContainer}>
              <div className={styles.triangle} />
              Manual annotations:
              <i>
                Are assigned a value of 1x10<sup>-15</sup> in order to be
                displayed in the chart
              </i>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <ParentSize>
              {({ width, height }) => (
                <GraphicalAnalysisChart
                  width={width}
                  height={height}
                  data={processed}
                  isByProcedure={isByProcedure}
                  category={cat}
                  significantOnly={significantOnly}
                  procedureColorMap={procedureColorMap}
                ></GraphicalAnalysisChart>
              )}
            </ParentSize>
          </div>
          <div className={styles.bottomLabels}>
            <span className="labels">
              {hasDataRelatedToPWG && (
                <span style={{ marginLeft: "1rem" }}>
                  <hr
                    className={styles.dashedLine}
                    style={{ borderTop: "3px dashed rgb(255, 99, 132)" }}
                  />
                  Significant threshold for pain sensitivity (P &lt; 0.001)
                </span>
              )}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default GraphicalAnalysis;
