import { TableCellProps } from "@/models";
import Link from "next/link";
import { get } from "lodash";

type Props<T> = {
  mpTermIdKey?: keyof T;
} & TableCellProps<T>;
export const SupportingDataCell = <T,>(props: Props<T>) => {
  const numOfDatasets = get(props.value, props.field)?.length;
  const mgiAccessionId = get(props.value, "mgiGeneAccessionId") as string;
  const phenotypeName = get(props.value, "phenotypeName") as string;
  const mpTermKey = !!props.mpTermIdKey ? props.mpTermIdKey : "id";
  const mpTermpId = get(props.value, mpTermKey) as string;

  let url = `/supporting-data?mgiGeneAccessionId=${mgiAccessionId}&mpTermId=${mpTermpId}`;
  const isAssociatedToPWG = props.value?.["projectName"] === "PWG" || false;
  if (isAssociatedToPWG) {
    url =
      "https://www.mousephenotype.org/publications/data-supporting-impc-papers/pain/";
  }
  return (
    <Link
      href={url}
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
