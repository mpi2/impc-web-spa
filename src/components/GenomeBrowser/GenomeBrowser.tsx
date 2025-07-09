import { Col, Container, Form, Row, Spinner, FormCheck } from "react-bootstrap";
import { Card } from "@/components";
import { Fragment, useLayoutEffect, useMemo, useRef, useState } from "react";
import styles from "./styles.module.scss";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router";
import { GENOME_BROWSER_DATA_URL } from "@/api-service";

type GenomeBrowserProps = {
  geneSymbol: string;
  mgiGeneAccessionId: string;
  noContainer?: boolean;
};

type BrowserProps = {
  search: (value: string) => void;
  loadTrack: (config: any) => void;
  removeTrackByName: (trackName: string) => void;
};

type SelectedTracks = {
  crisprGuides: boolean;
  crisprFASTA: boolean;
  esCellAlleles: boolean;
  esCellProducts: boolean;
  targetingVectors: boolean;
  crisprDeletionCoords: boolean;
};

const PRODUCTS_TRACKS = {
  crisprDeletionCoords: {
    name: "CRISPR deletions",
    url: `${GENOME_BROWSER_DATA_URL}/deletion_coordinates.bb`,
    order: 3,
    autoHeight: true,
  },
  crisprFASTA: {
    name: "Aligned FASTA from CRISPR alleles",
    url: `${GENOME_BROWSER_DATA_URL}/aligned_fa_bigBed.bb`,
    order: 4,
    autoHeight: true,
  },
  crisprGuides: {
    name: "CRISPR allele guides",
    url: `${GENOME_BROWSER_DATA_URL}/guide_bb_file.bb`,
    order: 5,
    autoHeight: true,
  },
  esCellAlleles: {
    name: "ES Cell alleles available to order",
    url: `${GENOME_BROWSER_DATA_URL}/ikmc_ucsc_impc_es_cell_alleles.bb`,
    order: 8,
    autoHeight: true,
  },
  esCellProducts: {
    name: "Mouse lines carrying a ES Cell allele",
    url: `${GENOME_BROWSER_DATA_URL}/ikmc_ucsc_impc_mouse_alleles.bb`,
    order: 7,
    autoHeight: true,
  },
  targetingVectors: {
    name: "Targeting Vector Products",
    url: `${GENOME_BROWSER_DATA_URL}/ikmc_ucsc_impc_targeting_vectors.bb`,
    order: 9,
    autoHeight: true,
  },
};
const optionalTracks = {
  GENCODEFull: {
    name: "GENCODE M37 full gene annotation",
    url: "https://hgdownload.soe.ucsc.edu/gbdb/mm39/gencode/gencodeVM37.bb",
    indexed: false,
    searchable: true,
    searchableFields: [
      "name",
      "transcript_id",
      "gene_id",
      "gene_name",
      "id",
      "mgi_id",
    ],
    nameField: "gene_name",
    order: 0,
    autoHeight: true,
    type: "annotation",
  },
  GENCODEBasic: {
    name: "GENCODE M37 basic gene annotation",
    url: "https://impc-datasets.s3.eu-west-2.amazonaws.com/genome_data/gencodeVM37.basic.bb",
    indexed: false,
    searchable: true,
    searchableFields: [
      "name",
      "transcript_id",
      "gene_id",
      "gene_name",
      "id",
      "mgi_id",
    ],
    nameField: "gene_name",
    order: 0,
    autoHeight: true,
    type: "annotation",
  },
  "UniProt SwissProt Protein Annotations": {
    name: "UniProt SwissProt Protein Annotations",
    url: "https://hgdownload.soe.ucsc.edu/gbdb/mm39/uniprot/unipAliSwissprot.bb",
    indexed: false,
    nameField: "GeneName",
    order: 0,
    autoHeight: true,
  },
  "UniProt TrEMBL Protein Annotations": {
    name: "UniProt TrEMBL Protein Annotations",
    url: "https://hgdownload.soe.ucsc.edu/gbdb/mm39/uniprot/unipAliTrembl.bb",
    indexed: false,
    nameField: "GeneName",
    order: 0,
    autoHeight: true,
  },
  "IKMC alleles": {
    name: "IKMC alleles",
    url: `${GENOME_BROWSER_DATA_URL}/ikmc_ucsc_alleles.bb`,
    autoHeight: true,
  },
};

const GenomeBrowser = ({
  geneSymbol,
  mgiGeneAccessionId,
  noContainer = false,
}: GenomeBrowserProps) => {
  let genomeBrowserRef = useRef<BrowserProps | null>(null);
  const [isBrowserSetup, setIsBrowserSetup] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<SelectedTracks>({
    crisprGuides: false,
    crisprFASTA: false,
    crisprDeletionCoords: false,
    esCellAlleles: false,
    esCellProducts: false,
    targetingVectors: false,
  });

  useLayoutEffect(() => {
    let shouldCreateBrowser = true;
    async function setupIGVBrowser() {
      const igv = (await import("igv/dist/igv.esm")).default;
      const igvContainer = document.querySelector("#igv-container");
      const currentHash = window.location.hash;
      const selectedTracks: Record<string, boolean> = {};
      let tracks: Array<any> = [
        {
          name: "Refseq Curated",
          format: "refgene",
          url: "https://hgdownload.soe.ucsc.edu/goldenPath/mm39/database/ncbiRefSeqCurated.txt.gz",
          indexed: false,
          order: 0,
          removable: false,
          autoHeight: true,
        },
      ];
      selectedTracks.esCellAlleles = true;
      selectedTracks.esCellProducts = true;
      selectedTracks.crisprGuides = true;
      selectedTracks.crisprFASTA = true;
      selectedTracks.crisprDeletionCoords = true;
      tracks.push(
        PRODUCTS_TRACKS.crisprGuides,
        PRODUCTS_TRACKS.crisprFASTA,
        PRODUCTS_TRACKS.crisprDeletionCoords,
        PRODUCTS_TRACKS.esCellAlleles,
        PRODUCTS_TRACKS.esCellProducts,
      );
      if (currentHash === "#targetingVector") {
        tracks.push(PRODUCTS_TRACKS.targetingVectors);
        selectedTracks.targetingVectors = true;
      }
      const igvOptions = {
        locus: geneSymbol,
        flanking: 5000,
        loadDefaultGenomes: false,
        reference: {
          id: "mm39",
          name: "Mouse (GRCm39/mm39)",
          fastaURL: "https://s3.amazonaws.com/igv.org.genomes/mm39/mm39.fa",
          indexURL: "https://s3.amazonaws.com/igv.org.genomes/mm39/mm39.fa.fai",
          chromSizesURL:
            "https://hgdownload.soe.ucsc.edu/goldenPath/mm39/bigZips/mm39.chrom.sizes",
        },
        search: {
          url: "https://www.gentar.org/orthology-api/api/ortholog/get-coordinates/search?geneQuery=$FEATURE$",
          resultsField: "results",
          endField: "stop",
        },
        tracks,
      };
      if (shouldCreateBrowser) {
        const browser = await igv.createBrowser(igvContainer, igvOptions);
        browser.search(mgiGeneAccessionId);
        genomeBrowserRef.current = browser;
        setIsBrowserSetup(true);
        setSelectedTracks((prevState) => ({
          ...prevState,
          ...selectedTracks,
        }));
      }
    }
    if (!!mgiGeneAccessionId && !!geneSymbol && !isBrowserSetup && !!window) {
      setupIGVBrowser();
    }
    return () => {
      shouldCreateBrowser = false;
    };
  }, [isBrowserSetup, mgiGeneAccessionId, geneSymbol]);

  const resetView = () => {
    if (genomeBrowserRef.current) {
      genomeBrowserRef.current.search(mgiGeneAccessionId);
    }
  };
  const toggleOptionalTrack = (
    name: keyof typeof optionalTracks,
    selection: boolean,
  ) => {
    if (genomeBrowserRef.current) {
      if (selection) {
        genomeBrowserRef.current.loadTrack(optionalTracks[name]);
      } else {
        genomeBrowserRef.current.removeTrackByName(optionalTracks[name].name);
      }
    }
  };

  const toggleProductTrack = (name: keyof SelectedTracks, value: boolean) => {
    if (genomeBrowserRef.current) {
      if (value) {
        genomeBrowserRef.current.loadTrack(PRODUCTS_TRACKS[name]);
      } else {
        genomeBrowserRef.current.removeTrackByName(PRODUCTS_TRACKS[name].name);
      }
      setSelectedTracks((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const ContainerCmp = useMemo(() => {
    return noContainer ? Fragment : Card;
  }, [noContainer]);

  return (
    <ContainerCmp>
      <Container style={{ padding: 0 }}>
        <Row>
          <Col>
            <div
              className="mb-3 mt-0"
              style={{ display: "flex", alignItems: "center" }}
            >
              <h2 style={{ margin: 0 }}>Genome browser</h2>
              <Link
                to="https://dev.mousephenotype.org/help/data-visualization/genome-browser/"
                className="btn"
                aria-label="Genome browser documentation"
              >
                <FontAwesomeIcon icon={faCircleQuestion} size="xl" />
              </Link>
            </div>
          </Col>
          <Col className={styles.resetBtnContainer}>
            <button
              className="btn impc-secondary-button small"
              onClick={() => resetView()}
            >
              Reset view
            </button>
          </Col>
        </Row>
        <Row style={{ position: "relative" }}>
          <Col>
            <div className={styles.controlsContainer}>
              <div>
                <Form.Label className="d-inline-block fst-italic me-3 mb-0">
                  Gene annotations:
                </Form.Label>
                <Form.Check
                  className="mb-0"
                  inline
                  disabled
                  checked
                  label="Refseq"
                  type="checkbox"
                />
                <Form.Check
                  className="mb-0"
                  inline
                  label="GENCODE M37 full gene annotation"
                  onChange={(e) =>
                    toggleOptionalTrack("GENCODEFull", e.target.checked)
                  }
                />
                <FormCheck className="mb-0" inline>
                  <FormCheck.Input
                    id="gencode-basic"
                    type="checkbox"
                    onChange={(e) =>
                      toggleOptionalTrack("GENCODEBasic", e.target.checked)
                    }
                  />
                  <FormCheck.Label htmlFor="gencode-basic">
                    GENCODE M37 basic gene annotation
                  </FormCheck.Label>
                </FormCheck>
              </div>
            </div>
            <hr />
            <div className={styles.controlsContainer}>
              <div>
                <Form.Label className="d-inline-block fst-italic me-3 mb-0">
                  Protein annotations:
                </Form.Label>
                <Form.Check
                  className="mb-0"
                  inline
                  label="UniProt SwissProt Protein Annotations"
                  onChange={(e) =>
                    toggleOptionalTrack(
                      "UniProt SwissProt Protein Annotations",
                      e.target.checked,
                    )
                  }
                />
                <Form.Check
                  className="mb-0"
                  inline
                  label="UniProt TrEMBL Protein Annotations"
                  onChange={(e) =>
                    toggleOptionalTrack(
                      "UniProt TrEMBL Protein Annotations",
                      e.target.checked,
                    )
                  }
                />
              </div>
            </div>
            <hr />
            <div className={styles.controlsContainer}>
              <div>
                <Form.Label className="d-inline-block fst-italic me-3 mb-0">
                  Mouse products:
                </Form.Label>
                <Form.Check
                  className="mb-0"
                  inline
                  label="CRISPR Guides"
                  checked={selectedTracks.crisprGuides}
                  onChange={(e) =>
                    toggleProductTrack("crisprGuides", e.target.checked)
                  }
                />
                <Form.Check
                  className="mb-0"
                  inline
                  label="CRISPR Aligned FASTA"
                  checked={selectedTracks.crisprFASTA}
                  onChange={(e) =>
                    toggleProductTrack("crisprFASTA", e.target.checked)
                  }
                />
                <Form.Check
                  className="mb-0"
                  inline
                  label="CRISPR deletions"
                  checked={selectedTracks.crisprDeletionCoords}
                  onChange={(e) =>
                    toggleProductTrack("crisprDeletionCoords", e.target.checked)
                  }
                />
                <Form.Check
                  className="mb-0"
                  inline
                  label="ES Cell targeted"
                  checked={selectedTracks.esCellProducts}
                  onChange={(e) =>
                    toggleProductTrack("esCellProducts", e.target.checked)
                  }
                />
              </div>
            </div>
            <hr />
            <div className={styles.controlsContainer}>
              <div>
                <Form.Label className="d-inline-block me-3 mb-0 fst-italic">
                  ES Cell products:
                </Form.Label>
                <Form.Check
                  className="mb-0"
                  inline
                  label="ES Cells"
                  checked={selectedTracks.esCellAlleles}
                  onChange={(e) =>
                    toggleProductTrack("esCellAlleles", e.target.checked)
                  }
                />
                <Form.Check
                  className="mb-0"
                  inline
                  label="IKMC alleles"
                  onChange={(e) =>
                    toggleOptionalTrack("IKMC alleles", e.target.checked)
                  }
                />
                <Form.Check
                  className="mb-0"
                  inline
                  label="Targeting vectors"
                  checked={selectedTracks.targetingVectors}
                  onChange={(e) =>
                    toggleProductTrack("targetingVectors", e.target.checked)
                  }
                />
              </div>
            </div>
          </Col>
          <div
            className={classNames(styles.overlay, {
              [styles.active]: !isBrowserSetup,
            })}
          >
            <Spinner variant="primary" />
          </div>
        </Row>
      </Container>

      <div id="igv-container" />
    </ContainerCmp>
  );
};

export default GenomeBrowser;
