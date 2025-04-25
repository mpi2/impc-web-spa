import { Model, TableCellProps } from "@/models";
import _ from "lodash";
import { AlleleSymbol } from "@/components";

const AlleleCell = <T extends Model>(props: TableCellProps<T>) => {
  const allele = _.get(props.value, props.field) as string;
  return (
    <span style={props.style}>
      <AlleleSymbol symbol={allele} withLabel={false} />
    </span>
  )
};

export default AlleleCell;