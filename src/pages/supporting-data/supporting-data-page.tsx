"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert, Container, Spinner } from "react-bootstrap";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import { formatPValue, getDatasetByKey, getSmallestPValue } from "@/utils";
import {
  ABR,
  ChartNav,
  DataComparison,
  FlowCytometryImages,
  IPGTT,
  PPI,
} from "@/components/Data";
import { Card, Search } from "@/components";
import {
  useBodyWeightQuery,
  useChartFlags,
  useDatasetsQuery,
  useFlowCytometryQuery,
} from "@/hooks";
import { Dataset } from "@/models";
import Skeleton from "react-loading-skeleton";
import { getChartType } from "@/components/Data/Utils";
import { chartLoadingIndicatorChannel } from "@/eventChannels";
import { useDebounce } from "usehooks-ts";
import { ChartPageParams } from "@/models/chart";
import classnames from "classnames";

const generateParamsObject = (
  searchParams: ReadonlyURLSearchParams,
): Record<ChartPageParams, string> => {
  const params = [
    "mpTermId",
    "alleleAccessionId",
    "zygosity",
    "parameterStableId",
    "pipelineStableId",
    "procedureStableId",
    "phenotypingCentre",
  ];
  const result = {};
  params.forEach((param) => (result[param] = searchParams.get(param)));
  return result as Record<ChartPageParams, string>;
};

type GeneralChartPageProps = {
  initialDatasets: Array<Dataset>;
};

const GeneralChartPage = ({ initialDatasets }: GeneralChartPageProps) => {
  const [selectedKey, setSelectedKey] = useState("");
  const [additionalSummaries, setAdditionalSummaries] = useState<
    Array<Dataset>
  >([]);
  const [overridingSummaries, setOverridingSummaries] = useState<
    Array<Dataset>
  >([]);
  const [specialChartLoading, setSpecialChartLoading] = useState(true);
  const debouncedSpChartLoading = useDebounce<boolean>(
    specialChartLoading,
    500,
  );
  const searchParams = useSearchParams();
  const mgiGeneAccessionId: string = searchParams.get("mgiGeneAccessionId");

  const getPageTitle = (summaries: Array<Dataset>, isError: boolean) => {
    if ((!summaries || summaries.length === 0) && !isError) {
      return <Skeleton width={200} />;
    } else if (
      !!summaries.some((d) => d.procedureStableId === "IMPC_IPG_001")
    ) {
      return "Intraperitoneal glucose tolerance test";
    } else if (allSummaries[0]?.significantPhenotype?.name) {
      return allSummaries[0]?.significantPhenotype?.name;
    } else {
      return allSummaries[0]?.procedureName;
    }
  };

  const { datasetSummaries, isFetching, isError } = useDatasetsQuery(
    mgiGeneAccessionId,
    generateParamsObject(searchParams),
    !!mgiGeneAccessionId && initialDatasets?.length === 0,
    initialDatasets,
  );

  const {
    isABRChart,
    isViabilityChart,
    isTimeSeries,
    isIPGTTChart,
    isPPIChart,
    hasFlowCytometryImages,
    isMiniSpecProcedure,
    noStatisticsPerformed,
  } = useChartFlags(datasetSummaries, isError);

  useEffect(() => {
    const unsubscribeToggleIndicator = chartLoadingIndicatorChannel.on(
      "toggleIndicator",
      (payload: boolean) => setSpecialChartLoading(payload),
    );

    return () => {
      unsubscribeToggleIndicator();
    };
  }, []);

  const parameterStableId: string =
    searchParams.get("parameterStableId") || datasetSummaries?.length
      ? datasetSummaries[0]?.parameterStableId
      : null;

  const { data: flowCytometryImages } = useFlowCytometryQuery(
    mgiGeneAccessionId,
    parameterStableId,
    !!mgiGeneAccessionId && !!parameterStableId && hasFlowCytometryImages,
  );

  useEffect(() => {
    if (!isPPIChart && specialChartLoading) {
      setSpecialChartLoading(false);
    }
  }, [isPPIChart]);

  const allSummaries = !!overridingSummaries.length
    ? overridingSummaries?.concat(additionalSummaries)
    : datasetSummaries?.concat(additionalSummaries);
  const activeDataset = !!selectedKey
    ? getDatasetByKey(allSummaries, selectedKey)
    : allSummaries?.[0];

  const extraChildren =
    hasFlowCytometryImages && flowCytometryImages.length ? (
      <FlowCytometryImages images={flowCytometryImages} />
    ) : null;

  const { Chart, chartType } = getChartType(activeDataset, true, extraChildren);

  const { bodyWeightData } = useBodyWeightQuery(
    mgiGeneAccessionId as string,
    !!mgiGeneAccessionId && chartType === "bodyweight",
  );

  useEffect(() => {
    if (!!chartType && chartType === "bodyweight" && !!bodyWeightData?.length) {
      setOverridingSummaries(bodyWeightData);
    }
  }, [chartType, bodyWeightData]);

  const smallestPValue = useMemo(
    () => getSmallestPValue(allSummaries),
    [allSummaries],
  );

  const fetchingInProcess = (isFetching || debouncedSpChartLoading) && !isError;
  const shouldDisplayPValueStatement =
    !isTimeSeries &&
    !fetchingInProcess &&
    smallestPValue !== 1 &&
    !noStatisticsPerformed;
  return (
    <>
      <Search />
      <Container className="page">
        <Card>
          <ChartNav
            mgiGeneAccessionId={mgiGeneAccessionId}
            geneSymbol={allSummaries?.[0]?.geneSymbol}
            isFetching={fetchingInProcess}
          />
          {!datasetSummaries && !isFetching && (
            <Alert variant="primary" className="mb-4 mt-2">
              <Alert.Heading>No data available</Alert.Heading>
              <p style={{ marginBottom: 0 }}>
                We could not find the data to display this page.
              </p>
              <i>
                Please let us know through the&nbsp;
                <a
                  className="link primary"
                  href="https://www.mousephenotype.org/contact-us/"
                >
                  Contact us
                </a>
                &nbsp;page and would be a great help if you could include the
                url page.
              </i>
            </Alert>
          )}
          {!isError && (
            <h1
              className={classnames("mt-2", {
                "mb-4": shouldDisplayPValueStatement,
                "mb-0": !shouldDisplayPValueStatement,
              })}
            >
              <strong className="text-capitalize">
                {getPageTitle(allSummaries, isError)}
              </strong>
            </h1>
          )}
          {fetchingInProcess && (
            <div className="mb-2 mt-4">
              <Spinner animation="border" size="sm" />
              &nbsp; Loading data
            </div>
          )}
          {shouldDisplayPValueStatement && (
            <div className="mb-4">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <span>
                  {allSummaries.length} parameter / zygosity / metadata group
                  combinations tested, with the lowest p-value of&nbsp;
                  <strong>
                    {formatPValue(getSmallestPValue(allSummaries))}
                  </strong>
                </span>
              </div>
            </div>
          )}
          {!isError && (
            <DataComparison
              data={allSummaries}
              isViabilityChart={isViabilityChart}
              selectedKey={selectedKey}
              onSelectParam={setSelectedKey}
              displayPValueThreshold={shouldDisplayPValueStatement}
              displayPValueColumns={shouldDisplayPValueStatement}
              dataIsLoading={fetchingInProcess}
              {...(isABRChart && { initialSortByProp: "parameterStableId" })}
            />
          )}
          {isPPIChart && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn impc-secondary-button"
                onClick={() => {
                  document.querySelector("#chart").scrollIntoView();
                }}
              >
                View chart
              </button>
            </div>
          )}
        </Card>
      </Container>
      <div
        style={{ position: "sticky", top: 0, zIndex: 100 }}
        className="bg-grey pt-2"
      >
        <Container>
          {!!isABRChart ? (
            <ABR
              datasetSummaries={datasetSummaries}
              onNewSummariesFetched={setAdditionalSummaries}
              activeDataset={activeDataset}
            />
          ) : !!isIPGTTChart ? (
            <IPGTT
              datasetSummaries={datasetSummaries}
              onNewSummariesFetched={setAdditionalSummaries}
              activeDataset={activeDataset}
            />
          ) : !!isPPIChart ? (
            <PPI
              datasetSummaries={datasetSummaries}
              onNewSummariesFetched={setAdditionalSummaries}
              activeDataset={activeDataset}
            />
          ) : (
            !!activeDataset && <div>{Chart}</div>
          )}
        </Container>
      </div>
    </>
  );
};

export default GeneralChartPage;
