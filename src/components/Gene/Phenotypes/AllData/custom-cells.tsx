import { GeneStatisticalResult } from "@/models/gene";
import { TableCellProps } from "@/models";
import styles from "@/components/Gene/Phenotypes/AllData/styles.module.scss";
import { get } from "lodash";
import { BodySystem } from "@/components/BodySystemIcon";
import Link from "next/link";
import { formatPValue } from "@/utils";
import { useQueryFlags } from "@/hooks";
import { useMemo } from "react";

export const ParameterCell = <T extends GeneStatisticalResult>(
  props: TableCellProps<T>,
) => {
  return (
    <span className={styles.procedureName}>
      <small className="grey">{props.value.procedureName}</small>
      <br />
      <strong>{props.value.parameterName}</strong>
    </span>
  );
};

type PhenotypeIconsCellProps<T> = {
  allPhenotypesField: keyof T;
} & TableCellProps<T>;
export const PhenotypeIconsCell = <T extends GeneStatisticalResult>(
  props: PhenotypeIconsCellProps<T>,
) => {
  const phenotypes = (get(props.value, props.allPhenotypesField) ||
    []) as Array<{ name: string }>;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
      }}
    >
      <span>
        {phenotypes.map(({ name }, index) => (
          <BodySystem key={index} name={name} color="grey" noSpacing />
        ))}
      </span>
    </span>
  );
};

type SupportingDataCellProps<T> = {
  mpTermIdKey?: keyof T;
} & TableCellProps<T>;

export const SupportingDataCell = <T extends GeneStatisticalResult>(
  props: SupportingDataCellProps<T>,
) => {
  const {
    mgiGeneAccessionId,
    alleleAccessionId,
    zygosity,
    parameterStableId,
    pipelineStableId,
    procedureStableId,
    phenotypingCentre,
    parameterName,
    procedureName,
    metadataGroup,
  } = props.value;

  let url = `/supporting-data?mgiGeneAccessionId=${mgiGeneAccessionId}&alleleAccessionId=${alleleAccessionId}&zygosity=${zygosity}&parameterStableId=${parameterStableId}&pipelineStableId=${pipelineStableId}&procedureStableId=${procedureStableId}&phenotypingCentre=${phenotypingCentre}`;
  const isAssociatedToPWG = props.value?.["projectName"] === "PWG" || false;
  if (isAssociatedToPWG) {
    url =
      "https://www.mousephenotype.org/publications/data-supporting-impc-papers/pain/";
  }
  if (procedureName.includes("Histopathology")) {
    if (parameterName.includes("-")) {
      const tissue = parameterName.split("-")[0]?.trim().toLowerCase();
      url = `/supporting-data/histopath/${mgiGeneAccessionId}?anatomy=${tissue}`;
    } else {
      url = `/supporting-data/histopath/${mgiGeneAccessionId}`;
    }
  }
  // if linking to any "special" chart page (ABR, PPI or IPGTT), it shouldn't specify metadataGroup
  // to be able to get all the related parameters
  if (
    !(
      procedureStableId.includes("IMPC_ABR") ||
      procedureStableId.includes("IMPC_ACS_003") ||
      procedureStableId.includes("IMPC_IPG_001")
    )
  ) {
    url += `&metadataGroup=${metadataGroup}`;
  }
  return (
    <Link href={url} title={`view supporting data for ${parameterName}`}>
      <span className="link primary small float-right">Supporting data</span>
    </Link>
  );
};

export const SignificantPValueCell = <T extends GeneStatisticalResult>(
  props: TableCellProps<T> & {
    onRefHover?: (refNum: string, active: boolean) => void;
  },
) => {
  const { onRefHover = (p1, p2) => {} } = props;
  const isAssociatedToPWG = props.value?.["projectName"] === "PWG" || false;

  const pValue = useMemo(() => {
    const zeroPValueDataTypes = ["unidimensional", "categorical"];
    const pValue = formatPValue(get(props.value, props.field) as number);
    return zeroPValueDataTypes.includes(props.value.dataType)
      ? pValue
      : pValue || "N/A";
  }, [props.value]);

  // TODO: update condition after assertionType is added
  const isManualAssociation =
    props.value.statisticalMethod === "Supplied as data";

  return (
    <span
      className="bold"
      style={{
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap",
      }}
    >
      <span data-testid="p-value">
        {pValue}
        {isManualAssociation && (
          <>
            &nbsp;
            <sup
              onMouseEnter={() => onRefHover("*", true)}
              onMouseLeave={() => onRefHover("*", false)}
            >
              *
            </sup>
          </>
        )}
        &nbsp;
        {isAssociatedToPWG && (
          <sup
            onMouseEnter={() => onRefHover("**", true)}
            onMouseLeave={() => onRefHover("**", false)}
          >
            **
          </sup>
        )}
      </span>
    </span>
  );
};

export const MutantCountCell = <T extends GeneStatisticalResult>(
  props: TableCellProps<T> & {
    onRefHover?: (refNum: string, active: boolean) => void;
  },
) => {
  const { onRefHover = (p1, p2) => {} } = props;
  const { isNNumbersFootnoteAvailable } = useQueryFlags();
  const value = get(props.value, props.field) as string;
  const mutantsBelowThreshold =
    props.value.maleMutantCount < props.value.procedureMinMales &&
    props.value.femaleMutantCount < props.value.procedureMinFemales;
  const shouldDisplayMarker =
    mutantsBelowThreshold && isNNumbersFootnoteAvailable && value !== "N/A";
  return (
    <span style={props.style}>
      {value}
      {shouldDisplayMarker && (
        <sup
          onMouseEnter={() => onRefHover("+", true)}
          onMouseLeave={() => onRefHover("+", false)}
          style={{ display: "inline-block", marginLeft: "5px" }}
        >
          +
        </sup>
      )}
    </span>
  );
};
