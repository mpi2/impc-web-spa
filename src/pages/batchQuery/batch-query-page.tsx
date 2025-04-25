"use client";

import Search from "@/components/Search";
import { Container, Form, Spinner, Tabs, Tab, Alert } from "react-bootstrap";
import {
  AlleleSymbol,
  Card,
  LoadingProgressBar,
  Pagination,
  SortableTable,
} from "@/components";
import {
  ChangeEvent,
  Suspense,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { groupBy, orderBy, uniq } from "lodash";
import { maybe } from "acd-utils";
import Link from "next/link";
import { BodySystem } from "@/components/BodySystemIcon";
import { allBodySystems, formatAlleleSymbol } from "@/utils";
import {
  initialState,
  reducer,
  toogleFlagPayload,
} from "@/utils/batchQuery/reducer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import { SortType } from "@/models";
import { Metadata } from "next";

const BATCH_QUERY_API_ROOT = process.env.NEXT_PUBLIC_BATCH_QUERY_API_ROOT || "";

type Phenotype = {
  id: string;
  name: string;
};

type BatchQueryItem = {
  alleleAccessionId: string;
  alleleName: string;
  alleleSymbol: string;
  dataType: string;
  displayPhenotype: Phenotype | null;
  effectSize: null | string;
  femaleMutantCount: number | null;
  hgncGeneAccessionId: string;
  humanGeneSymbol: string;
  humanPhenotypes: any[];
  id: string;
  intermediatePhenotypes: Phenotype[] | null;
  lifeStageName: string;
  maleMutantCount: number | null;
  metadataGroup: string;
  mgiGeneAccessionId: string;
  pValue: null | string;
  parameterName: string;
  parameterStableId: string;
  phenotypeSexes: string[] | null;
  phenotypingCentre: string;
  pipelineStableId: string;
  potentialPhenotypes: Phenotype[] | null;
  procedureMinAnimals: number | null;
  procedureMinFemales: number | null;
  procedureMinMales: number | null;
  procedureName: string;
  procedureStableId: string;
  projectName: string;
  significant: boolean;
  significantPhenotype: Phenotype | null;
  statisticalMethod: null | string;
  statisticalResultId: string;
  status: string;
  topLevelPhenotypes: Phenotype[] | null;
  zygosity: string;
};

type SortOptions = {
  prop: string | ((any) => void);
  order: "asc" | "desc";
};

const allOptions = allBodySystems.map((system) => ({
  value: system,
  label: system,
}));

const formatOptionLabel = ({ value, label }, { context }) => {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <BodySystem
        name={value}
        color="grey"
        noSpacing
        noMargin={context === "value"}
      />
      {context === "menu" && <span>{label}</span>}
    </div>
  );
};

const DataRow = ({ geneData }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr>
        <td>
          <Link className="link primary" href={`/genes/${geneData.geneId}`}>
            {geneData.geneId}
          </Link>
        </td>
        <td>{geneData.geneSymbol}</td>
        <td>{geneData.humanSymbols.join(",") || "info not available"}</td>
        <td>{geneData.humanGeneIds.join(",") || "info not available"}</td>
        <td>{geneData.allPhenotypes.length}</td>
        <td>{geneData.allSigSystems.length}</td>
        <td>
          <button className="btn" onClick={() => setOpen(!open)}>
            {open ? "Close" : "View"}&nbsp;
            <FontAwesomeIcon
              className="link"
              icon={open ? faChevronUp : faChevronDown}
            />
          </button>
        </td>
      </tr>
      {open && (
        <tr>
          <td></td>
          <td colSpan={6} style={{ padding: 0 }}>
            <SortableTable
              withMargin={false}
              headers={[
                {
                  width: 1,
                  label: "Allele symbol",
                  field: "allele",
                  disabled: true,
                },
                {
                  width: 2,
                  label: "Significant systems",
                  field: "significantSystems",
                  disabled: true,
                },
                {
                  width: 1,
                  label: "# of significant phenotypes",
                  field: "significantPhenotypes",
                  disabled: true,
                },
              ]}
            >
              {geneData.alleles.map((alleleData) => {
                return (
                  <tr>
                    <td>
                      <Link
                        className="link primary"
                        href={`alleles/${geneData.geneId}/${
                          formatAlleleSymbol(alleleData.allele)[1]
                        }`}
                      >
                        <AlleleSymbol
                          symbol={alleleData.allele}
                          withLabel={false}
                        />
                      </Link>
                    </td>
                    <td>
                      {alleleData.significantSystems.map((system, index) => (
                        <BodySystem
                          key={index}
                          name={system}
                          color="system-icon in-table"
                          noSpacing
                        />
                      ))}
                    </td>
                    <td>{alleleData.significantPhenotypes.length}</td>
                  </tr>
                );
              })}
            </SortableTable>
          </td>
        </tr>
      )}
    </>
  );
};

export const metadata: Metadata = {
  title:
    "IMPC dataset batch query | International Mouse Phenotyping Consortium",
};

const BatchQueryPage = () => {
  const [geneIds, setGeneIds] = useState<string>(undefined);
  const [file, setFile] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [selectedSystems, setSelectedSystems] = useState([]);
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    prop: "geneSymbol",
    order: "asc" as const,
  });
  const [tab, setTab] = useState("paste-your-list");
  const defaultSort: SortType = useMemo(() => ["geneSymbol", "asc"], []);
  const downloadButtonIsBusy =
    state.isBusyJSON || state.isBusyTSV || state.isBusyXLSX;

  const geneIdArray = useMemo(() => {
    const regex = /(MGI:\d+),?/g;
    return [...(geneIds?.matchAll(regex) || [])].map((res) => res[1]);
  }, [geneIds]);

  useEffect(() => {
    // case 1: user updated input (list or file)
    if ((!!geneIds || !!file) && formSubmitted === true) {
      setFormSubmitted(false);
    }
  }, [geneIds, formSubmitted, file]);

  const getBody = () => {
    let body;
    if (tab === "upload-your-list") {
      const data = new FormData();
      data.append("file", file);
      body = data;
    } else {
      body = JSON.stringify({ mgi_ids: geneIdArray });
    }
    return body;
  };

  const { data: results, isFetching } = useQuery({
    queryKey: ["batch-query", geneIdArray, file, tab],
    queryFn: () => {
      const headers = new Headers();
      headers.append("Accept", "application/json");
      if (tab === "paste-your-list") {
        headers.append("Content-Type", "application/json");
      }
      const body = getBody();

      return fetch(BATCH_QUERY_API_ROOT, {
        method: "POST",
        body,
        headers,
      }).then((res) => res.json());
    },
    enabled:
      (geneIdArray.length > 0 || !!file) &&
      !!formSubmitted &&
      !downloadButtonIsBusy,
    select: (data: Array<BatchQueryItem>) => {
      const results = {};
      const resultsByGene = groupBy(data, "id");
      for (const [geneId, geneData] of Object.entries(resultsByGene)) {
        const geneSymbol = geneData[0]?.alleleSymbol.split("<")[0];
        const resultsByAllele = groupBy(geneData, "alleleSymbol");
        const sigSystemsSet = new Set<string>();
        const sigPhenotypesSet = new Set<string>();
        const lifeStagesSet = new Set<string>();
        results[geneSymbol] = {
          humanSymbols: uniq(geneData.map((d) => d.humanGeneSymbol)),
          humanGeneIds: uniq(geneData.map((d) => d.hgncGeneAccessionId)),
          geneId,
          allSigSystems: [],
          allPhenotypes: [],
          allSigLifeStages: [],
          alleles: [],
        };
        for (const [allele, alleleData] of Object.entries(resultsByAllele)) {
          const significantData = alleleData.filter(
            (d) => d.significant === true,
          );
          const restOfData = alleleData.filter((d) => d.significant === false);
          const getSigPhenotypeNames = (data: Array<BatchQueryItem>) => {
            return data
              .map((d) =>
                maybe(d.significantPhenotype)
                  .map((p) => p.name)
                  .getOrElse(undefined),
              )
              .filter(Boolean);
          };
          const getTopLevelPhenotypeNames = (data: Array<BatchQueryItem>) => {
            return data
              .flatMap((d) =>
                maybe(d.topLevelPhenotypes)
                  .map((systems) => systems.map((s) => s.name))
                  .getOrElse(undefined),
              )
              .filter(Boolean);
          };
          const alleleSigPhenotypes = uniq(
            getSigPhenotypeNames(significantData),
          );
          const alleleSigSystems = uniq(
            getTopLevelPhenotypeNames(significantData),
          );
          const alleleSigLifeStages = uniq(
            significantData.map((d) => d.lifeStageName),
          );

          alleleSigPhenotypes.forEach((p) => sigPhenotypesSet.add(p));
          alleleSigSystems.forEach((s) => sigSystemsSet.add(s));
          alleleSigLifeStages.forEach((l) => lifeStagesSet.add(l));

          results[geneSymbol].alleles.push({
            significantPhenotypes: alleleSigPhenotypes,
            otherPhenotypes: uniq(getSigPhenotypeNames(restOfData)),
            significantLifeStages: alleleSigLifeStages,
            significantSystems: alleleSigSystems,
            otherSystems: uniq(getTopLevelPhenotypeNames(restOfData)),
            allele,
          });
        }
        results[geneSymbol].allSigSystems = [...sigSystemsSet];
        results[geneSymbol].allPhenotypes = [...sigPhenotypesSet];
        results[geneSymbol].allPhenotypes = [...sigPhenotypesSet];
        results[geneSymbol].alleles.sort(
          (a1, a2) =>
            a2.significantPhenotypes.length - a1.significantPhenotypes.length,
        );
      }
      return Object.entries(results).map(([geneSymbol, geneData]) => {
        return {
          geneSymbol,
          ...(geneData as any),
        };
      });
    },
  });

  const fetchAndDownloadData = async (payload: toogleFlagPayload) => {
    if (geneIdArray?.length > 0 || !!file) {
      const headers = new Headers();
      headers.append("Accept", payload.toLowerCase());
      if (tab === "paste-your-list") {
        headers.append("Content-Type", "application/json");
      }
      dispatch({ type: "toggle", payload });
      const body = getBody();
      const resp = await fetch(BATCH_QUERY_API_ROOT, {
        method: "POST",
        body,
        headers,
      });
      const blob = await resp.blob();
      const objUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", objUrl);
      link.setAttribute("download", "batch-query-data-" + payload);
      link.click();
      URL.revokeObjectURL(objUrl);
      dispatch({ type: "toggle", payload });
    }
  };

  const downloadButtons = useMemo(
    () => [
      {
        key: "JSON",
        isBusy: state.isBusyJSON,
        toogleFlag: () => fetchAndDownloadData("application/JSON"),
      },
    ],
    [state, geneIds, file, tab],
  );

  const updateSelectedSystems = (selectedOptions) => {
    setSelectedSystems(selectedOptions.map((opt) => opt.value));
  };

  const filteredData = useMemo(() => {
    return selectedSystems.length
      ? results.filter((gene) =>
          selectedSystems.every((system) =>
            gene.allSigSystems.includes(system),
          ),
        )
      : results;
  }, [selectedSystems, results]);

  const sortedData = orderBy(filteredData, sortOptions.prop, sortOptions.order);

  return (
    <>
      <Suspense>
        <Search />
      </Suspense>
      <Container className="page">
        <Card>
          <h1 className="mb-4 mt-2">
            <strong>IMPC Dataset Batch Query</strong>
          </h1>
          <Tabs className="mt-4" onSelect={(e) => setTab(e)}>
            <Tab eventKey="paste-your-list" title="Paste your list">
              <Form className="mt-3">
                <Form.Group>
                  <Form.Label>
                    <strong>List of ID's</strong>
                  </Form.Label>
                  <br />
                  <Form.Text className="text-muted">
                    Please format your list like this: MGI:104785,MGI:97591
                  </Form.Text>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    onChange={(e) => setGeneIds(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </Tab>
            <Tab eventKey="upload-your-list" title="Upload your list from file">
              <Form className="mt-3">
                <Form.Group controlId="formFile" className="mb-3">
                  <Form.Label>
                    Supports new line separated identifier list. Please DO NOT
                    submit a mix of identifiers from different datatypes.
                  </Form.Label>
                  <Form.Control
                    type="file"
                    accept="text/plain"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFile(e.currentTarget.files[0])
                    }
                  />
                </Form.Group>
              </Form>
            </Tab>
          </Tabs>
          <div className="mt-4">
            {formSubmitted && (geneIdArray?.length === 0 || file === null) && (
              <Alert variant="warning">Please enter a list of ID's</Alert>
            )}
            {geneIdArray?.length >= 1000 && (
              <Alert variant="warning">
                If your list exceeds 1,000 Ids, please save them in a text file
                and upload it.
              </Alert>
            )}
            <button
              onClick={() => setFormSubmitted(true)}
              className="btn impc-primary-button"
              disabled={
                isFetching ||
                downloadButtonIsBusy ||
                geneIdArray?.length >= 1000
              }
            >
              Submit
            </button>
          </div>
        </Card>
        <Card>
          <h2>Results</h2>
          {isFetching && (
            <div
              className="mt-4"
              style={{ display: "flex", justifyContent: "center" }}
            >
              <LoadingProgressBar />
            </div>
          )}
          {!!filteredData ? (
            <>
              <div>
                <span className="small grey">
                  Filter genes by physiological system&nbsp;
                </span>
                <Select
                  isMulti
                  options={allOptions}
                  formatOptionLabel={formatOptionLabel}
                  onChange={updateSelectedSystems}
                />
              </div>
              {!!sortedData.length ? (
                <>
                  {!!selectedSystems.length && (
                    <div className="mt-3">
                      <b className="small grey">
                        Showing {sortedData?.length || 0} result(s) of&nbsp;
                        {results?.length || 0}
                      </b>
                    </div>
                  )}
                  <Pagination
                    data={sortedData}
                    topControlsWrapperCSS={{ marginTop: "1rem" }}
                  >
                    {(pageData) => (
                      <SortableTable
                        defaultSort={defaultSort}
                        doSort={(sort) =>
                          setSortOptions({ prop: sort[0], order: sort[1] })
                        }
                        headers={[
                          {
                            width: 1,
                            label: "MGI accession id",
                            field: "geneId",
                          },
                          {
                            width: 1,
                            label: "Marker symbol",
                            field: "geneSymbol",
                          },
                          {
                            width: 1,
                            label: "Human gene symbol",
                            field: "humanSymbols",
                          },
                          {
                            width: 1,
                            label: "Human gene id",
                            field: "humanGeneIds",
                          },
                          {
                            width: 1,
                            label: "# of significant phenotypes",
                            field: "allPhenotypes",
                          },
                          {
                            width: 1,
                            label: "# of systems impacted",
                            field: "allSigSystems",
                          },
                          {
                            width: 1,
                            label: "View allele info",
                            disabled: true,
                          },
                        ]}
                      >
                        {pageData.map((geneData) => (
                          <DataRow geneData={geneData} />
                        ))}
                      </SortableTable>
                    )}
                  </Pagination>
                  <div>
                    <div
                      className="grey"
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center",
                      }}
                    >
                      {downloadButtons.map((button) => (
                        <button
                          key={button.key}
                          className="btn impc-secondary-button small"
                          onClick={button.toogleFlag}
                          disabled={button.isBusy}
                        >
                          {button.isBusy ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faDownload} size="sm" />
                              {button.key}
                            </>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <h3 className="mt-3">No genes match the filters selected</h3>
              )}
            </>
          ) : !isFetching ? (
            <i className="grey">
              Data will appear here after clicking the submit button.
            </i>
          ) : null}
        </Card>
      </Container>
    </>
  );
};

export default BatchQueryPage;
