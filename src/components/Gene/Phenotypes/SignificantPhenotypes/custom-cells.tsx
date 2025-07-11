import { TableCellProps } from "@/models";
import { Link } from "react-router";
import { get } from "lodash";
import { DATA_SITE_BASE_PATH } from "@/shared";

type Props<T> = {
  mpTermIdKey?: keyof T;
} & TableCellProps<T>;
export const SupportingDataCell = <T,>(props: Props<T>) => {
  const numOfDatasets = get(props.value, props.field)?.length;
  const mgiAccessionId = get(props.value, "mgiGeneAccessionId") as string;
  const phenotypeName = get(props.value, "phenotypeName") as string;
  const mpTermKey = !!props.mpTermIdKey ? props.mpTermIdKey : "id";
  const mpTermpId = get(props.value, mpTermKey) as string;
  const alleleAccessionId = get(props.value, "alleleAccessionId");
  const lifeStage = get(props.value, "lifeStageName") as string;

  let url = `/${DATA_SITE_BASE_PATH}/supporting-data?mgiGeneAccessionId=${mgiAccessionId}&mpTermId=${mpTermpId}&alleleAccessionId=${alleleAccessionId}&lifeStageName=${lifeStage}`;
  const isAssociatedToPWG = props.value?.["projectName"] === "PWG" || false;
  if (isAssociatedToPWG) {
    url =
      "https://www.mousephenotype.org/publications/data-supporting-impc-papers/pain/";
  }
  return (
    <Link
      to={url}
      title={`view ${numOfDatasets} supporting datasets for ${phenotypeName} phenotype`}
    >
      <span className="link primary small float-right">
        {numOfDatasets === 1
          ? "1 supporting dataset"
          : `${numOfDatasets} supporting datasets`}
      </span>
    </Link>
  );
};
