"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Table } from "react-bootstrap";
import styles from "./styles.module.scss";
import React, { useEffect, useState } from "react";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { Sort, SortType, TableHeader } from "@/models";
import classNames from "classnames";

const newSortIsDifferent = (actualSort: Sort, newSort: SortType) => {
  return actualSort.field !== newSort[0] || actualSort.order !== newSort[1];
};

type SortableTableProps = {
  headers: TableHeader[];
  defaultSort?: SortType;
  doSort?: (s: SortType) => void;
  children: React.ReactNode;
  className?: string;
  withMargin?: boolean;
};

const SortableTable = ({
  headers,
  defaultSort,
  doSort,
  children,
  className = "",
  withMargin: shouldHaveMargin = true,
}: SortableTableProps) => {
  // TODO: add search filter
  const [sort, setSort] = useState<Sort>(
    defaultSort
      ? {
          ...(typeof defaultSort[0] === "string"
            ? { field: defaultSort[0], sortFn: undefined }
            : { sortFn: defaultSort[0], field: undefined }),
          order: defaultSort[1],
        }
      : {
          field: headers[0].field,
          sortFn: headers[0].sortFn,
          order: "asc",
        },
  );

  const hasNested = headers.some(({ children }) => children && children.length);

  const getSortOptions = (): SortType => [
    sort.sortFn ?? sort.field,
    sort.order,
  ];

  useEffect(() => {
    if (doSort) {
      doSort(getSortOptions());
    }
  }, [sort]);

  useEffect(() => {
    if (defaultSort && newSortIsDifferent(sort, defaultSort)) {
      setSort({
        ...(typeof defaultSort[0] === "string"
          ? { field: defaultSort[0], sortFn: undefined }
          : { sortFn: defaultSort[0], field: undefined }),
        order: defaultSort[1],
      });
    }
  }, [defaultSort]);

  const SortableTh = ({
    label,
    field,
    sortFn,
    width,
    disabled = false,
    children: childHeader,
    sortField,
    extraContent,
  }: TableHeader) => {
    const selected = field === sort.field || sortField === sort.field;
    const handleSelect = () => {
      if (disabled) return;
      if (selected) {
        setSort({ ...sort, order: sort.order === "asc" ? "desc" : "asc" });
      } else {
        setSort({
          ...sort,
          field: !!sortField ? sortField : field,
          sortFn,
        });
      }
    };
    return (
      <th
        {...(!!width ? { width: `${(width / 12) * 100}%` } : {})}
        {...(hasNested && childHeader && childHeader.length
          ? { colSpan: childHeader.length, scope: "colGroup" }
          : { rowSpan: 2 })}
      >
        {!!label && (
          <button
            style={{
              fontWeight: !disabled && selected ? "bold" : "inherit",
            }}
            className={classNames(styles.inlineButton, styles.headerButton, {
              [styles.disabled]: disabled,
              [styles.withExtraContent]: !!extraContent,
            })}
            onClick={handleSelect}
          >
            {label}{" "}
            {!disabled && selected && (
              <FontAwesomeIcon
                className={styles.sortIcon}
                icon={sort.order === "asc" ? faCaretUp : faCaretDown}
              />
            )}
            {!disabled && !selected && (
              <span className={styles.defaultIcons}>
                <FontAwesomeIcon className={styles.first} icon={faCaretUp} />
                <FontAwesomeIcon className={styles.second} icon={faCaretDown} />
              </span>
            )}
          </button>
        )}
        {!!extraContent && extraContent}
      </th>
    );
  };

  return (
    <div className={styles.tableWrapper}>
      <Table
        bordered
        className={classNames(styles.table, styles.striped, className, {
          [styles.noMargin]: !shouldHaveMargin,
        })}
      >
        <thead>
          <tr>
            {headers.map((header, index) => (
              <SortableTh key={index} {...header} />
            ))}
          </tr>
          <tr>
            {hasNested &&
              headers.map(({ children: childHeaders }) => {
                if (childHeaders && childHeaders.length) {
                  return childHeaders.map((childHeader) => (
                    <SortableTh {...childHeader} />
                  ));
                }
              })}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </Table>
    </div>
  );
};

export default SortableTable;
