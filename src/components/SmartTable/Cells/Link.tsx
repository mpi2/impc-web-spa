import { Model, TableCellProps } from "@/models";
import _ from "lodash";
import Link from "next/link";

type Props<T> = {
  prefix: string;
  altFieldForURL?: keyof T;
  usePrimaryColor?: boolean;
}
const LinkCell = <T extends Model>(props: TableCellProps<T> & Props<T>) => {
  const { usePrimaryColor = true } = props;
  const urlValue = !!props.altFieldForURL ? _.get(props.value, props.altFieldForURL) as string : _.get(props.value, props.field) as string;
  const classes = ['link'];
  if (usePrimaryColor) {
    classes.push('primary');
  }
  return (
    <Link className={classes.join(' ')} href={`${props.prefix}/${urlValue}`} style={props.style}>
      {_.get(props.value, props.field) as string}
    </Link>
  )
};

export default LinkCell;