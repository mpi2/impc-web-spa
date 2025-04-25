"use client";
import { Breadcrumb, Container } from "react-bootstrap";
import styles from "./styles.module.scss";
import { Suspense, useMemo, useState } from "react";
import {
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { useQuery } from "@tanstack/react-query";
import { fetchLandingPageData } from "@/api-service";
import { usePagination } from "@/hooks";
import {
  LoadingProgressBar,
  Search,
  Card,
  PaginationControls,
} from "@/components";
import Link from "next/link";
import { kebabCase } from "lodash";

const geneMap = new Map();

const SortIndicator = ({
  sortStatus,
  sort,
}: {
  sortStatus: boolean;
  sort: "asc" | "desc" | "none";
}) => (
  <>
    {sortStatus && sort === "desc" && <FontAwesomeIcon icon={faSortDown} />}
    {sortStatus && sort === "asc" && <FontAwesomeIcon icon={faSortUp} />}
    {(!sortStatus || sort === "none") && <FontAwesomeIcon icon={faSort} />}
  </>
);

type HeatmapData = {
  id: string;
  mgiAccession: string;
  hasTissue: boolean;
  allelesWithTissue: Array<string>;
  data: Array<{
    geneSymbol: string;
    headerIndex: number;
    x: string;
    y: number;
  }>;
};

const HistopathLandingPage = () => {
  const [query, setQuery] = useState("");
  const [selectedHeaderIndex, setSelectedHeaderIndex] = useState<number>(null);
  const [sortingByFixedTissue, setSortingByFixedTissue] = useState(false);
  const [sortingByGeneSymbol, setSortingByGeneSymbol] = useState(false);
  const [sort, setSort] = useState<"asc" | "desc" | "none">("none");

  const { data: histopathData, isFetching } = useQuery({
    queryKey: ["landing-pages", "histopath"],
    queryFn: () => fetchLandingPageData("histopathology_landing"),
    select: (response) => {
      const result = {};
      response.rows.forEach((geneRow) => {
        result[geneRow.markerSymbol] = {
          id: geneRow.markerSymbol,
          mgiAccession: geneRow.mgiGeneAccessionId,
          hasTissue: geneRow.hasTissue,
          allelesWithTissue: geneRow.allelesWithTissue,
          data: [],
        };
        result[geneRow.markerSymbol].data = response.columns.map(
          (header, headerIndex) => ({
            x: header,
            y: geneRow.significance[headerIndex],
            geneSymbol: geneRow.markerSymbol,
            headerIndex,
          }),
        );
        geneMap.set(geneRow.markerSymbol, result[geneRow.markerSymbol]);
      });
      return {
        heatmapData: Object.values(result) as Array<HeatmapData>,
        originalData: Object.values(result) as Array<HeatmapData>,
        columns: response.columns,
      };
    },
    placeholderData: { columns: [], rows: [] },
  });

  const getCellColor = (value: number) => {
    switch (value) {
      case 4:
        return "#ce6211";
      case 2:
        return "#17a2b8";
      case 0:
        return "#FFF";
    }
  };

  const rewriteWithQuery = (symbol: string) => {
    if (query) {
      const matchRegex = new RegExp(`(${query})`, "");
      return symbol.replace(matchRegex, `<em>${query}</em>`);
    }
    return symbol;
  };

  const openAllelePages = (gene: HeatmapData) => {
    const mgiID = gene.mgiAccession;
    gene.allelesWithTissue.forEach((allele) => {
      const alleleSymbol = allele.match(/\<(.+)\>/)[1];
      window.open(`/alleles/${mgiID}/${alleleSymbol}#mice`);
    });
  };

  const displayFixedTissueColumn = (gene: HeatmapData) => {
    if (gene.hasTissue && gene.allelesWithTissue.length === 1) {
      const mgiID = gene.mgiAccession;
      const allele = gene.allelesWithTissue[0].match(/\<(.+)\>/)[1];
      return (
        <a
          title="fixed tissue link"
          className="link primary"
          href={`/data/alleles/${mgiID}/${allele}#mice`}
        >
          Yes
        </a>
      );
    } else if (gene.hasTissue && gene.allelesWithTissue.length > 1) {
      return (
        <a className="link primary" onClick={() => openAllelePages(gene)}>
          Yes
        </a>
      );
    }
    return "No info";
  };

  const getNewSort = () => {
    let newSort: "asc" | "desc" | "none";
    if (sort === "asc") {
      newSort = "none";
    } else if (sort === "desc") {
      newSort = "asc";
    } else {
      newSort = "desc";
    }
    return newSort;
  };

  const sortByHeader = (index: number) => {
    let newSort = getNewSort();
    if (index !== selectedHeaderIndex) {
      newSort = "desc";
      setActivePage(0);
    }
    setSort(newSort);
    setSortingByFixedTissue(false);
    setSortingByGeneSymbol(false);
    setSelectedHeaderIndex(index);
  };

  const sortByFixedTissue = () => {
    let newSort = getNewSort();
    if (
      (selectedHeaderIndex !== null || sortingByGeneSymbol) &&
      !sortingByFixedTissue
    ) {
      newSort = "desc";
      setActivePage(1);
    }
    setSort(newSort);
    setSortingByGeneSymbol(false);
    setSortingByFixedTissue(true);
    setSelectedHeaderIndex(null);
  };

  const sortByGeneSymbol = () => {
    let newSort = getNewSort();
    if (
      (selectedHeaderIndex !== null || sortingByFixedTissue) &&
      !sortingByGeneSymbol
    ) {
      newSort = "desc";
      setActivePage(1);
    }
    setSort(newSort);
    setSortingByGeneSymbol(true);
    setSortingByFixedTissue(false);
    setSelectedHeaderIndex(null);
  };

  const sortedAndFilteredData = useMemo(() => {
    let results: Array<HeatmapData>;
    if (query) {
      results = histopathData.originalData.filter((gene) =>
        gene.id.includes(query),
      );
    } else {
      results = [...histopathData.originalData];
    }

    if (sort === "none") {
      return results;
    }

    if (selectedHeaderIndex) {
      results = results
        // merge all data in a single array
        .flatMap((item) => item.data)
        // get only the column we are interested
        .filter((item) => item.headerIndex === selectedHeaderIndex)
        .sort((item1, item2) => {
          if (sort === "desc") {
            return item2.y - item1.y;
          }
          return item1.y - item2.y;
        })
        // regenerate array with original info
        .map((gene) => ({ ...geneMap.get(gene.geneSymbol) }));
    } else if (sortingByFixedTissue) {
      results.sort((gene1, gene2) => {
        if (
          (gene1.hasTissue && gene2.hasTissue) ||
          (!gene1.hasTissue && !gene2.hasTissue)
        ) {
          return sort === "desc"
            ? gene1.id.localeCompare(gene2.id)
            : gene2.id.localeCompare(gene1.id);
        } else if (gene1.hasTissue && !gene2.hasTissue) {
          return sort === "desc" ? -1 : 1;
        } else if (!gene1.hasTissue && gene2.hasTissue) {
          return sort === "desc" ? 1 : -1;
        }
      });
    } else if (sortingByGeneSymbol) {
      results.sort((gene1, gene2) =>
        sort === "desc"
          ? gene1.id.localeCompare(gene2.id)
          : gene2.id.localeCompare(gene1.id),
      );
    }
    return results;
  }, [
    query,
    sort,
    histopathData,
    selectedHeaderIndex,
    sortingByFixedTissue,
    sortingByGeneSymbol,
  ]);

  const {
    paginatedData,
    activePage,
    pageSize,
    totalPages,
    setActivePage,
    setPageSize,
  } = usePagination<HeatmapData>(sortedAndFilteredData, 25);

  return (
    <>
      <Suspense>
        <Search />
      </Suspense>
      <Container className="page" style={{ lineHeight: 2 }}>
        <Card>
          <div className="subheading">
            <Breadcrumb>
              <Breadcrumb.Item active>Home</Breadcrumb.Item>
              <Breadcrumb.Item active>IMPC data collections</Breadcrumb.Item>
              <Breadcrumb.Item active>Histopathology Data</Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <h1 className="mb-4 mt-2">
            <strong>Histopathology Data</strong>
          </h1>
          <Container>
            <div>
              <p className="my-0">
                <b>Significance Score:</b>
              </p>
              <div>
                <div title="No Data" className={styles.labelContainer}>
                  <div
                    className={styles.heatmapLabel}
                    style={{ backgroundColor: "#FFF" }}
                  ></div>
                  <div>&nbsp;&nbsp;No Data</div>
                </div>
                <div title="Not Applicable" className={styles.labelContainer}>
                  <div
                    className={styles.heatmapLabel}
                    style={{ backgroundColor: "#808080" }}
                  ></div>
                  <div>&nbsp;&nbsp;Not Applicable</div>
                </div>
                <div title="Not Significant" className={styles.labelContainer}>
                  <div
                    className={styles.heatmapLabel}
                    style={{ backgroundColor: "#17a2b8" }}
                  ></div>
                  &nbsp;&nbsp;
                  <div>
                    <b>Not Significant</b>&nbsp;(histopathology finding that is
                    interpreted by the histopathologist to be within normal
                    limits of background strain-related findings or an
                    incidental finding not related to genotype)
                  </div>
                </div>
                <div title="Significant" className={styles.labelContainer}>
                  <div
                    className={styles.heatmapLabel}
                    style={{ backgroundColor: "#ce6211" }}
                  ></div>
                  &nbsp;&nbsp;
                  <div>
                    <b>Significant</b>&nbsp;(histopathology finding that is
                    interpreted by the histopathologist to not be a background
                    strain-related finding or an incidental finding)
                  </div>
                </div>
              </div>
            </div>
          </Container>
          <div className={styles.topControls}>
            <div>
              Gene search:
              <input
                className="form-control"
                title="gene search box"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div>
              Show
              <select
                name="pageSize"
                className="form-select"
                value={pageSize}
                onChange={(e) =>
                  setPageSize(Number.parseInt(e.target.value, 10))
                }
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              entries
            </div>
          </div>
          {isFetching ? (
            <div
              className="mt-4"
              style={{ display: "flex", justifyContent: "center" }}
            >
              <LoadingProgressBar />
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table
                className={`table table-striped table-bordered ${styles.heatMap}`}
              >
                <thead>
                  <tr>
                    <th
                      onClick={sortByGeneSymbol}
                      data-testid="gene-symbol-sort"
                    >
                      <div
                        className={styles.header}
                        style={{ marginRight: "5px" }}
                      >
                        Gene
                      </div>
                      <SortIndicator
                        sortStatus={sortingByGeneSymbol}
                        sort={sort}
                      />
                    </th>
                    <th onClick={sortByFixedTissue}>
                      <div
                        className={classNames(
                          styles.header,
                          styles.noTransform,
                        )}
                      >
                        Fixed tissue available *
                      </div>
                      <SortIndicator
                        sortStatus={sortingByFixedTissue}
                        sort={sort}
                      />
                    </th>
                    {histopathData.columns.map((header, index) => (
                      <th
                        key={header}
                        onClick={() => sortByHeader(index)}
                        data-testid={`${kebabCase(header)}-header`}
                      >
                        <div
                          className={classNames(styles.header, styles.top, {
                            [styles.eyeOpticNerveCol]:
                              header === "Eye with optic nerve",
                          })}
                        >
                          {header}
                        </div>
                        <SortIndicator
                          sortStatus={index === selectedHeaderIndex}
                          sort={sort}
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tfoot>
                  <tr>
                    <th>
                      <div className={styles.header}>Gene</div>
                    </th>
                    <th>
                      <div
                        className={classNames(
                          styles.header,
                          styles.noTransform,
                        )}
                      >
                        Fixed tissue available *
                      </div>
                    </th>
                    {histopathData.columns.map((header, index) => (
                      <th key={header} onClick={() => sortByHeader(index)}>
                        <div
                          className={classNames(styles.header, styles.bottom)}
                        >
                          {header}
                        </div>
                      </th>
                    ))}
                  </tr>
                </tfoot>
                <tbody>
                  {paginatedData.map((gene) => (
                    <tr key={gene.id} data-testid="result-rows">
                      <td className={styles.geneCell} data-testid="gene-symbol">
                        <i
                          dangerouslySetInnerHTML={{
                            __html: rewriteWithQuery(gene.id),
                          }}
                        ></i>
                      </td>
                      <td>{displayFixedTissueColumn(gene)}</td>
                      {gene &&
                        gene.data &&
                        gene.data.map((cell) => (
                          <td
                            className={styles.cellData}
                            key={`${gene.id}-${cell.x}`}
                            style={
                              {
                                "--bs-table-bg-type": getCellColor(cell.y),
                                cursor: cell.y > 0 ? "pointer" : "auto",
                              } as any
                            }
                            onClick={() => {
                              if (cell.y > 0) {
                                window.open(
                                  `/data/supporting-data/histopath/${
                                    gene.mgiAccession
                                  }?anatomy=${cell.x.toLowerCase()}`,
                                );
                              }
                            }}
                          />
                        ))}
                    </tr>
                  ))}
                  {paginatedData.length === 0 && (
                    <tr>
                      <td
                        colSpan={100}
                        style={{ fontSize: 20, fontWeight: "bold" }}
                      >
                        No results
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-1">
            <span>
              * This column is from data made available to us, send us a message
              to inquiry about genes with no fixed tissue from&nbsp;
              <Link
                className="link primary"
                href="http://www.mousephenotype.org/contact-us/"
              >
                our Contact page
              </Link>
            </span>
          </div>
          <div className="mt-1">
            {totalPages > 1 && (
              <PaginationControls
                currentPage={activePage}
                totalPages={totalPages}
                onPageChange={setActivePage}
                showEntriesInfo
                pageSize={pageSize}
              />
            )}
          </div>
        </Card>
      </Container>
    </>
  );
};

export default HistopathLandingPage;
