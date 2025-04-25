"use client";
import { Form } from "react-bootstrap";
import SortableTable from "@/components/SortableTable";
import Pagination from "@/components/Pagination";
import React, { ReactElement, useEffect, useState } from "react";
import { TableCellProps } from "@/models/TableCell";
import { orderBy } from "lodash";
import type { Model, SortType } from "@/models";
import Skeleton from "react-loading-skeleton";

const SmartTable = <T extends Model>(props: {
  columns: Array<{
    width: number;
    label: string;
    field?: keyof T;
    cmp: ReactElement<TableCellProps<T>>;
    // refers to disable sort functionality
    disabled?: boolean;
    sortField?: string;
  }>;
  data: Array<T> | undefined;
  defaultSort: SortType;
  zeroResulsText?: string;
  filterFn?: (item: T, query: string | undefined) => boolean;
  additionalTopControls?: ReactElement;
  additionalBottomControls?: ReactElement;
  filteringEnabled?: boolean;
  // set this to false if you need more specific filtering, check All Phenotypes section
  customFiltering?: boolean;
  showLoadingIndicator?: boolean;
  customSortFunction?: (
    data: Array<T>,
    field: string,
    order: "asc" | "desc",
  ) => Array<T>;
  highlightRowFunction?: (item: T) => boolean;
  highlightRowColor?: string;
  pagination?: {
    totalItems: number;
    onPageChange: (newPage: number) => void;
    onPageSizeChange: (newPageSize: number) => void;
    page: number;
    pageSize: number;
    sortInternally?: boolean;
  };
  onSortChange?: (sortOptions: string) => void;
  paginationButtonsPlacement?: "top" | "bottom" | "both";
  displayPageControls?: boolean;
  displayPaginationControls?: boolean;
}) => {
  const {
    filteringEnabled = true,
    customFiltering = false,
    zeroResulsText = "No data available",
    showLoadingIndicator = false,
    highlightRowFunction = () => false,
    highlightRowColor = "#00b0b0",
    pagination = null,
    onSortChange = (_) => {},
    paginationButtonsPlacement = "both",
    displayPageControls = true,
    displayPaginationControls = true,
    filterFn,
  } = props;
  const [query, setQuery] = useState<string | undefined>(undefined);
  const [sortOptions, setSortOptions] = useState<string>("");

  const internalShowFilteringEnabled =
    filteringEnabled && !!props.filterFn && !customFiltering;

  let mutatedData = props.data || [];
  if (filterFn) {
    mutatedData = mutatedData?.filter((item) => filterFn(item, query));
  }
  const [field, order] = sortOptions.split(";");
  if (
    field &&
    order &&
    (pagination === null || pagination?.sortInternally === true)
  ) {
    mutatedData = !!props.customSortFunction
      ? props.customSortFunction(mutatedData, field, order as "asc" | "desc")
      : orderBy(mutatedData, field, order as "asc" | "desc");
  }

  useEffect(() => {
    if (sortOptions) {
      onSortChange(sortOptions);
    }
  }, [sortOptions]);

  const additionalControls = internalShowFilteringEnabled ? (
    <Form.Control
      type="text"
      style={{
        display: "inline-block",
        width: 200,
        marginRight: "2rem",
      }}
      aria-label="Filter by parameters"
      id="parameterFilter"
      className="bg-white"
      placeholder="Search "
      onChange={(el) => {
        setQuery(el.target.value.toLowerCase() || undefined);
      }}
    ></Form.Control>
  ) : (
    props.additionalTopControls
  );

  return (
    <Pagination
      data={mutatedData}
      additionalTopControls={additionalControls}
      additionalBottomControls={props.additionalBottomControls}
      controlled={!!pagination}
      buttonsPlacement={paginationButtonsPlacement}
      displayPageControls={displayPageControls}
      displayPaginationControls={displayPaginationControls}
      {...pagination}
    >
      {(pageData) => (
        <SortableTable
          doSort={([field, order]) => {
            setSortOptions(`${field};${order}`);
          }}
          defaultSort={props.defaultSort}
          headers={props.columns.map(({ field, cmp, ...rest }) => ({
            ...rest,
            field: field as string,
          }))}
        >
          {pageData.map((d, index) => (
            <tr
              key={index}
              style={
                highlightRowFunction(d)
                  ? { border: `3px solid ${highlightRowColor}` }
                  : {}
              }
            >
              {props.columns.map(({ field, cmp }, index) => (
                <td
                  key={index}
                  style={{ borderColor: `var(--bs-table-border-color)` }}
                >
                  {React.cloneElement(cmp, { value: d, field })}
                </td>
              ))}
            </tr>
          ))}
          {pageData.length === 0 && showLoadingIndicator && (
            <tr>
              {props.columns.map((_, index) => (
                <td key={index}>
                  <Skeleton />
                </td>
              ))}
            </tr>
          )}
          {pageData.length === 0 && !showLoadingIndicator && (
            <tr>
              <td colSpan={props.columns.length}>
                <b>{zeroResulsText}</b>
              </td>
            </tr>
          )}
        </SortableTable>
      )}
    </Pagination>
  );
};

export default SmartTable;
