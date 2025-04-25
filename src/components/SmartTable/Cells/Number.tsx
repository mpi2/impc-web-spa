import { Model, TableCellProps } from "@/models";
import _ from "lodash";

const NumberCell = <T extends Model>(props: TableCellProps<T>) => {
  return <span style={props.style}>{(_.get(props.value, props.field) as number).toLocaleString()}</span>
};

export default NumberCell;