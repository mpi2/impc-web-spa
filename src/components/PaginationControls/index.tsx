"use client";
import { CSSProperties, useEffect, useState } from "react";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showEntriesInfo?: boolean;
  pageSize?: number;
  containerStyles?: CSSProperties;
};
const PaginationControls = (props: Props) => {
  const {
    currentPage,
    totalPages,
    onPageChange,
    showEntriesInfo = false,
    pageSize = 25,
    containerStyles = {},
  } = props;
  const [pageRange, setPageRange] = useState([1, 2, 3]);
  const handlePageChange = (page: number) => {
    onPageChange(page);
    updatePageRange(page, totalPages);
  };

  const updatePageRange = (page: number, totalPages: number) => {
    let rangeStart = Math.max(1, page - 2);
    let rangeEnd = Math.min(totalPages, page + 2);

    if (rangeEnd - rangeStart < 4) {
      // If the range is too small, adjust it to always show 5 pages
      if (page <= 3) {
        rangeEnd = Math.min(totalPages, 5);
      } else {
        rangeStart = Math.max(1, totalPages - 4);
      }
    }

    setPageRange(
      Array.from(
        { length: rangeEnd - rangeStart + 1 },
        (_, i) => rangeStart + i,
      ),
    );
  };

  const canGoBack = currentPage >= 1;
  const canGoForward = currentPage + 1 < totalPages;

  const mergedContainerStyles = Object.assign(
    containerStyles,
    showEntriesInfo ? { display: "flex", justifyContent: "space-between" } : {},
  );

  useEffect(() => {
    updatePageRange(currentPage, totalPages);
  }, [totalPages]);

  return (
    <nav aria-label="Page navigation example" style={mergedContainerStyles}>
      {!!showEntriesInfo && (
        <span>
          Showing {currentPage * pageSize + 1} to {pageSize * (currentPage + 1)}{" "}
          of {(totalPages * pageSize).toLocaleString()} entries
        </span>
      )}
      <ul className="pagination justify-content-center paginationNav">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!canGoBack}
          className="pagNavBtn nav-btn"
          aria-label="Previous"
        >
          <FontAwesomeIcon
            icon={faArrowLeft}
            title="previous page button"
            titleId="prev-page-icon"
          />
        </button>
        {pageRange[0] > 1 && (
          <>
            <li className="page-item first-page">
              <button
                className={classNames("pagNavBtn", {
                  active: currentPage === 0,
                })}
                aria-label="Previous"
                onClick={() => handlePageChange(0)}
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
          <li key={pageNumber} className="page-item">
            <button
              className={classNames("pagNavBtn", {
                active: currentPage === pageNumber - 1,
              })}
              onClick={() => handlePageChange(pageNumber - 1)}
            >
              {pageNumber}
            </button>
          </li>
        ))}
        {pageRange[pageRange.length - 1] < totalPages && (
          <>
            {pageRange[pageRange.length - 1] < totalPages - 1 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
            <li className="page-item">
              <button
                className="pagNavBtn last-page"
                aria-label="Previous"
                onClick={() => handlePageChange(totalPages - 1)}
              >
                <span aria-hidden="true">{totalPages}</span>
              </button>
            </li>
          </>
        )}
        <button
          className="pagNavBtn nav-btn"
          disabled={!canGoForward}
          aria-label="Next"
          onClick={() => handlePageChange(currentPage + 1)}
        >
          <FontAwesomeIcon
            icon={faArrowRight}
            title="next page button"
            titleId="next-page-icon"
          />
        </button>
      </ul>
    </nav>
  );
};

export default PaginationControls;
