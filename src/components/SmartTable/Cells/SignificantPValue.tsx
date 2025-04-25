import { Model, TableCellProps } from "@/models";
import { get } from "lodash";
import { formatPValue } from "@/utils";
import { useMemo } from "react";

const SignificantPValue = <T extends Model>(
  props: TableCellProps<T> & {
    onRefHover?: (refNum: string, active: boolean) => void;
  }
) => {
  const { onRefHover = (p1, p2) => {} } = props;
  const pValue = useMemo(() => {
    const zeroPValueDataTypes = ["unidimensional", "categorical"];
    const value = formatPValue(get(props.value, props.field) as number);
    return zeroPValueDataTypes.includes(get(props.value, "dataType") as string)
      ? value
      : value || "N/A";
  }, [props.value]);
  const isManualAssociation = get(props.value, "assertionType") === "manual";
  const isAssociatedToPWG = props.value?.["projectName"] === "PWG" || false;

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
        {isManualAssociation ? (
          <>
            N/A&nbsp;
            <sup
              onMouseEnter={() => onRefHover("*", true)}
              onMouseLeave={() => onRefHover("*", false)}
            >
              *
            </sup>
          </>
        ) : (
          pValue
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

export default SignificantPValue;
