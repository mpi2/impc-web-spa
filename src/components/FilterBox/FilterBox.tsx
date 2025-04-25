import { Form } from "react-bootstrap";
import { CSSProperties } from "react";

type LabelProps =
  | {
      hideLabel?: true;
      label?: never;
    }
  | {
      hideLabel?: false;
      label: string;
    };
type CommonProps = {
  controlId: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  options?: Array<string>;
  labelStyle?: CSSProperties;
  controlStyle?: CSSProperties;
  controlClassName?: string;
  value?: string;
  allOptionEnabled?: boolean;
  displayEvenWithOnlyOneOption?: boolean;
  emitValueLowercase?: boolean;
  prioritaseControlId?: boolean;
};

type Props = CommonProps & LabelProps;
const FilterBox = (props: Props) => {
  const {
    controlId,
    options,
    label,
    ariaLabel,
    onChange,
    labelStyle = { marginRight: "0.5rem" },
    controlStyle = { display: "inline-block", width: 200 },
    controlClassName = "bg-white",
    hideLabel = false,
    value,
    allOptionEnabled = true,
    displayEvenWithOnlyOneOption = false,
    emitValueLowercase = true,
    prioritaseControlId = false,
  } = props;
  const optionalControlProps: Record<string, string> = {};
  if (hideLabel) {
    optionalControlProps["aria-label"] = ariaLabel;
  }

  if (!displayEvenWithOnlyOneOption && options?.length === 1) {
    return null;
  }

  return (
    <div
      data-testid={`filterbox-${prioritaseControlId ? controlId : label || controlId}`}
    >
      {!hideLabel && (
        <label htmlFor={controlId} className="grey" style={labelStyle}>
          {label}:
        </label>
      )}
      {!!options && options.length > 0 ? (
        <Form.Select
          style={controlStyle}
          defaultValue={undefined}
          id={controlId}
          className={controlClassName}
          value={value}
          disabled={displayEvenWithOnlyOneOption && options?.length === 1}
          onChange={(el) =>
            onChange(el.target.value === "all" ? undefined : el.target.value)
          }
          data-testid={`control-${prioritaseControlId ? controlId : label || controlId}`}
          {...optionalControlProps}
        >
          {allOptionEnabled && <option value={"all"}>All</option>}
          {options.sort().map((p) => (
            <option value={p} key={p}>
              {p}
            </option>
          ))}
        </Form.Select>
      ) : (
        <Form.Control
          type="text"
          placeholder="Search"
          style={controlStyle}
          defaultValue={undefined}
          value={value}
          id={controlId}
          className={controlClassName}
          onChange={(el) =>
            onChange(
              (emitValueLowercase
                ? el.target.value.toLowerCase()
                : el.target.value) || undefined,
            )
          }
          {...optionalControlProps}
        ></Form.Control>
      )}
    </div>
  );
};
export default FilterBox;
