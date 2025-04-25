import { useEffect, useMemo, useState } from "react";
import SortableTable from "../../SortableTable";
import { orderBy } from "lodash";
import { Dataset, DatasetExtra, SortType } from "@/models";
import { groupData, processData, getBackgroundColorForRow } from "./utils";
import { Button } from "react-bootstrap";
import { AlleleSymbol } from "@/components";
import Skeleton from "react-loading-skeleton";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  data: Array<Dataset>;
  initialSortByProp?: string;
  selectedKey?: string;
  onSelectParam?: (newValue: string) => void;
};

type SortOptions = {
  prop: string | ((any) => void);
  order: "asc" | "desc";
};
const BodyWeightDataComparison = (props: Props) => {
  const {
    data,
    initialSortByProp,
    selectedKey,
    onSelectParam = (_) => {},
  } = props;

  const groups = groupData(data);
  const processed = processData(groups);
  const [visibleRows, setVisibleRows] = useState(10);
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    prop: !!initialSortByProp ? initialSortByProp : "phenotypingCentre",
    order: "asc" as const,
  });
  const defaultSort: SortType = useMemo(() => ["phenotypingCentre", "asc"], []);
  const sorted = orderBy(processed, sortOptions.prop, sortOptions.order);

  const visibleData: Array<DatasetExtra> = useMemo(
    () => sorted.slice(0, visibleRows),
    [sorted, visibleRows]
  );

  const tableHeaders = [
    { width: 1, label: "Phenotyping Centre", field: "phenotypingCentre" },
    { width: 2, label: "Allele", field: "alleleSymbol" },
    { width: 1, label: "Zygosity", field: "zygosity" },
    { width: 1, label: "Life Stage", field: "lifeStageName" },
    { width: 1, label: "Colony Id", field: "colonyId" },
  ];

  useEffect(() => {
    if (
      !!sorted[0]?.key &&
      sorted[0]?.key !== selectedKey &&
      selectedKey === ""
    ) {
      onSelectParam(sorted[0].key);
    }
  }, [sorted.length]);

  return (
    <>
      <AnimatePresence>
        <SortableTable
          className="data-comparison-table"
          doSort={(sort) => {
            setSortOptions({
              prop: sort[0],
              order: sort[1],
            });
          }}
          defaultSort={defaultSort}
          headers={tableHeaders}
        >
          {visibleData.map((d, i) => {
            return (
              <motion.tr
                key={d.key}
                className={getBackgroundColorForRow(d, i, selectedKey)}
                onClick={() => onSelectParam(d.key)}
                layout
                initial={{ y: 10, opacity: 0, maxHeight: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <td>{d.phenotypingCentre}</td>
                <td>
                  <AlleleSymbol symbol={d.alleleSymbol} withLabel={false} />
                </td>
                <td>{d.zygosity}</td>
                <td>{d.lifeStageName}</td>
                <td>{d.colonyId}</td>
              </motion.tr>
            );
          })}
          {visibleData.length === 0 && (
            <motion.tr
              layout
              initial={{ y: 10, opacity: 0, maxHeight: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0, maxHeight: 0 }}
            >
              {[...Array(tableHeaders.length)].map((_, i) => (
                <td key={i}>
                  <Skeleton />
                </td>
              ))}
            </motion.tr>
          )}
        </SortableTable>
        <div style={{ display: "flex", justifyContent: "center" }}>
          {visibleRows < sorted?.length && (
            <Button
              variant="secondary"
              className="white-x"
              onClick={() => setVisibleRows((prevState) => prevState + 10)}
            >
              View next 10 rows
            </Button>
          )}
        </div>
      </AnimatePresence>
    </>
  );
};

export default BodyWeightDataComparison;
