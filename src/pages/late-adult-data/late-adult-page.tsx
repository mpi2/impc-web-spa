"use client";

import {
  Breadcrumb,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
} from "react-bootstrap";
import { useQuery } from "@tanstack/react-query";
import { fetchLandingPageData } from "@/api-service";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import {
  LateAdultHeatmap,
  Search,
  Card,
  PaginationControls,
} from "@/components";
import {
  LateAdultDataResponse,
  LateAdultDataParsed,
  LateAdultRowResponse,
} from "@/models";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { usePagination } from "@/hooks";
import { Metadata } from "next";

type AllGeneList = Array<LateAdultRowResponse>;

const dataMap = {
  "Acoustic Startle and Pre-pulse Inhibition (PPI)":
    "acoustic_startle_and_pre_pulse_inhibition_ppi_data",
  "Auditory Brain Stem Response": "auditory_brain_stem_response_data",
  "Body Composition (DEXA lean/fat)": "body_composition_dexa_lean_fat_data",
  "Body Surface Temperature": "body_surface_temperature_data",
  "Body Weight": "body_weight_data",
  "Clinical Chemistry": "clinical_chemistry_data",
  "Combined SHIRPA and Dysmorphology": "combined_shirpa_and_dysmorphology_data",
  Dysmorphology: "dysmorphology_data",
  Echo: "echo_data",
  "Electrocardiogram (ECG)": "electrocardiogram_ecg_data",
  "Electroretinography 3": "electroretinography_3_data",
  "Eye Morphology": "eye_morphology_data",
  "Fear Conditioning": "fear_conditioning_data",
  "Grip Strength": "grip_strength_data",
  "Gross Pathology and Tissue Collection":
    "gross_pathology_and_tissue_collection_data",
  "Heart Weight": "heart_weight_data",
  Hematology: "hematology_data",
  Histopathology: "histopathology_data",
  "Hole-board Exploration": "hole_board_exploration_data",
  "Hot Plate": "hot_plate_data",
  Immunophenotyping: "immunophenotyping_data",
  "Indirect Calorimetry": "indirect_calorimetry_data",
  "Insulin Blood Level": "insulin_blood_level_data",
  "Intraperitoneal glucose tolerance test (IPGTT)":
    "intraperitoneal_glucose_tolerance_test_ipgtt_data",
  "Light-Dark Test": "light_dark_test_data",
  Minispec: "minispec_data",
  OCT: "oct_data",
  "Open Field": "open_field_data",
  "Open Field - centre start": "open_field_centre_start_data",
  "Organ Weight": "organ_weight_data",
  Rotarod: "rotarod_data",
  SHIRPA: "shirpa_data",
  Scheimpflug: "scheimpflug_data",
  "Shock Threshold": "shock_threshold_data",
  "Tissue Embedding and Block Banking":
    "tissue_embedding_and_block_banking_data",
  "Transepidermal water loss": "transepidermal_water_loss_data",
  "Virtual Drum": "virtual_drum_data",
  "X-ray": "x_ray_data",
  "Y-maze": "y_maze_data",
};

const transformData = (
  columns: Array<string>,
  columnsData: Array<Array<number>>,
) => {
  return columns.map((col, colIndex) => ({
    bin: colIndex,
    column: col,
    bins: columnsData
      .map((significanceArr) => significanceArr[colIndex])
      .map((significance, index) => ({ bin: index, count: significance })),
  }));
};

const LateAdultDataPage = () => {
  const [selectedParam, setSelectedParam] = useState<string>(undefined);
  const [genes, setGenes] = useState<AllGeneList>([]);
  const [geneQuery, setGeneQuery] = useState<string>(undefined);

  const genesFiltered = useMemo(() => {
    return !!geneQuery
      ? genes.filter((g) =>
          g.markerSymbol.toLowerCase().includes(geneQuery.toLowerCase()),
        )
      : genes;
  }, [genes, geneQuery]);

  const {
    paginatedData: paginatedGenes,
    activePage,
    totalPages,
    pageSize,
    setActivePage,
    setPageSize,
  } = usePagination(genesFiltered, 25);

  const { data: allProd } = useQuery({
    queryKey: ["late-adult-heatmap", "all-procedures"],
    queryFn: () =>
      fetchLandingPageData("late_adult_landing/procedure_level_data"),
    select: (data: LateAdultDataResponse) => {
      const columns = data.columns;
      const filteredData = !!geneQuery
        ? data.rows.filter((g) =>
            g.markerSymbol.toLowerCase().includes(geneQuery.toLowerCase()),
          )
        : data.rows;
      const allColumnsData = filteredData.map((row) => row.significance);
      const result = transformData(columns, allColumnsData);
      return {
        columns,
        data: result,
        rows: data.rows,
      } as LateAdultDataParsed & { rows: Array<LateAdultRowResponse> };
    },
    placeholderData: () => ({ columns: [], rows: [], numOfRows: 0 }),
  });

  useEffect(() => {
    if (!!allProd.rows.length && genes.length !== allProd.rows.length) {
      setGenes(allProd.rows.map(({ significance, ...rest }) => rest));
    }
  }, [allProd.rows.length]);

  const { data: prodData, isFetching: isFetchingParamData } = useQuery({
    queryKey: ["late-adult-heatmap", dataMap[selectedParam]],
    queryFn: () =>
      fetchLandingPageData(`late_adult_landing/${dataMap[selectedParam]}`),
    enabled: !!selectedParam && !!genes,
    select: (data: LateAdultDataResponse) => {
      const columns = data.columns;
      const emptySig = data.columns.map(() => 0);
      const filteredGenes = !!geneQuery
        ? genes.filter((g) =>
            g.markerSymbol.toLowerCase().includes(geneQuery.toLowerCase()),
          )
        : genes;
      const columnsData = filteredGenes.map((gene) => {
        const prodData = data.rows.find(
          (row) => row.mgiGeneAccessionId === gene.mgiGeneAccessionId,
        );
        return !!prodData ? prodData.significance : emptySig;
      });
      const result = transformData(columns, columnsData);
      return {
        columns,
        data: result,
      } as LateAdultDataParsed;
    },
    placeholderData: () => ({ columns: [], rows: [], numOfRows: 0 }),
  });

  const paginatedData = useMemo(() => {
    const selectedData = !!selectedParam ? prodData : allProd;
    const slicedData = selectedData.data.map((colData) => {
      return {
        ...colData,
        bins: colData.bins.slice(
          activePage * pageSize,
          (activePage + 1) * pageSize,
        ),
      };
    });
    return {
      columns: selectedData.columns,
      data: slicedData,
    } as LateAdultDataParsed;
  }, [selectedParam, prodData, allProd, activePage, pageSize]);

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
              <Breadcrumb.Item active>Late Adult Data</Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <h1 className="mb-4 mt-2">
            <strong>Late adult data</strong>
          </h1>
          <Container>
            <Row>
              <Col xs={12}>
                <p>
                  In a global effort to understand gene function, the IMPC is
                  collecting phenotype data of knockout mice at the{" "}
                  <strong>
                    embryo, early adult and late adult life stages
                  </strong>
                  . Selected mouse lines enter the{" "}
                  <strong>ageing pipeline</strong>, in which specimens are aged
                  to see gene knockout effects later in life.
                </p>
              </Col>
            </Row>
            <Row className="mt-4">
              <Col>
                <p>
                  Phenotype data is collected following standardized phenotyping
                  pipelines, as described in&nbsp;
                  <a
                    className="link primary"
                    href="https://www.mousephenotype.org/impress"
                  >
                    IMPReSS
                  </a>
                  , which determines what procedures are performed, how and
                  when. The&nbsp;
                  <a
                    className="link primary"
                    href="https://www.mousephenotype.org/understand/the-data/"
                  >
                    Late Adult pipeline
                  </a>
                  is based on the Early Adult pipeline, with exclusion of some
                  procedures. For example, hearing based tests can be excluded
                  due to deafness in the baseline. The testing for the Late
                  Adult pipeline starts at <strong>52 weeks or later</strong>.
                  An “early adult” specimen is less than 16 weeks of age, a
                  “middle aged adult” comprises mice between 16 and 48 weeks of
                  age, and a “late adult” is more than 48 weeks of age. A
                  description of all pipelines can be found here.
                </p>
              </Col>
            </Row>
            <Row className="mt-4">
              <Col>
                <p>
                  The diagram below shows{" "}
                  <strong>
                    all mouse lines for which the IMPC has collected ageing data
                    up to now
                  </strong>
                  . You can scroll down or use the box on the right-hand side to
                  look for a gene of interest. Clicking on the procedure name
                  changes the diagram view to show the underlying parameters,
                  and you can return to the default view by clicking on the
                  header. Clicking on a cell opens up the{" "}
                  <strong>“All data table” in the Gene page</strong>, filtered
                  for the selected late adult procedure or parameter, in order
                  to view the underlying data and the statistical tests that
                  were applied.
                </p>
              </Col>
            </Row>
            <Row className="mt-4">
              <Col>
                <p>
                  IMPC uses most recently <strong>approved gene symbols</strong>
                  . The search box above supports gene synonyms, MGI
                  identifiers, and human gene symbols. Please use it to find
                  most recent mouse gene symbols.
                </p>
              </Col>
            </Row>
            <div className="mt-4">
              <h3>IMPC Late adult heat map</h3>
              <Row>
                <Col xs={4}>
                  <InputGroup>
                    <InputGroup.Text id="gene-filter">
                      Filter by gene symbol
                    </InputGroup.Text>
                    <Form.Control
                      id="gene-control"
                      aria-describedby="gene-filter"
                      value={geneQuery}
                      onChange={(e) => setGeneQuery(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col xs={{ span: 5, offset: 3 }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span
                      style={{
                        backgroundColor: "#ececec",
                        border: "solid 1px black",
                        width: "20px",
                        height: "20px",
                        display: "inline-block",
                      }}
                    />
                    &nbsp;no Late Adult (LA) data
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span
                      style={{
                        backgroundColor: "#7ccbd7",
                        border: "solid 1px black",
                        width: "20px",
                        height: "20px",
                        display: "inline-block",
                      }}
                    />
                    &nbsp;no significant difference between LA controls and LA
                    knockouts
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span
                      style={{
                        backgroundColor: "#f19a57",
                        border: "solid 1px black",
                        width: "20px",
                        height: "20px",
                        display: "inline-block",
                      }}
                    />
                    &nbsp;significant difference between LA controls and LA
                    knockouts
                  </div>
                </Col>
              </Row>
              {!!paginatedData && (
                <ParentSize>
                  {({ width }) => (
                    <LateAdultHeatmap
                      width={width}
                      data={paginatedData}
                      genesList={paginatedGenes}
                      selectedParam={selectedParam}
                      onParamSelected={setSelectedParam}
                      isFetchingParamData={isFetchingParamData}
                    />
                  )}
                </ParentSize>
              )}
              <Row>
                <Col style={{ display: "flex", alignItems: "center" }}>
                  <div>
                    Rows per page:&nbsp;
                    <select
                      aria-label="genes per page selector"
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      value={pageSize.toString(10)}
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                </Col>
                <Col>
                  <PaginationControls
                    currentPage={activePage}
                    totalPages={totalPages}
                    onPageChange={setActivePage}
                    pageSize={pageSize}
                    containerStyles={{ display: "flex", justifyContent: "end" }}
                  />
                </Col>
              </Row>
            </div>
          </Container>
        </Card>
      </Container>
    </>
  );
};

export default LateAdultDataPage;
