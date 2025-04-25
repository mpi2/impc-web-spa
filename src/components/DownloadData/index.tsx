"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import { PropsWithChildren, useState } from "react";
import { Spinner } from "react-bootstrap";

type Field<T> = {
  key: keyof T;
  label: string;
  getValueFn?: (data: T) => string;
};

type Props<T> = {
  fileName: string;
  fields: Array<Field<T>> | (() => Array<Field<T>>);
} & (
  | {
      data: Array<T> | (() => Array<T>);
      getData?: undefined;
    }
  | {
      data?: undefined;
      getData: () => Promise<Array<T>>;
    }
);

const DownloadDataComponent = <T,>({
  data,
  fields,
  fileName,
  getData,
  children,
}: PropsWithChildren<Props<T>>) => {
  const [isBusyXLSX, setIsBusyXLSX] = useState(false);
  const [isBusyTSV, setIsBusyTSV] = useState(false);

  const generateXlsxFile = async () => {
    let finalData: Array<T>;
    if (getData) {
      setIsBusyXLSX(true);
      finalData = await getData();
      setIsBusyXLSX(false);
    } else {
      finalData = Array.isArray(data) ? data : data();
    }
    const finalFields = Array.isArray(fields) ? fields : fields();
    const rows = finalData.map((item) => {
      return finalFields.reduce((obj, field) => {
        obj[field.label] = !!field.getValueFn
          ? field.getValueFn(item)
          : (item[field.key] as string);
        return obj;
      }, {});
    });
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data sheet");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const generateTsvFile = async () => {
    let finalData: Array<T>;
    if (getData) {
      setIsBusyTSV(true);
      finalData = await getData();
      setIsBusyTSV(false);
    } else {
      finalData = Array.isArray(data) ? data : data();
    }
    const finalFields = Array.isArray(fields) ? fields : fields();
    const headers = finalFields.map((field) => field.label);
    const rows = finalData.map((item) => {
      return finalFields.map((field) =>
        !!field.getValueFn
          ? field.getValueFn(item)
          : (item[field.key] as string),
      );
    });
    const fileData = [headers, ...rows];
    const tsvContent = fileData.reduce((content, row) => {
      content += `${row.join("\t")}\n`;
      return content;
    }, "");
    const blob = new Blob([tsvContent], {
      type: "text/tab-separated-value;charset=utf-8",
    });
    const objUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", objUrl);
    link.setAttribute("download", `${fileName}.tsv`);
    link.click();
    URL.revokeObjectURL(objUrl);
  };

  return (
    <div
      className="grey"
      style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
    >
      {children ? children : `Download data as:`}
      &nbsp;
      <button
        className="btn impc-secondary-button small"
        onClick={generateTsvFile}
        disabled={isBusyTSV}
      >
        {isBusyTSV ? (
          <Spinner animation="border" size="sm" />
        ) : (
          <>
            <FontAwesomeIcon icon={faDownload} size="sm" /> TSV
          </>
        )}
      </button>
      &nbsp;
      <button
        className="btn impc-secondary-button small"
        onClick={generateXlsxFile}
        disabled={isBusyTSV}
      >
        {isBusyXLSX ? (
          <Spinner animation="border" size="sm" />
        ) : (
          <>
            <FontAwesomeIcon icon={faDownload} size="sm" /> XLS
          </>
        )}
      </button>
    </div>
  );
};

export default DownloadDataComponent;
