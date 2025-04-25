import { useEffect, useState } from "react";

export const usePagination = <T>(data: Array<T> = [], initialPageSize = 10) => {
  const [activePage, setActivePage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(
    Math.ceil(data.length / pageSize),
  );

  const paginatedData = data.slice(
    activePage * pageSize,
    activePage * pageSize + pageSize,
  );

  useEffect(() => {
    setTotalPages((prevState) => {
      const newTotal = Math.ceil(data.length / pageSize);
      if (prevState !== newTotal) {
        return newTotal;
      }
      return prevState;
    });
  }, [pageSize, data.length]);

  useEffect(() => {
    if (data.length) {
      setActivePage((prevState) => {
        if (prevState !== 0) {
          return 0;
        }
        return prevState;
      });
    }
  }, [data.length]);

  return {
    activePage,
    setActivePage,
    pageSize,
    setPageSize,
    totalPages,
    setTotalPages,
    paginatedData,
  };
};
