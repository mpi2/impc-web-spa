"use client";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  useEffect,
  useState,
  ReactElement,
  CSSProperties,
  ReactNode,
} from "react";
import styles from "./styles.module.scss";
import classNames from "classnames";

type Props<T> = {
  data: Array<T>;
  children: (pageData: Array<T>) => ReactNode;
  totalItems?: number;
  onPageChange?: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  page?: number;
  pageSize?: number;
  controlled?: boolean;
  buttonsPlacement?: "top" | "bottom" | "both";
  additionalTopControls?: ReactElement | null;
  additionalBottomControls?: ReactElement | null;
  topControlsWrapperCSS?: CSSProperties;
  bottomControlsWrapperCSS?: CSSProperties;
  displayPageControls?: boolean;
  displayPaginationControls?: boolean;
};

type NavButtonsProps = {
  shouldBeDisplayed: boolean;
  placement: "top" | "bottom";
  style?: CSSProperties;
};

const Pagination = <T extends unknown>(props: Props<T>) => {
  const {
    data = [],
    children,
    totalItems,
    onPageChange,
    onPageSizeChange,
    page = 0,
    pageSize,
    controlled = false,
    buttonsPlacement = "both",
    additionalTopControls: AdditionalTopControls = null,
    additionalBottomControls: AdditionalBottomControls = null,
    topControlsWrapperCSS = {},
    bottomControlsWrapperCSS = {},
    displayPageControls = true,
    displayPaginationControls = true,
  } = props;

  const [internalPage, setInternalPage] = useState(page);
  const [internalPageSize, setInternalPageSize] = useState(10);
  const [pageRange, setPageRange] = useState([1]);

  const currentPage = controlled
    ? data
    : data?.slice(
        internalPageSize * internalPage,
        internalPageSize * (internalPage + 1),
      ) || [];
  const noTotalItems = controlled ? totalItems : data?.length;
  let totalPages = Math.ceil(noTotalItems / internalPageSize) || 1;
  const updatePageRange = (page: number, totalPages: number) => {
    let rangeStart = Math.max(1, page - 1);
    let rangeEnd = Math.min(totalPages, page + 3);

    if (rangeEnd - rangeStart < 4) {
      // If the range is too small, adjust it to always show 5 pages
      if (page <= 3) {
        rangeEnd = Math.min(totalPages, 5);
      }
    }
    const newPageRange = Array.from(
      { length: rangeEnd - rangeStart + 1 },
      (_, i) => rangeStart + i,
    );
    if (JSON.stringify(pageRange) !== JSON.stringify(newPageRange)) {
      setPageRange(newPageRange);
    }
  };

  const canGoBack = internalPage >= 1;
  const canGoForward = internalPage + 1 < totalPages;

  useEffect(() => {
    if (data.length) {
      updatePageRange(internalPage, totalPages);
    }
  }, [data, internalPage, internalPageSize, totalPages]);

  const NavButtons = ({
    shouldBeDisplayed,
    placement,
    style,
  }: NavButtonsProps) => {
    if (shouldBeDisplayed) {
      return (
        <ul
          className="pagination justify-content-center paginationNav"
          data-testid={`nav-buttons-${placement}`}
        >
          <button
            onClick={() => updatePage(internalPage - 1)}
            disabled={!canGoBack}
            className="pagNavBtn nav-btn"
            data-testid={`${placement}-prev-page`}
          >
            <FontAwesomeIcon
              icon={faArrowLeft}
              title="previous page button"
              titleId="prev-page-icon"
            />
          </button>
          {pageRange[0] > 1 && (
            <>
              <li
                className="page-item first-page"
                data-testid={`${placement}-first-page`}
              >
                <button
                  className={classNames("pagNavBtn", {
                    active: internalPage === 0,
                  })}
                  aria-label="Previous"
                  onClick={() => updatePage(0)}
                  data-testid={`${placement}-first-page-btn`}
                >
                  <span aria-hidden="true">1</span>
                </button>
              </li>
              {pageRange[0] > 2 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
            </>
          )}
          {pageRange.map((pageNumber) => (
            <li
              key={pageNumber}
              className="page-item"
              data-testid={`${placement}-page-${pageNumber}`}
            >
              <button
                className={classNames("pagNavBtn", {
                  active: internalPage === pageNumber - 1,
                })}
                onClick={() => updatePage(pageNumber - 1)}
                data-testid={`${placement}-page-${pageNumber}-btn`}
              >
                {pageNumber}
              </button>
            </li>
          ))}
          {pageRange[pageRange.length - 1] < totalPages && (
            <>
              {pageRange[pageRange.length - 2] < totalPages && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
              <li className="page-item" data-testid={`${placement}-last-page`}>
                <button
                  className="pagNavBtn last-page"
                  aria-label="Previous"
                  onClick={() => updatePage(totalPages - 1)}
                  data-testid={`${placement}-last-page-btn`}
                >
                  <span aria-hidden="true">{totalPages}</span>
                </button>
              </li>
            </>
          )}
          <button
            onClick={() => updatePage(internalPage + 1)}
            disabled={!canGoForward}
            className="pagNavBtn nav-btn"
            data-testid={`${placement}-next-page`}
          >
            <FontAwesomeIcon
              icon={faArrowRight}
              title="next page button"
              titleId="next-page-icon"
            />
          </button>
        </ul>
      );
    }
    return null;
  };
  const updatePage = (value: number) => {
    setInternalPage(value);
    if (onPageChange) {
      onPageChange(value);
    }
  };
  const updatePageSize = (value: number) => {
    setInternalPageSize(value);
    if (onPageSizeChange) {
      onPageSizeChange(value);
    }
  };

  useEffect(() => {
    // only set internal page as 0 if component is *uncontrolled*
    // meaning it will receive all the data in one go and won't need to fetch data
    // for each page
    if (!controlled) {
      setInternalPage(0);
    }
  }, [data.length]);
  useEffect(() => {
    if (controlled && internalPage !== page) {
      setInternalPage(page);
    }
  }, [controlled, page, internalPage]);

  const shouldDisplayTopButtons =
    (buttonsPlacement === "top" || buttonsPlacement === "both") &&
    noTotalItems > 10 &&
    displayPaginationControls;
  const shouldDisplayBottomButtons =
    (buttonsPlacement === "bottom" || buttonsPlacement === "both") &&
    noTotalItems > 10 &&
    displayPaginationControls;
  const shouldDisplayPageChangeControls =
    noTotalItems > 10 && displayPageControls && displayPaginationControls;

  return (
    <>
      <div
        className={`${styles.buttonsWrapper} ${styles.top} ${
          !!AdditionalTopControls ? styles.withControls : ""
        }`}
        data-testid="top-controls-wrapper"
        style={topControlsWrapperCSS}
      >
        {!!AdditionalTopControls && (
          <div className={styles.additionalWrapper}>
            {AdditionalTopControls}
          </div>
        )}
        <NavButtons
          placement="top"
          shouldBeDisplayed={shouldDisplayTopButtons}
        />
      </div>
      {children(currentPage)}
      <div
        className={`${styles.buttonsWrapper} ${
          !!AdditionalBottomControls ? styles.withControls : ""
        }`}
      >
        {!!AdditionalBottomControls && (
          <div
            className={`${styles.additionalWrapper} ${styles.bottomControls}`}
          >
            {AdditionalBottomControls}
          </div>
        )}
        {shouldDisplayPageChangeControls && (
          <div className={styles.bottomPaginationControls}>
            <div style={{ display: "flex", alignItems: "center" }}>
              Rows per page:&nbsp;
              <select
                aria-label="rows per page selector"
                onChange={(e) => {
                  const value = Number(e.target.value);
                  const newPage =
                    value > internalPageSize
                      ? 0
                      : Math.round((internalPageSize / value) * internalPage);
                  updatePage(newPage);
                  updatePageSize(value);
                }}
                value={pageSize}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        )}
        <NavButtons
          placement="bottom"
          shouldBeDisplayed={shouldDisplayBottomButtons}
        />
      </div>
    </>
  );
};

export default Pagination;
