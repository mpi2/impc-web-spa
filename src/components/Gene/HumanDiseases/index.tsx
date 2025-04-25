import {
  faChevronDown,
  faChevronUp,
  faCircleQuestion,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { orderBy } from "lodash";
import React, {
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, Overlay, Spinner, Tab, Tabs, Tooltip } from "react-bootstrap";
import styles from "./styles.module.scss";
import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/api-service";
import { GeneDisease } from "@/models/gene";
import { sectionWithErrorBoundary } from "@/hoc/sectionWithErrorBoundary";
import {
  Card,
  DownloadData,
  Pagination,
  SectionHeader,
  SortableTable,
} from "@/components";
import { isIframeLoaded } from "@/utils";
import { SortType } from "@/models";
import Link from "next/link";
import { GeneContext } from "@/contexts";
import Skeleton from "react-loading-skeleton";

type ScaleProps = {
  children: number;
  toggleFocus: (newValue: boolean) => void;
};
type Ref = HTMLDivElement;

const Scale = forwardRef<Ref, ScaleProps>((props: ScaleProps, ref) => {
  const { children = 5, toggleFocus } = props;
  return (
    <div
      ref={ref}
      className={styles.scale}
      onMouseOver={() => toggleFocus(true)}
      onMouseLeave={() => toggleFocus(false)}
    >
      {Array.from(Array(5).keys())
        .map((n) => n + 1)
        .map((n) => (
          <span key={n} className={n <= children ? styles.selected : ""} />
        ))}
    </div>
  );
});

type PhenoGridElProps = {
  rowDiseasePhenotypes: string | Array<string>;
  data: Array<GeneDisease>;
};

const PhenoGridEl = ({ rowDiseasePhenotypes, data }: PhenoGridElProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setiFrameHeight] = useState(400);

  const processPhenotypes = (phenotypeString: string | Array<string>) => {
    const data =
      typeof phenotypeString === "string"
        ? phenotypeString.split(",")
        : phenotypeString;
    return (
      data?.map((x) => {
        const processed = x.replace(" ", "**").split("**");
        return {
          id: processed[0],
          term: processed[1],
        };
      }) ?? []
    );
  };

  // Process individual disease phenotypes and mouse phenotypes
  const diseasePhenotypes = processPhenotypes(rowDiseasePhenotypes);

  // Process mouse phenotypes for each object in data
  // Filter out results with a pd score of 0
  const objectSets = data
    .filter(({ phenodigmScore }) => phenodigmScore > 0)
    .map(({ modelPhenotypes, modelDescription, phenodigmScore }) => {
      const mousePhenotypes = processPhenotypes(modelPhenotypes);
      const id = modelDescription;
      const label = `${phenodigmScore.toFixed(2)}-${id}`;
      const phenotypes = mousePhenotypes.map((item) => item.id);

      // Create the object where the data will be stored
      return {
        id: id,
        label: label,
        phenotypes: phenotypes,
      };
    });

  // Adjust iframeHeight based on the number of disease phenotypes (y-axis)

  useEffect(() => {
    // Display of the iframe seems good at 5 phenotypes so we set that as a baseline
    const phenotypeDisplayThreshold = 5;
    if (
      diseasePhenotypes.length > phenotypeDisplayThreshold &&
      iframeHeight <= 400
    ) {
      const heightIncreaseFactor =
        (diseasePhenotypes.length / phenotypeDisplayThreshold) * 100;
      setiFrameHeight((prevHeight) => prevHeight + heightIncreaseFactor);
      // Reset height to initial size if below threshold
    } else if (
      diseasePhenotypes.length <= phenotypeDisplayThreshold &&
      iframeHeight !== 400
    ) {
      setiFrameHeight(400);
    }
  }, [diseasePhenotypes.length]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      isIframeLoaded(iframe)
        .then(() => {
          console.log("Iframe loaded successfully");

          setTimeout(() => {
            const subjects = diseasePhenotypes.map((item) => item.id);
            iframe.contentWindow?.postMessage(
              {
                subjects: subjects,
                "object-sets": objectSets,
              },
              "https://monarchinitiative.org",
            );

            console.log("Message sent with a dealy of 0.5s");
          }, 500);
        })
        .catch((error) => {
          console.error("Error loading iframe or sending message:", error);
        });
    }

    const handleMessage = (event: MessageEvent) => {
      const { width, height } = event.data;
      if (!iframe) return;

      // Set the iframe to fill its container
      iframe.style.width = "100%";
      iframe.style.height = "1000px";

      // // But never bigger than its contents
      iframe.style.maxWidth = `${width}px`;
      iframe.style.maxHeight = `${iframeHeight}px`;
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [diseasePhenotypes]);

  return (
    <tr>
      <td colSpan={6}>
        <div
          style={{
            width: "100%",
            height: `${iframeHeight}px`,
            overflow: "hidden",
          }}
        >
          <iframe
            ref={iframeRef}
            name="pheno-multi"
            title="MultiCompare Phenogrid"
            src="https://monarchinitiative.org/phenogrid-multi-compare"
            allow="clipboard-write"
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        </div>
      </td>
    </tr>
  );
};

type RowProps = {
  rowData: GeneDisease;
  data: Array<GeneDisease>;
  isLoading: boolean;
};

const Row = ({ rowData, data, isLoading }: RowProps) => {
  const [open, setOpen] = useState(false);
  const [tooltipShow, setTooltipShow] = useState(false);
  const tooltipRef = useRef(null);

  return (
    <>
      <tr>
        <td>
          <strong className={styles.link}>{rowData.diseaseTerm}</strong>
        </td>
        <td>
          <a
            href={`http://omim.org/entry/${rowData.diseaseId.split(":")[1]}`}
            target="_blank"
            className="link primary"
            title={`view ${rowData.diseaseTerm} details in OMIM website`}
          >
            {rowData.diseaseId}{" "}
            <FontAwesomeIcon
              className="grey"
              size="xs"
              icon={faExternalLinkAlt}
            />
          </a>
        </td>
        <td>
          <Scale ref={tooltipRef} toggleFocus={setTooltipShow}>
            {Math.round((rowData.phenodigmScore / 100) * 5)}
          </Scale>
          <Overlay
            target={tooltipRef.current}
            show={tooltipShow}
            placement="top"
          >
            {(props) => (
              <Tooltip
                id={`${rowData.mgiGeneAccessionId}-${rowData.diseaseId}`}
                {...props}
              >
                Phenodigm score: {rowData.phenodigmScore.toFixed(2)}%
              </Tooltip>
            )}
          </Overlay>
        </td>
        <td>
          {rowData?.diseaseMatchedPhenotypes
            ?.split(",")
            .map((x) => x.replace(" ", "**").split("**")[1])
            .join(", ")}
        </td>
        <td>
          {isLoading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <button className="btn link" onClick={() => setOpen(!open)}>
              <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} />
            </button>
          )}
        </td>
      </tr>
      {open && (
        <PhenoGridEl
          rowDiseasePhenotypes={rowData.diseasePhenotypes}
          data={data}
        />
      )}
    </>
  );
};

type HumanDiseasesProps = {
  initialData: Array<GeneDisease>;
};

const HumanDiseases = ({ initialData }: HumanDiseasesProps) => {
  const gene = useContext(GeneContext);
  const defaultSort: SortType = useMemo(() => ["phenodigmScore", "desc"], []);
  const [sort, setSort] = useState<SortType>(defaultSort);
  const tableColumns = useMemo(
    () => [
      { width: 5, label: "Disease", field: "diseaseTerm" },
      { width: 1.5, label: "Source", field: "diseaseId" },
      {
        width: 2.5,
        label: "Similarity of phenotypes",
        field: "phenodigmScore",
        extraContent: (
          <>
            <Link
              href="https://www.mousephenotype.org/help/data-visualization/gene-pages/disease-models/"
              className="btn"
              aria-label="Human diseases documentation"
              style={{ paddingTop: 0, paddingBottom: 0 }}
            >
              <FontAwesomeIcon icon={faCircleQuestion} size="xl" />
            </Link>
          </>
        ),
      },
      {
        width: 3,
        label: "Matching phenotypes",
        field: "diseaseMatchedPhenotypes",
      },
      { width: 1, label: "Expand", disabled: true },
    ],
    [],
  );

  const {
    isFetching: associatedLoading,
    isError: associatedIsError,
    data: associatedDiseases,
  } = useQuery<Array<GeneDisease>>({
    queryKey: ["genes", gene.mgiGeneAccessionId, "disease", true],
    queryFn: () =>
      fetchAPI(
        `/api/v1/genes/${gene.mgiGeneAccessionId}/disease/json?associationCurated=true`,
      ),
    enabled: !!gene.mgiGeneAccessionId,
    placeholderData: [],
  });

  const {
    isFetching: predictedLoading,
    isError: predictedIsError,
    data: predictedDiseases,
  } = useQuery<Array<GeneDisease>>({
    queryKey: ["genes", gene.mgiGeneAccessionId, "disease", false],
    queryFn: () =>
      fetchAPI(
        `/api/v1/genes/${gene.mgiGeneAccessionId}/disease/json?associationCurated=false`,
      ),
    enabled: !!gene.mgiGeneAccessionId,
    placeholderData: [],
  });

  const [tab, setTab] = useState("associated");

  const fullData = useMemo(
    () => associatedDiseases?.concat(predictedDiseases ?? []) ?? [],
    [associatedDiseases, predictedDiseases],
  );

  const uniqueAssociatedDiseases = useMemo(
    () => [...new Set(associatedDiseases?.map((x) => x.diseaseId))],
    [associatedDiseases],
  );

  const uniquePredictedDiseases = useMemo(
    () => [...new Set(predictedDiseases?.map((x) => x.diseaseId))],
    [predictedDiseases],
  );

  const visibleData = useMemo(() => {
    const selectedData =
      tab === "associated" ? associatedDiseases : predictedDiseases;
    const filteredData = selectedData?.filter((d) => d.isMaxPhenodigmScore);
    return orderBy(filteredData, sort[0], sort[1]);
  }, [sort, associatedDiseases, predictedDiseases, tab]);

  if (associatedIsError && predictedIsError) {
    return (
      <Card id="human-diseases">
        <SectionHeader
          containerId="#human-diseases"
          title={`Human diseases caused by <i>${gene.geneSymbol}</i> mutations`}
        />
        <Alert variant="primary">No data available for this section</Alert>
      </Card>
    );
  }

  const shouldDisplayLoading =
    (tab === "associated" && associatedLoading) ||
    (tab === "predicted" && predictedLoading);

  return (
    <Card id="human-diseases">
      <SectionHeader
        containerId="#human-diseases"
        title={`Human diseases caused by <i>${gene.geneSymbol}</i> mutations`}
      />
      <div className="mb-4">
        <p>
          The analysis uses data from IMPC, along with published data on other
          mouse mutants, in comparison to human disease reports in OMIM,
          Orphanet, and DECIPHER.
        </p>
        <p>
          Phenotype comparisons summarize the similarity of mouse phenotypes
          with human disease phenotypes.
        </p>
      </div>
      <Tabs defaultActiveKey="associated" onSelect={(e) => setTab(e as string)}>
        <Tab
          eventKey="associated"
          title={
            <>
              Human diseases associated with <i>{gene.geneSymbol}</i> (
              {associatedLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                uniqueAssociatedDiseases.length
              )}
              )
            </>
          }
        ></Tab>
        <Tab
          eventKey="predicted"
          title={
            <>
              Human diseases predicted to be associated with{" "}
              <i>{gene.geneSymbol}</i> (
              {predictedLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                uniquePredictedDiseases.length
              )}
              )
            </>
          }
        ></Tab>
      </Tabs>
      {!visibleData.length && !shouldDisplayLoading ? (
        <Alert className="mt-3" variant="primary">
          No data available for this section.
        </Alert>
      ) : (
        <Pagination
          data={visibleData}
          additionalBottomControls={
            <DownloadData<GeneDisease>
              data={fullData}
              fileName={`${gene.geneSymbol}-associated-diseases`}
              fields={[
                { key: "diseaseTerm", label: "Disease" },
                { key: "phenodigmScore", label: "Phenodigm Score" },
                {
                  key: "diseaseMatchedPhenotypes",
                  label: "Matching phenotypes",
                },
                {
                  key: "diseaseId",
                  label: "Source",
                  getValueFn: (item) =>
                    `https://omim.org/entry/${item.diseaseId.replace(
                      "OMIM:",
                      "",
                    )}`,
                },
                {
                  key: "associationCurated",
                  label: "Gene association",
                  getValueFn: (item) =>
                    item.associationCurated ? "Curated" : "Predicted",
                },
                { key: "modelDescription", label: "Model description" },
                {
                  key: "modelGeneticBackground",
                  label: "Model genetic background",
                },
                {
                  key: "modelMatchedPhenotypes",
                  label: "Model matched phenotypes",
                },
              ]}
            />
          }
        >
          {(pageData) => (
            <SortableTable
              doSort={setSort}
              defaultSort={defaultSort}
              headers={tableColumns}
            >
              {pageData.map((d) => (
                <Row
                  key={`${d.diseaseId}-${d.mgiGeneAccessionId}-${d.phenodigmScore}`}
                  rowData={d}
                  data={fullData.filter(
                    (diseaseModel) => d.diseaseId == diseaseModel.diseaseId,
                  )}
                  isLoading={predictedLoading}
                />
              ))}
              {pageData.length === 0 && shouldDisplayLoading && (
                <tr>
                  {tableColumns.map((_, index) => (
                    <td key={index}>
                      <Skeleton />
                    </td>
                  ))}
                </tr>
              )}
            </SortableTable>
          )}
        </Pagination>
      )}
    </Card>
  );
};

export default sectionWithErrorBoundary(
  HumanDiseases,
  "Human diseases",
  "human-diseases",
);
