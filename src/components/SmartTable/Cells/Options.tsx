import { Model, TableCellProps } from "@/models";
import _ from "lodash";

type Props<T> = {
  options: Record<string, string>;
  customFn?: (value: T, field: string) => keyof Props<T>['options'];
}
const OptionsCell = <T,>(props: TableCellProps<T> & Props<T>) => {
  const { customFn } = props;
  const key = !!customFn ? customFn(props.value, props.field as string) : _.get(props.value, props.field);
  return <span data-testid="options-cell">
    {props.options[key as string]}
  </span>
};

export default OptionsCell;