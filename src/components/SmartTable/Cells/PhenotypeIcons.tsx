import { Model, TableCellProps } from "@/models";
import { get } from "lodash";
import { BodySystem } from "@/components/BodySystemIcon";

type Props<T> = {
  allPhenotypesField: keyof T;
  mpTermIdKey?: keyof T;
} & TableCellProps<T>;

const PhenotypeIcons = <T extends Model>(props: Props<T>) => {
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

export default PhenotypeIcons;
