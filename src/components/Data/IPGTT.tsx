import { Dataset } from "@/models";
import { useRelatedParametersQuery } from "@/hooks/related-parameters.query";
import { useEffect } from "react";
import { getChartType } from "@/components/Data/Utils";
import { chartLoadingIndicatorChannel } from "@/eventChannels";

const parameterList = [
  "IMPC_IPG_002_001",
  "IMPC_IPG_010_001",
  "IMPC_IPG_011_001",
  "IMPC_IPG_012_001",
];

type IPGTTProps = {
  datasetSummaries: Array<Dataset>;
  onNewSummariesFetched: (missingSummaries: Array<any>) => void;
  activeDataset: Dataset;
};

const IPGTT = (props: IPGTTProps) => {
  const { datasetSummaries, onNewSummariesFetched, activeDataset } = props;
  const { datasetsAreLoading } = useRelatedParametersQuery(
    datasetSummaries,
    parameterList,
    onNewSummariesFetched
  );

  useEffect(() => {
    chartLoadingIndicatorChannel.emit("toggleIndicator", datasetsAreLoading);
  }, [datasetsAreLoading]);

  const { Chart } = getChartType(activeDataset);
  return Chart;
};

export default IPGTT;
