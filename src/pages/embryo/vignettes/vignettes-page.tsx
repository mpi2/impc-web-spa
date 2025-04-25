"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { Card, Search } from "@/components";
import {
  Breadcrumb,
  Button,
  Col,
  Container,
  Image,
  Modal,
  Row,
} from "react-bootstrap";
import Link from "next/link";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const additionalContentMap = {
  "cbx4_thymus_black.png":
    "Whole structural volume differences calculated as a percentage of whole body volume for the left and right thymic rudiment (left) and left and right adrenal (right) of Cbx4<sup>tm1.1/tm1.1</sup> mutant embryos compared to Cbx4<sup>+/+</sup> wildtype embryos. Both organs are significantly smaller in the Cbx4 mutant embryos at an FDR threshold of 5% where the error bars represent 95% confidence intervals.",
  "eye4Lac.png":
    "Lac Z staining at E12.5 showed that Eya4 expression is primarily in the craniofacial mesenchyme, cochleae and outer ear, dermamyotome and limb.",
  "eya4LacSlides.png":
    "H&E stained sagittal section through the right cochlea of an Eya4<sup>+/+</sup> wildtype embryo compared to an Eya4<sup>tm1b/tm1b</sup> mutant embryo indicated that the mutant embryo had a hypoplastic cochlea. Higher magnification of the region (indicated by the white box) showed abnormal perilymphatic (periotic) mesenchyme (PM) in the mutant embryo compared to the wildtype embryo. In the wildtype embryo the perilymphatic mesenchyme (PM) was rarefied and had multifocal vacuolation (arrow) suggesting normal perilymph development. In the mutant embryo the perilymphatic mesenchyme (PM) did not show rarefaction and had reduced vacuolation (arrow) suggesting the cochlear hypoplasia was due to delayed perilymph development. BL-Bony Labyrinth (cartilage at E15.5), PM-Perilymphatic (periotic) mesenchyme, ML-Membranous Labyrinth, EN-Endolymph",
  "Tox3HIST.png":
    "H&E stained coronal section through the brain of a Tox3<sup>+/+</sup> wildtype embryo compared to a Tox3<sup>tm1b/tm1b</sup> mutant embryo indicated that the mutant embryo has a hypoplastic a dysplastic cerebellum (CE) with markedly reduced fissure formation. Higher magnification revealed that the transient external granular layer was absent in the Tox3<sup>tm1b/tm1b</sup> mutant mice and the subjacent molecular layer was hypotrophic and irregular in thickness (arrow).",
  "Rsph9MRI.png":
    "Coronal and axial sections of whole brain MRI showed enlarged ventricles in P7 Rsph9<sup>tm1.1/tm1.1</sup> mutant mice. P7 Rsph9<sup>tm1.1/tm1.1</sup> mice brains had enlarged left and right lateral ventricles (arrows) when compared to the Rsph9<sup>+/+</sup> WT average.",
  "Tmem132aE15.5 sag.png":
    "Sagittal images from microCT volumes of wildtype (WT) and mutant (Tmem132a<sup>tm1b/tm1b</sup>) showing areas of defects (red arrows) indicating reduced neural tissue, heart defects and kidney abnormalities (extra lobe).",
  "Tmem132a axial.png":
    "Axial images from microCT volumes of wildtype (WT) and mutant (Tmem132a<sup>tm1b/tm1b</sup>) showing kidney abnormalities (extra lobe).",
};

const genePositions = {
  Chtop: 0,
  Klhdc2: 1,
  Acvr2a: 2,
  Cbx4: 3,
  Tmem100: 4,
  Eya4: 5,
  Tox3: 6,
  Rsph9: 7,
  Pax7: 8,
  Svep1: 9,
  Strn3: 10,
  Rab34: 11,
  Cox7c: 12,
  Bloc1s2: 13,
  Gfpt1: 14,
  Atg3: 15,
  Kdm8: 16,
  Slc39a8: 17,
  Gyg1: 18,
  Tmem132a: 19,
};

const EmbryoVignettesPage = ({ gene }: { gene: string }) => {
  const slickRef = useRef<Slider>(null);
  const [selectedFile, setSelectedFile] = useState<undefined | string>(
    undefined,
  );
  const [navigatedToGene, setNavigatedToGene] = useState<boolean>(false);

  useEffect(() => {
    if (!!gene && slickRef.current && !navigatedToGene) {
      slickRef.current.slickGoTo(genePositions[gene]);
      setNavigatedToGene(true);
    }
  }, [slickRef, gene]);

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
              <Breadcrumb.Item active>Embryo Vignettes</Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <h1 className="mb-4 mt-2">
            <strong>IMPC Embryo Vignettes</strong>
          </h1>
          <Container>
            <Row className="mt-4">
              <Col>
                <p>
                  The vignettes showcase the IMPC embryo pipeline. They
                  highlight the different phenotyping procedures centres employ
                  to phenotype embryonic lethal or subviable nulls. For more
                  information on the pipeline refer to the:&nbsp;
                  <Link className="link primary" href="/embryo">
                    IMPC Embryo Pipeline Introduction
                  </Link>
                  , or read more in our paper&nbsp;
                  <Link
                    className="link primary"
                    href="https://europepmc.org/articles/PMC5295821"
                  >
                    High-throughput discovery of novel developmental phenotypes,
                    Nature 2016
                  </Link>
                  . For a comprehensive list of lines with 3D image data refer
                  to:&nbsp;
                  <Link
                    className="link primary"
                    href="/embryo#embryo-data-grid"
                  >
                    IMPC 3D Embryo Data
                  </Link>
                  .
                </p>
              </Col>
            </Row>
          </Container>
        </Card>
        <Card>
          <Container>
            <Slider
              dots
              infinite
              speed={500}
              slidesToShow={1}
              slidesToScroll={1}
              adaptiveHeight
              ref={slickRef}
            >
              <div className="vignette">
                <Row>
                  <h1>
                    <strong>
                      Chtop<sup>tm1a(EUCOMM)Wtsi</sup>
                    </strong>
                  </h1>
                  <Col xs={8}>
                    <p>
                      Chtop has been shown to recruit the histone-methylating
                      methylosome to genomic regions containing
                      5-Hydroxymethylcytosine, thus affecting gene expression.
                      Chtop mutants showed complete preweaning lethality with no
                      homozygous pups observed. High resolution episcopic
                      microscopy (HREM) imaging at E14.5 revealed multiple
                      phenotypes including edema, abnormal forebrain morphology
                      and decreased number of vertebrae and ribs.
                    </p>
                    <p>Phenotype data links</p>
                    <ul>
                      <li>
                        Viability:&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:1913761&mpTermId=MP:0011100"
                        >
                          Complete preweaning lethality
                        </Link>
                      </li>
                      <li>
                        All adult and embryo phenotypes:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:1913761#data"
                        >
                          Table
                        </Link>
                      </li>
                    </ul>
                  </Col>
                  <Col xs={4}>
                    <Image
                      src="/data/images/landing-pages/chtopPink.jpg"
                      fluid
                      alt=""
                    />
                  </Col>
                </Row>
              </div>
              <div className="vignette">
                <Row>
                  <h1>
                    <strong>
                      Klhdc2<sup>tm1b(EUCOMM)Hmgu</sup>
                    </strong>
                  </h1>
                  <Col xs={8}>
                    <p>
                      Kelch domain-containing protein 2 functions as a
                      transcriptional corepressor through its inhibitory
                      interaction with LZIP.
                      <br />
                      <br />
                      Klhdc2 mutants showed complete preweaning lethality with
                      no homozygous pups observed,but remain viable up to E18.5.
                      Micro-computed tomography (microCT) imaging revealed
                      mutants display posterior polydactyly and edema. In
                      addition to this, sections of microCT showed a smaller
                      tongue, ventral septum defect (VSD), abnormal intestines
                      and displaced kidneys.
                      <br />
                      <br />
                      The Kldhc2 gene is located within a locus linked to an
                      automsomal dominant disease that leads to fibro-fatty
                      replacement of right ventricle myocardium leading to
                      arrythmias (ARVD3; OMIM).
                      <br />
                      The gene is expressed in&nbsp;
                      <Link
                        href="https://www.ebi.ac.uk/gxa/experiments/E-MTAB-3358?accessKey=&serializedFilterFactors=DEVELOPMENTAL_STAGE:adult&queryFactorType=ORGANISM_PART&rootContext=&heatmapMatrixSize=50&displayLevels=false&displayGeneDistribution=false&geneQuery=KLHDC2&exactMatch=true&_exactMatch=on&_queryFactorValues=1&specific=true&_specific=on&cutoff=0.5"
                        className="link primary"
                      >
                        heart
                      </Link>
                      &nbsp;(expression atlas link) and has been implicated in{" "}
                      <Link
                        href="http://www.ncbi.nlm.nih.gov/pubmed/16008511"
                        className="link primary"
                      >
                        endothelial differentation
                      </Link>
                      &nbsp;and&nbsp;
                      <Link
                        href="http://www.ncbi.nlm.nih.gov/pubmed/16860314"
                        className="link primary"
                      >
                        myoblast differentation
                      </Link>
                      . Heterozygote null mice have abnormal heart rhythms while
                      the lethal embryos may have a heart defect.
                    </p>
                    <p>Phenotype data links</p>
                    <ul>
                      <li>
                        Viability:&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:1916804&mpTermId=MP:0011100"
                        >
                          Adult Homozygous - Lethal
                        </Link>
                        ,&nbsp;
                        <Link
                          className="primary link"
                          href="/supporting-data?mgiGeneAccessionId=MGI:1916804&alleleAccessionId=MGI:5548587&zygosity=homozygote&parameterStableId=IMPC_EVM_001_001&pipelineStableId=HRWL_001&procedureStableId=IMPC_EVM_001&phenotypingCentre=MRC%20Harwell"
                        >
                          E12.5 Homozygous - Viable
                        </Link>
                      </li>
                      <li>
                        Embryo LacZ Expression:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:1916804/images/IMPC_ELZ_064_001"
                        >
                          Images
                        </Link>
                      </li>
                      <li>
                        3-D imaging:&nbsp;
                        <Link
                          className="link primary"
                          href="https://www.mousephenotype.org/embryoviewer/?mgi=MGI:1916804"
                        >
                          Images
                        </Link>
                      </li>
                      <li>
                        All adult and embryo phenotypes:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:1916804#data"
                        >
                          Table
                        </Link>
                      </li>
                    </ul>
                  </Col>
                  <Col xs={4}>
                    <Image
                      src="/data/images/landing-pages/Kldhc2.png"
                      fluid
                      alt=""
                    />
                    <Link
                      className="link primary"
                      href="https://www.mousephenotype.org/embryoviewer/?mgi=MGI:1916804"
                    >
                      E18.5 Klhdc2 null embryo
                    </Link>
                  </Col>
                </Row>
              </div>
              <div className="vignette">
                <Row>
                  <h1>
                    <strong>
                      Acvr2a<sup>tm1.1(KOMP)Vlcg</sup>
                    </strong>
                  </h1>
                  <Col xs={8}>
                    <p>
                      Activin receptor IIA is a receptor for activins, which are
                      members of the TGF-beta superfamily involved in diverse
                      biological processes. <br />
                      Acvr2a mutants are subviable with most pups dying before
                      postnatal day 7. Micro-CT analysis at E15.5 revealed
                      variable penetrance of eye and craniofacial abnormalities.
                      Eye phenotypes varied from normal (Embryo 1- (E1)), to
                      underdeveloped (E2), to cyclopic (E3), to absent (E4).
                      Craniofacial phenotypes varied from normal (E1) to narrow
                      snout (E2), to an elongated snout missing the mandible and
                      tongue (E3, 4) and low set ears (E2, 3, 4).
                    </p>
                    <p>Phenotype data links</p>
                    <ul>
                      <li>
                        Viability:&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:102806&mpTermId=MP:0011110"
                        >
                          Adult Homozygous - Subviable
                        </Link>
                        ,&nbsp;
                        <Link
                          className="primary link"
                          href="/supporting-data?mgiGeneAccessionId=MGI:102806&alleleAccessionId=MGI:5548333&zygosity=homozygote&parameterStableId=IMPC_EVO_001_001&pipelineStableId=TCP_001&procedureStableId=IMPC_EVO_001&phenotypingCentre=TCP"
                        >
                          E15.5 Homozygous - Viable
                        </Link>
                      </li>
                      <li>
                        Viability at P3/P7:&nbsp;
                        <Button
                          onClick={() => setSelectedFile("acvr2aP3.png")}
                          className="primary link"
                          variant="link"
                          style={{ padding: 0 }}
                        >
                          Lethal
                        </Button>
                      </li>
                      <li>
                        Embryo LacZ Expression:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:102806/images/IMPC_ELZ_064_001"
                        >
                          Images
                        </Link>
                      </li>
                      <li>
                        Gross Morphology:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:102806/images/IMPC_GEO_050_001"
                        >
                          E15.5 Images
                        </Link>
                      </li>
                      <li>
                        3-D imaging:&nbsp;
                        <Link
                          className="link primary"
                          href="https://www.mousephenotype.org/embryoviewer/?mgi=MGI:102806"
                        >
                          3D Viewer
                        </Link>
                      </li>
                      <li>
                        All adult and embryo phenotypes:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:102806#data"
                        >
                          Table
                        </Link>
                      </li>
                      <li>
                        Embryo Histopathology:&nbsp;
                        <Button
                          onClick={() => setSelectedFile("Acvr2aHist.png")}
                          className="primary link"
                          variant="link"
                          style={{ padding: 0 }}
                        >
                          Image
                        </Button>
                      </li>
                    </ul>
                  </Col>
                  <Col xs={4}>
                    <Image
                      src="/data/images/landing-pages/Acvr2aMicroCT.png"
                      fluid
                      alt=""
                    />
                  </Col>
                </Row>
              </div>
              <div className="vignette">
                <Row>
                  <h1>
                    <strong>
                      Cbx4<sup>tm1.1(KOMP)Vlcg</sup>
                    </strong>
                  </h1>
                  <Col xs={8}>
                    <p>
                      Chromobox 4 is in the polycomb protein family that are key
                      regulators of transcription and is reported to be
                      upregulated in lung bud formation and required for thymus
                      development. Cbx4 mutants showed complete preweaning
                      lethality but were viable at E12.5 and E15.5 with no
                      obvious gross morphological change. Micro-CT analysis at
                      E15.5 confirmed that Cbx4<sup>tm1.1/tm1.1</sup>
                      mutants had statistically smaller thymus and also revealed
                      smaller adrenal glands and trigeminal ganglia compared to
                      Cbx4<sup>+/+</sup> wildtype embryos.
                    </p>
                    <p>Phenotype data links</p>
                    <ul>
                      <li>
                        Viability:&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:1195985&mpTermId=MP:0011100"
                        >
                          Adult Homozygous - Lethal
                        </Link>
                        ,&nbsp;
                        <Link
                          className="primary link"
                          href="/supporting-data?mgiGeneAccessionId=MGI:1195985&alleleAccessionId=MGI:5548407&zygosity=homozygote&parameterStableId=IMPC_EVM_001_001&pipelineStableId=TCP_001&procedureStableId=IMPC_EVM_001&phenotypingCentre=TCP"
                        >
                          E12.5 Homozygous - Viable
                        </Link>
                        ,&nbsp;
                        <Link
                          className="primary link"
                          href="/supporting-data?mgiGeneAccessionId=MGI:1195985&alleleAccessionId=MGI:5548407&zygosity=homozygote&parameterStableId=IMPC_EVO_001_001&pipelineStableId=TCP_001&procedureStableId=IMPC_EVO_001&phenotypingCentre=TCP"
                        >
                          E15.5 Homozygous - Viable
                        </Link>
                      </li>
                      <li>
                        3-D imaging:&nbsp;
                        <Link
                          className="link primary"
                          href="https://www.mousephenotype.org/embryoviewer/?mgi=MGI:1195985"
                        >
                          3D Viewer
                        </Link>
                      </li>
                      <li>
                        All adult and embryo phenotypes:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:1195985#data"
                        >
                          Table
                        </Link>
                      </li>
                      <li>
                        3D Volumetric Analysis:&nbsp;
                        <Button
                          onClick={() => {
                            setSelectedFile("cbx4_thymus_black.png");
                          }}
                          className="primary link"
                          variant="link"
                          style={{ padding: 0 }}
                        >
                          Graph
                        </Button>
                      </li>
                    </ul>
                  </Col>
                  <Col xs={4}>
                    <Image
                      src="/data/images/landing-pages/cbx4.png"
                      fluid
                      alt=""
                    />
                    <p>
                      Automated MRI analysis of E15.5 Cbx4tm1.1/tm1.1 mutants
                      viewed in coronal section revealed that mutant embryos had
                      bilateral smaller trigeminal ganglia, thymus, and adrenal
                      glands compared to Cbx4+/+ wildtype embryos as indicated
                      by blue colour and highlighted by pink arrows (False
                      Discovery Rate (FDR) threshold of 5%).
                    </p>
                  </Col>
                </Row>
              </div>
              <div className="vignette">
                <Row>
                  <h1>
                    <strong>
                      Tmem100<sup>tm1e.1(KOMP)Wtsi</sup>
                    </strong>
                  </h1>
                  <Col xs={8}>
                    <p>
                      Transmembrane Protein 100 functions downstream of the
                      BMP/ALK1 signaling pathway. Tmem100 mutants showed
                      complete preweaning lethality and were also lethal at
                      E12.5. LacZ staining in E12.5 Het embryos was found
                      predominantly in arterial endothelial cells and the heart
                      (arrow). OPT analysis at E9.5 revealed that Tmem100 mutant
                      embryos have a large pericardial effusion with cardiac
                      dysmorphology and enlargement (arrow).
                    </p>
                    <p>Phenotype data links</p>
                    <ul>
                      <li>
                        Viability:&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:1915138&mpTermId=MP:0011100"
                        >
                          Adult Homozygous - Lethal
                        </Link>
                        ,&nbsp;
                        <Link
                          className="primary link"
                          href="/supporting-data?mgiGeneAccessionId=MGI:1915138&alleleAccessionId=MGI:5548552&zygosity=homozygote&parameterStableId=IMPC_EVL_001_001&pipelineStableId=TCP_001&procedureStableId=IMPC_EVL_001&phenotypingCentre=TCP"
                        >
                          E9.5 Homozygous - Viable
                        </Link>
                      </li>
                      <li>
                        Gross Morphology:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:1915138/images/IMPC_GEL_044_001"
                        >
                          E9.5 Images
                        </Link>
                      </li>
                      <li>
                        3-D imaging:&nbsp;
                        <Link
                          className="link primary"
                          href="https://www.mousephenotype.org/embryoviewer/?mgi=MGI:1915138"
                        >
                          3D Viewer
                        </Link>
                      </li>
                      <li>
                        All adult and embryo phenotypes:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:1915138#data"
                        >
                          Table
                        </Link>
                      </li>
                    </ul>
                  </Col>
                  <Col xs={4}>
                    <Image
                      src="/data/images/landing-pages/tmem100.png"
                      fluid
                      alt=""
                    />
                    <p>
                      OPT analysis of E9.5 Tmem100 wildtype embryo compared to a
                      Tmem100tm1e.1/tm1e.1 mutant embryo and lacZ staining in an
                      E12.5 Tmem100+/tm1e.1 embryo.
                    </p>
                  </Col>
                </Row>
              </div>
              <div className="vignette">
                <Row>
                  <h1>
                    <strong>
                      Eya4<sup>tm1b(KOMP)Wtsi</sup>
                    </strong>
                  </h1>
                  <Col xs={8}>
                    <p>
                      Eyes absent transcriptional coactivator and phosphatase 4
                      is associated with a variety of developmental defects
                      including hearing loss. Eya4 mutants showed complete
                      preweaning lethality with no homozygous pups observed.
                      Micro-CT analysis at E15.5 revealed Eyatm1b/tm1b mutant
                      embryos had bi-lateral smaller cochlear volumes as well as
                      a smaller thyroid gland, Meckel's cartilage, trachea
                      (opening), cricoid cartilage, and arytenoid cartilage.
                    </p>
                    <p>Phenotype data links</p>
                    <ul>
                      <li>
                        Viability:&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:1337104&mpTermId=MP:0011100"
                        >
                          Adult Homozygous - Lethal
                        </Link>
                        ,&nbsp;
                        <Link
                          className="primary link"
                          href="/supporting-data?mgiGeneAccessionId=MGI:1337104&alleleAccessionId=MGI:5548437&zygosity=homozygote&parameterStableId=IMPC_EVM_001_001&pipelineStableId=TCP_001&procedureStableId=IMPC_EVM_001&phenotypingCentre=TCP"
                        >
                          E12.5 Homozygous - Viable
                        </Link>
                        ,&nbsp;
                        <Link
                          className="primary link"
                          href="/supporting-data?mgiGeneAccessionId=MGI:1337104&alleleAccessionId=MGI:5548437&zygosity=homozygote&parameterStableId=IMPC_EVO_001_001&pipelineStableId=TCP_001&procedureStableId=IMPC_EVO_001&phenotypingCentre=TCP"
                        >
                          E15.5 Homozygous - Viable
                        </Link>
                      </li>
                      <li>
                        Embryo LacZ Expression:&nbsp;
                        <Button
                          onClick={() => setSelectedFile("eye4Lac.png")}
                          className="primary link"
                          variant="link"
                          style={{ padding: 0 }}
                        >
                          Images
                        </Button>
                      </li>
                      <li>
                        Embryo Histopathology:&nbsp;
                        <Button
                          onClick={() => setSelectedFile("eya4LacSlides.png")}
                          className="primary link"
                          variant="link"
                          style={{ padding: 0 }}
                        >
                          Images
                        </Button>
                      </li>
                      <li>
                        3-D imaging:&nbsp;
                        <Link
                          className="link primary"
                          href="https://www.mousephenotype.org/embryoviewer/?mgi=MGI:1337104"
                        >
                          3D Viewer
                        </Link>
                      </li>
                      <li>
                        All adult and embryo phenotypes:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:1337104#data"
                        >
                          Table
                        </Link>
                      </li>
                    </ul>
                  </Col>
                  <Col xs={4}>
                    <Image
                      src="/data/images/landing-pages/eye4.png"
                      fluid
                      alt=""
                    />
                    <p>
                      Automated MRI analysis of E15.5 Eya4tm1b/tm1b mutants
                      showed that mutant embryos had a statistically smaller
                      volumes of the cochlea and other tissues compared to
                      Eya4+/+ wildtype embryos as highlighted in blue in
                      transverse, coronal, and sagittal sections (false
                      discovery rate (FDR) threshold of 5%).
                    </p>
                  </Col>
                </Row>
              </div>
              <div className="vignette">
                <Row>
                  <h1>
                    <strong>
                      Tox3<sup>tm1b(KOMP)Mbp</sup>
                    </strong>
                  </h1>
                  <Col xs={8}>
                    <p>
                      Tox High Mobility Group Box Family Member 3 is a member of
                      the HMG-box family involved in bending and unwinding DNA.
                      Tox3 mutants have partial preweaning lethality with 1/3 of
                      the pups dying before P7. Whole brain MRI at P7 revealed
                      that Tox3tm1b/tm1b mutants had a much smaller cerebellum
                      (blue) compared to the Tox3+/+ wildtype mice (as seen in
                      coronal, sagittal, and axial section) and a relatively
                      larger amygdala, thalamus, pons (red)
                    </p>
                    <p>Phenotype data links</p>
                    <ul>
                      <li>
                        Viability:&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:3039593&mpTermId=MP:0011110"
                        >
                          Adult Homozygous - Subviable
                        </Link>
                      </li>
                      <li>
                        Viability at P3/P7:&nbsp;
                        <Button
                          onClick={() => setSelectedFile("Tox3Table.png")}
                          className="primary link"
                          variant="link"
                          style={{ padding: 0 }}
                        >
                          Viable
                        </Button>
                      </li>
                      <li>
                        Embryo Histopathology:&nbsp;
                        <Button
                          onClick={() => setSelectedFile("Tox3HIST.png")}
                          className="primary link"
                          variant="link"
                          style={{ padding: 0 }}
                        >
                          Images
                        </Button>
                      </li>
                      <li>
                        All adult and embryo phenotypes:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:3039593#data"
                        >
                          Table
                        </Link>
                      </li>
                    </ul>
                  </Col>
                  <Col xs={4}>
                    <Image
                      src="/data/images/landing-pages/tox3MRI.png"
                      fluid
                      alt=""
                    />
                    <p>
                      Caudal to rostral coronal sections of whole brain MRI with
                      automated volume analysis revealed P7 Tox3tm1b/tm1b mutant
                      mice had smaller (blue) and larger (red) tissues compared
                      to the Tox3+/+ wildtype average.
                    </p>
                  </Col>
                </Row>
              </div>
              <div className="vignette">
                <Row>
                  <h1>
                    <strong>
                      Rsph9<sup>tm1.1(KOMP)Vlcg</sup>
                    </strong>
                  </h1>
                  <Col xs={8}>
                    <p>
                      Radial spoke head protein 9 is a component of the radial
                      spoke head in motile cilia and flagella. Rsph9 mutants
                      showed partial pre-weaning lethality but viable to P7.
                      Whole brain MRI and H&E staining of coronal sections of
                      the P7 brain revealed severe hydrocephaly of the left and
                      right lateral ventricles of the Rsph9 mutant. Coronal
                      section through the nasal region showed that the sinuses
                      of the Rsph9 mutants were filled with pus (asterisks).
                      Both hydrocephaly and nasal blockage are phenotypes
                      associated with Primary Ciliary Dyskinesia in humans.
                    </p>
                    <p>Phenotype data links</p>
                    <ul>
                      <li>
                        Viability:&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:1922814&mpTermId=MP:0011110"
                        >
                          Adult Homozygous - Subviable
                        </Link>
                      </li>
                      <li>
                        Viability at P3/P7:&nbsp;
                        <Button
                          onClick={() => setSelectedFile("Rsph9Table.png")}
                          className="primary link"
                          variant="link"
                          style={{ padding: 0 }}
                        >
                          Viable
                        </Button>
                      </li>
                      <li>
                        All adult and embryo phenotypes:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:1922814#data"
                        >
                          Table
                        </Link>
                      </li>
                      <li>
                        Whole Brain MRI:&nbsp;
                        <Button
                          onClick={() => setSelectedFile("Rsph9MRI.png")}
                          className="primary link"
                          variant="link"
                          style={{ padding: 0 }}
                        >
                          Images
                        </Button>
                      </li>
                    </ul>
                  </Col>
                  <Col xs={4}>
                    <Image
                      src="/data/images/landing-pages/Rsph9Slides.png"
                      fluid
                      alt=""
                    />
                    <p>
                      H&E stained coronal sections of P7 mice revealed enlarged
                      ventricles and blocked sinuses in the Rsph9tm1.1/tm1.1
                      mutant mice.
                    </p>
                  </Col>
                </Row>
              </div>
              <div className="vignette">
                <Row>
                  <h1>
                    <strong>
                      Pax7<sup>tm1.1(KOMP)Vlcg</sup>
                    </strong>
                  </h1>
                  <Col xs={8}>
                    <p>
                      Pax 7 is a nuclear transcription factor with DNA-binding
                      activity via its paired domain. It is involved in
                      specification of the neural crest and is an upstream
                      regulator of myogenesis during post-natal growth and
                      muscle regeneration in the adult. Pax7 mutants showed
                      complete preweaning lethality. Micro-CT analysis at E15.5
                      revealed voxel-wise local volume differences with a larger
                      nasal septum, cavity and capsule (False Discovery Rate
                      &lt;5%) in the E15.5 Pax7<sup>tm1.1/tm1.1</sup> mutant
                      embryos compared the wildtype embryos. LacZ staining at
                      E12.5 showed very strong staining in the medial region of
                      the frontonasal prominence (arrows) where structural
                      changes were found. LacZ staining was also seen in the
                      midbrain, hindbrain, spinal cord, vertebrae, ribs and
                      neural crest.
                    </p>
                    <p>Phenotype data links</p>
                    <ul>
                      <li>
                        Viability:&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:97491&alleleAccessionId=MGI:5505636&zygosity=homozygote&parameterStableId=IMPC_VIA_001_001&pipelineStableId=JAX_001&procedureStableId=IMPC_VIA_001&phenotypingCentre=JAX"
                        >
                          Adult Homozygous - Subviable
                        </Link>
                      </li>
                      <li>
                        Embryo LacZ Expression:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:97491/images/IMPC_ELZ_064_001"
                        >
                          Images
                        </Link>
                      </li>
                      <li>
                        3-D imaging:&nbsp;
                        <Link
                          className="link primary"
                          href="https://www.mousephenotype.org/embryoviewer/?mgi=MGI:97491"
                        >
                          3D Viewer
                        </Link>
                      </li>
                      <li>
                        All adult and embryo phenotypes:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:97491#data"
                        >
                          Table
                        </Link>
                      </li>
                    </ul>
                  </Col>
                  <Col xs={4}>
                    <Image
                      src="/data/images/landing-pages/Pax7.png"
                      fluid
                      alt=""
                    />
                    <p>
                      Micro-CT analysis of E15.5 Pax7 embryos and lacZ staining
                      of E12.5 embryos indicating volume changes and staining in
                      the nasal area.
                    </p>
                  </Col>
                </Row>
              </div>
              <div className="vignette">
                <Row>
                  <h1>
                    <strong>
                      Svep1<sup>tm1.1(KOMP)Vlcg</sup>
                    </strong>
                  </h1>
                  <Col xs={8}>
                    <p>
                      Svep1 codes for an uncharacterized protein named after the
                      multiple domains identified in the sequence: Sushi, a
                      domain common in adhesion and complement proteins; von
                      Willebrand factor type A, occurring in extra-cellular
                      matrix and integrin proteins; Epidermal Growth Factor,
                      extra-cellular cysteine-rich repeats promoting
                      protein-protein interactions; pentraxin domain containing
                      1, reactive with the complement system. No prior targeted
                      mutations for this gene have been reported. Homozygous
                      mutants show complete preweaning lethality, with embryonic
                      lethality occurring after E18.5. Hemorrhaging is seen in
                      surviving E18.5 mutants, as is severe edema and small
                      embryo size (Fig 1, left). Among other defects, microCT
                      analysis reveals brain defects, lung hypoplasia and absent
                      renal pelvis in the kidney (Fig 1, middle, right).
                      Phenotypes of heterozygotes include abnormal body
                      composition and abnormal blood chemistry.
                    </p>
                    <p>Phenotype data links</p>
                    <ul>
                      <li>
                        Viability:&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:1928849&mpTermId=MP:0011100"
                        >
                          Adult Homozygous - Lethal
                        </Link>
                        ,&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:1928849&alleleAccessionId=MGI:5509058&zygosity=homozygote&parameterStableId=IMPC_EVM_001_001&pipelineStableId=JAX_001&procedureStableId=IMPC_EVM_001&phenotypingCentre=JAX"
                        >
                          E12.5 Homozygous - Subviable
                        </Link>
                      </li>
                      <li>
                        Embryo LacZ Expression:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:1928849/images/IMPC_ELZ_064_001"
                        >
                          Images
                        </Link>
                      </li>
                      <li>
                        Gross Morphology:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:1928849/images/IMPC_GEP_064_001"
                        >
                          E18.5 Images
                        </Link>
                        ,&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:1928849/images/IMPC_GEO_050_001"
                        >
                          E15.5 Images
                        </Link>
                      </li>
                      <li>
                        3-D imaging:&nbsp;
                        <Link
                          className="link primary"
                          href="https://www.mousephenotype.org/embryoviewer/?mgi=MGI:1928849"
                        >
                          3D Viewer
                        </Link>
                      </li>
                      <li>
                        All adult and embryo phenotypes:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:1928849#data"
                        >
                          Table
                        </Link>
                      </li>
                    </ul>
                  </Col>
                  <Col xs={4}>
                    <Image
                      src="/data/images/landing-pages/Svep1.jpg"
                      fluid
                      alt=""
                    />
                  </Col>
                </Row>
              </div>
              <div className="vignette">
                <Row>
                  <h1>
                    <strong>
                      Strn3<sup>tm1b(KOMP)Wtsi/J</sup>
                    </strong>
                  </h1>
                  <Col xs={8}>
                    <p>
                      Striatins act as both calcium-dependent signaling proteins
                      and scaffolding proteins, linking calcium-sensing
                      signaling events with cellular action [1]. Strn3
                      homozygous mutants show complete preweaning lethality,
                      with embryonic lethality occurring around E15.5. Surviving
                      embryos are smaller in size and display both hemorrhaging
                      and severe edema (Fig 1, left panels). MicroCT analyses
                      reveal small, but consistent septal defects in heart (Fig
                      1, right panels). Multiple phenotypes are observed in
                      heterozygous adult animals, including abnormal blood
                      chemistry and hematology, impaired glucose tolerance and
                      abnormal behavior, among others. A Genome-wide association
                      study linking Strn3 with the canine disease Arrhythmogenic
                      Right Ventricular Cardiomyopathy (ARVC) supports a role in
                      cardiac function [2].
                      <br />
                      <br />
                      <i>
                        [1] The striatin family: a new signaling platform in
                        dendritic spines, Benoist, M, et al, (2006) J. Physiol.
                        Paris; [2] Identification of Striatin deletion in canine
                        ARVC. (2010) Meurs, K. M., et al, Hum. Genet.
                      </i>
                    </p>
                    <p>Phenotype data links</p>
                    <ul>
                      <li>
                        Viability:&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:2151064&mpTermId=MP:0011100"
                        >
                          Adult Homozygous - Lethal
                        </Link>
                        ,&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:2151064&alleleAccessionId=MGI:5468974&zygosity=homozygote&parameterStableId=IMPC_EVM_001_001&pipelineStableId=JAX_001&procedureStableId=IMPC_EVM_001&phenotypingCentre=JAX"
                        >
                          E12.5 Homozygous - Viable
                        </Link>
                      </li>
                      <li>
                        Embryo LacZ Expression:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:2151064/images/IMPC_ELZ_064_001"
                        >
                          Images
                        </Link>
                      </li>
                      <li>
                        Gross Morphology:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:2151064/images/IMPC_GEO_050_001"
                        >
                          E15.5 Images
                        </Link>
                      </li>
                      <li>
                        3-D imaging:&nbsp;
                        <Link
                          className="link primary"
                          href="https://www.mousephenotype.org/embryoviewer/?mgi=MGI:2151064"
                        >
                          3D Viewer
                        </Link>
                      </li>
                      <li>
                        All adult and embryo phenotypes:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:2151064#data"
                        >
                          Table
                        </Link>
                      </li>
                    </ul>
                  </Col>
                  <Col xs={4}>
                    <Image
                      src="/data/images/landing-pages/Strn3.jpg"
                      fluid
                      alt=""
                    />
                  </Col>
                </Row>
              </div>
              <div className="vignette">
                <Row>
                  <h1>
                    <strong>
                      Rab34<sup>tm1b(KOMP)Wtsi/J</sup>
                    </strong>
                  </h1>
                  <Col xs={8}>
                    <p>
                      Rab34 is a member of the RAS oncogene family, which are
                      small GTPases involved in intracellular vesicle transport.
                      Rab34 is known to be Golgi-bound, involved in lysosomal
                      positioning. Rab34 is a potential target of Gli1 and a
                      possible component of hedgehog signaling. The Rab34
                      knockout is the first reported null allele for this gene,
                      resulting in complete preweaning lethality. Phenotypes
                      include patterning defects, such as polydactyly and facial
                      clefting,as well as abnormal eye development and severe
                      lung hypoplasia (Fig 1, lu = lung). The mutants are
                      subviable at E18.5, lethality presumably occurring
                      perinatally.
                    </p>
                    <p>Phenotype data links</p>
                    <ul>
                      <li>
                        Viability:&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:104606&mpTermId=MP:0011100"
                        >
                          Adult Homozygous - Lethal
                        </Link>
                        ,&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:104606&alleleAccessionId=MGI:5520180&zygosity=homozygote&parameterStableId=IMPC_EVO_001_001&pipelineStableId=JAX_001&procedureStableId=IMPC_EVO_001&phenotypingCentre=JAX"
                        >
                          E15.5 Homozygous - Viable
                        </Link>
                      </li>
                      <li>
                        Embryo LacZ Expression:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:104606/images/IMPC_ELZ_064_001"
                        >
                          Images
                        </Link>
                      </li>
                      <li>
                        Gross Morphology:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:104606/images/IMPC_GEP_064_001"
                        >
                          E18.5 Images
                        </Link>
                        ,&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:104606/images/IMPC_GEO_050_001"
                        >
                          E15.5 Images
                        </Link>
                        ,&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:104606/images/IMPC_GEM_049_001"
                        >
                          E12.5 Images
                        </Link>
                      </li>
                      <li>
                        3-D Imaging:&nbsp;
                        <Link
                          className="link primary"
                          href="https://www.mousephenotype.org/embryoviewer/?mgi=MGI:104606"
                        >
                          3D Viewer
                        </Link>
                      </li>
                      <li>
                        All adult and embryo phenotypes:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:104606#data"
                        >
                          Table
                        </Link>
                      </li>
                    </ul>
                  </Col>
                  <Col xs={4}>
                    <Image
                      src="/data/images/landing-pages/Rab34.jpg"
                      fluid
                      alt=""
                    />
                  </Col>
                </Row>
              </div>
              <div className="vignette">
                <Row>
                  <h1>
                    <strong>
                      Cox7c<sup>tm1b(KOMP)Mbp</sup>
                    </strong>
                  </h1>
                  <Col xs={8}>
                    <p>
                      Cytochrome c oxidase subunit VIIc (Cox7c) is a
                      nuclear-encoded regulatory component of cytochrome c
                      oxidase. Homozygous mutants show complete preweaning
                      lethality, with embryonic lethality occurring after E15.5.
                      Surviving mutants are smaller (Figure 1, top panels), and
                      have an abnormally small placenta (Figure 1, bottom
                      panels). Although significant development progresses after
                      E15.5, by E18.5 homozygous embryos die and begin to
                      resorb.
                    </p>
                    <p>Phenotype data links</p>
                    <ul>
                      <li>
                        Viability:&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:103226&mpTermId=MP:0011100"
                        >
                          Adult Homozygous - Lethal
                        </Link>
                      </li>
                      <li>
                        Embryo LacZ Expression:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:103226/images/IMPC_ELZ_064_001"
                        >
                          Images
                        </Link>
                      </li>
                      <li>
                        Gross Morphology:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:103226/images/IMPC_GEP_064_001"
                        >
                          E18.5 Images
                        </Link>
                        ,&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:103226/images/IMPC_GEO_050_001"
                        >
                          E15.5 Images
                        </Link>
                        ,&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:103226/images/IMPC_GEM_049_001"
                        >
                          E12.5 Images
                        </Link>
                      </li>
                      <li>
                        3-D Imaging:&nbsp;
                        <Link
                          className="link primary"
                          href="https://www.mousephenotype.org/embryoviewer/?mgi=MGI:103226"
                        >
                          3D Viewer
                        </Link>
                      </li>
                      <li>
                        All adult and embryo phenotypes:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:103226#data"
                        >
                          Table
                        </Link>
                      </li>
                    </ul>
                  </Col>
                  <Col xs={4}>
                    <Image
                      src="/data/images/landing-pages/Cox7c.jpg"
                      fluid
                      alt=""
                    />
                  </Col>
                </Row>
              </div>
              <div className="vignette">
                <Row>
                  <h1>
                    <strong>
                      Bloc1s2<sup>tm1.1(KOMP)Mbp</sup>
                    </strong>
                  </h1>
                  <Col xs={8}>
                    <p>
                      Biogenesis of lysosomal organelles complex 1, subunit 2 is
                      a component of the BLOC-1 complex, which functions in the
                      formation of lysosome-related organelles, is implicated in
                      synapse function, and is associated with gamma- tubulin
                      and the centrosome [1]. Homozygous mutants show complete
                      preweaning lethality, with embryonic lethality occurring
                      around E15.5. Surviving mutants at E15.5 show edema,
                      hemorrhage, and abnormal cardiovascular development (Fig
                      1). MicroCT datasets of E15.5 embryos also reveal lung
                      hypoplasia, enlarged right atrium, and compromised right
                      ventricle of the heart (Fig.1, arrow). Adult heterozygotes
                      show abnormal immunophenotypes.
                      <br />
                      <br />
                      <i>
                        [1] Falcon-Perez et al., BLOC-1, a novel complex
                        containing the pallidin and muted proteins involved in
                        the biogenesis of melanosomes and platelet-dense
                        granules, J Biol Chem 2002
                      </i>
                    </p>
                    <p>Phenotype data links</p>
                    <ul>
                      <li>
                        Viability:&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:1920939&mpTermId=MP:0011100"
                        >
                          Adult Homozygous - Lethal
                        </Link>
                      </li>
                      <li>Embryo LacZ Expression: No expression</li>
                      <li>
                        Gross Morphology:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:1920939/images/IMPC_GEM_049_001"
                        >
                          E12.5 Images
                        </Link>
                      </li>
                      <li>
                        3-D Imaging:&nbsp;
                        <Link
                          className="link primary"
                          href="https://www.mousephenotype.org/embryoviewer/?mgi=MGI:1920939"
                        >
                          3D Viewer
                        </Link>
                      </li>
                      <li>
                        All adult and embryo phenotypes:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:1920939#data"
                        >
                          Table
                        </Link>
                      </li>
                    </ul>
                  </Col>
                  <Col xs={4}>
                    <Image
                      src="/data/images/landing-pages/Cox7c.jpg"
                      fluid
                      alt=""
                    />
                  </Col>
                </Row>
              </div>
              <div className="vignette">
                <Row>
                  <h1>
                    <strong>
                      Gfpt1<sup>tm1b(EUCOMM)Wtsi</sup>
                    </strong>
                  </h1>
                  <Col xs={8}>
                    <p>
                      Gfpt1 encodes glutamine:fructose-6-phosphate
                      amidotransferase 1, which catalyzes the transfer of an
                      amino group from glutamine onto fructose-6-phosphate. This
                      is the first and rate limiting enzyme of the hexosamine
                      biosynthetic pathway.
                      <br />
                      <br />
                      Gfpt1 mutants showed complete lethality by E12.5 with no
                      homozygous embryos observed. Optical projection tomography
                      (OPT) at E9.5 illustrated developmental delay,
                      craniofacial abnormalities, abnormal allantois
                      development, failure to complete turning and abnormal
                      heart looping.
                    </p>
                    <p>Phenotype data links</p>
                    <ul>
                      <li>
                        Viability:&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:95698&mpTermId=MP:0011100"
                        >
                          Adult Homozygous - Lethal
                        </Link>
                        ,&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:95698&alleleAccessionId=MGI:5637207&zygosity=homozygote&parameterStableId=IMPC_EVM_001_001&pipelineStableId=HRWL_001&procedureStableId=IMPC_EVM_001&phenotypingCentre=MRC%20Harwell"
                        >
                          E12.5 Homozygous - Lethal
                        </Link>
                      </li>
                      <li>
                        Embryo LacZ Expression:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:95698/images/IMPC_ELZ_064_001"
                        >
                          Images
                        </Link>
                      </li>
                      <li>
                        3-D Imaging:&nbsp;
                        <Link
                          className="link primary"
                          href="https://www.mousephenotype.org/embryoviewer/?mgi=MGI:95698"
                        >
                          3D Viewer
                        </Link>
                      </li>
                      <li>
                        All adult and embryo phenotypes:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:95698#data"
                        >
                          Table
                        </Link>
                      </li>
                    </ul>
                  </Col>
                  <Col xs={4}>
                    <Image
                      src="/data/images/landing-pages/gfpt1.png"
                      fluid
                      alt=""
                    />
                  </Col>
                </Row>
              </div>
              <div className="vignette">
                <Row>
                  <h1>
                    <strong>
                      Atg3<sup>tm1b(EUCOMM)Hmgu</sup>
                    </strong>
                  </h1>
                  <Col xs={8}>
                    <p>
                      Atg3 is an E2-like protein-conjugating enzyme involved in
                      autophagy broadly expressed during development and in the
                      adult.
                      <br />
                      <br />
                      Atg3 mutants show complete preweaning lethality with no
                      homozygous pups observed, but they are viable at least
                      until E14.5. Micro-computed tomography (microCT) imaging
                      at E14.5 revealed homozygous mutant fetuses had
                      cardiovascular abnormalities such as ventral septum
                      defects (VSD), thick atrio-ventricular valves and a thin
                      myocardium, as well as an enlarged umbilical vein.
                    </p>
                    <p>Phenotype data links</p>
                    <ul>
                      <li>
                        Viability:&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:1915091&mpTermId=MP:0011100"
                        >
                          Adult Homozygous - Lethal
                        </Link>
                        ,&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:1915091&alleleAccessionId=MGI:5548550&zygosity=homozygote&parameterStableId=IMPC_EVM_001_001&pipelineStableId=HRWL_001&procedureStableId=IMPC_EVM_001&phenotypingCentre=MRC%20Harwell"
                        >
                          E12.5 Homozygous - Viable
                        </Link>
                        ,&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:1915091&alleleAccessionId=MGI:5548550&zygosity=homozygote&parameterStableId=IMPC_EVO_001_001&pipelineStableId=HRWL_001&procedureStableId=IMPC_EVO_001&phenotypingCentre=MRC%20Harwell"
                        >
                          E14.5 Homozygous - Viable
                        </Link>
                      </li>
                      <li>
                        Embryo LacZ Expression:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:1915091/images/IMPC_ELZ_064_001"
                        >
                          Images
                        </Link>
                      </li>
                      <li>
                        3-D Imaging:&nbsp;
                        <Link
                          className="link primary"
                          href="https://www.mousephenotype.org/embryoviewer/?mgi=MGI:1915091"
                        >
                          3D Viewer
                        </Link>
                      </li>
                      <li>
                        All adult and embryo phenotypes:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:1915091#data"
                        >
                          Table
                        </Link>
                      </li>
                    </ul>
                  </Col>
                  <Col xs={4}>
                    <Image
                      src="/data/images/landing-pages/Atg3.png"
                      fluid
                      alt=""
                    />
                  </Col>
                </Row>
              </div>
              <div className="vignette">
                <Row>
                  <h1>
                    <strong>
                      Kdm8<sup>tm1b(EUCOMM)Wtsi</sup>
                    </strong>
                  </h1>
                  <Col xs={8}>
                    <p>
                      Kdm8 encodes for lysine (K)-specific demethylase 8, which
                      is predicted to have dual functions as a histone
                      demethylase and as a protein hydroxylase. The gene is
                      formerly known as Jmjd5.
                      <br />
                      <br />
                      Kdm8 tm1b homozygous mutants showed complete lethality by
                      E12.5. Optical projection tomography (OPT) showed that at
                      E9.5 mutant embryos appear small in size, remain unturned
                      and that they are developmentally delayed by this stage of
                      gestation. Interestingly, Kdm8 tm1a homozygous mutants can
                      live up to the end of gestation, suggesting that the
                      targeted trap is a hypomorphic allele.
                    </p>
                    <p>Phenotype data links</p>
                    <ul>
                      <li>
                        Viability:&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:1924285&mpTermId=MP:0011100"
                        >
                          Adult Homozygous - Lethal
                        </Link>
                      </li>
                      <li>
                        Embryo LacZ Expression:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:1924285/images/IMPC_ELZ_064_001"
                        >
                          Images
                        </Link>
                      </li>
                      <li>
                        3-D Imaging:&nbsp;
                        <Link
                          className="link primary"
                          href="https://www.mousephenotype.org/embryoviewer/?mgi=MGI:1924285"
                        >
                          3D Viewer
                        </Link>
                      </li>
                      <li>
                        All adult and embryo phenotypes:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:1924285#data"
                        >
                          Table
                        </Link>
                      </li>
                    </ul>
                  </Col>
                  <Col xs={4}>
                    <Image
                      src="/data/images/landing-pages/Kdm8.png"
                      fluid
                      alt=""
                    />
                  </Col>
                </Row>
              </div>
              <div className="vignette">
                <Row>
                  <h1>
                    <strong>
                      Slc39a8<sup>tm1b(EUCOMM)Wtsi</sup>
                    </strong>
                  </h1>
                  <Col xs={8}>
                    <p>
                      Solute carrier family 39 (metal ion transporter), member 8
                      encodes a protein that functions as a transporter for
                      several divalent cations. Mutants show complete preweaning
                      lethality with no homozygous pups observed, but are viable
                      at least until E14.5. Micro-computed tomography (microCT)
                      imaging at E14.5 revealed mutants were smaller and had
                      cardiovascular abnormalities, such as ventral septum
                      defects. It also revealed mutants lacked a sternum and had
                      a small chest cavity and liver.
                    </p>
                    <p>Phenotype data links</p>
                    <ul>
                      <li>
                        Viability:&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:1914797&mpTermId=MP:0011100"
                        >
                          Adult Homozygous - Lethal
                        </Link>
                        ,&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:1914797&alleleAccessionId=MGI:5548544&zygosity=homozygote&parameterStableId=IMPC_EVM_001_001&pipelineStableId=HRWL_001&procedureStableId=IMPC_EVM_001&phenotypingCentre=MRC%20Harwell"
                        >
                          E12.5 Homozygous - Viable
                        </Link>
                      </li>
                      <li>
                        Embryo LacZ Expression:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:1914797/images/IMPC_ELZ_064_001"
                        >
                          Images
                        </Link>
                      </li>
                      <li>
                        3-D Imaging:&nbsp;
                        <Link
                          className="link primary"
                          href="https://www.mousephenotype.org/embryoviewer/?mgi=MGI:1914797"
                        >
                          3D Viewer
                        </Link>
                      </li>
                      <li>
                        All adult and embryo phenotypes:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:1914797#data"
                        >
                          Table
                        </Link>
                      </li>
                    </ul>
                  </Col>
                  <Col xs={4}>
                    <Image
                      src="/data/images/landing-pages/Slc39a8.png"
                      fluid
                      alt=""
                    />
                    <p>
                      Slc39a8-null mutants are significantly smaller than WT
                      littermates and have smaller livers.
                    </p>
                  </Col>
                </Row>
              </div>
              <div className="vignette">
                <Row>
                  <h1>
                    <strong>
                      Gyg1<sup>tm1b(KOMP)Wtsi</sup>
                    </strong>
                  </h1>
                  <Col xs={8}>
                    <p>
                      Glycogenin is an enzyme that converts glucose to glycogen.
                      Glycogenin catalyzes UDP-alpha-D-glucose + glycogenin ⇌
                      UDP + alpha-D-glucosylglycogenin. The enzyme is a
                      homodimer of 37 kDa subunits. Mutations in human GYG1 are
                      associated with Glyocgen Storage Disease XV and
                      Polyglucosan Body Myopathy 2 (
                      <Link
                        className="link primary"
                        href="http://www.omim.org/entry/603942"
                      >
                        OMIM
                      </Link>
                      ). Homozygous null Gyg mice die between birth and weaning
                      but were found in normal proportions at E18.5. Mutants
                      were indistinguishable from littermates at E12.5, E15.5 or
                      E18.5 but analysis of microCT images revealed obvious
                      cardiac abnormalities, enlarged thymus and abnormal
                      nervous system morphology. This is the first reported Gyg
                      mouse mutant.
                    </p>
                    <p>Phenotype data links</p>
                    <ul>
                      <li>
                        Viability:&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:1351614&mpTermId=MP:0011100"
                        >
                          Adult Homozygous - Lethal
                        </Link>
                        ,&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:1351614&alleleAccessionId=MGI:5548475&zygosity=homozygote&parameterStableId=IMPC_EVP_001_001&pipelineStableId=BCM_001&procedureStableId=IMPC_EVP_001&phenotypingCentre=BCM"
                        >
                          E18.5 Homozygous - Viable
                        </Link>
                      </li>
                      <li>
                        Embryo LacZ Expression:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:1351614/images/IMPC_ELZ_064_001"
                        >
                          Images
                        </Link>
                      </li>
                      <li>
                        3-D Imaging:&nbsp;
                        <Link
                          className="link primary"
                          href="https://www.mousephenotype.org/embryoviewer/?mgi=MGI:1351614"
                        >
                          3D Viewer
                        </Link>
                      </li>
                      <li>
                        All adult and embryo phenotypes:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:1351614#data"
                        >
                          Table
                        </Link>
                      </li>
                    </ul>
                  </Col>
                  <Col xs={4}>
                    <Image
                      src="/data/images/landing-pages/Gygmutants.png"
                      fluid
                      alt=""
                    />
                    <p>
                      Single images from E18.5 microCT volumes showing spinal
                      cord abnormalities (arrow), enlarged thymus (asterisk) and
                      thickened myocardium (arrowhead) in homozygous null
                      embryos compared to wild-type littermates.
                    </p>
                  </Col>
                </Row>
              </div>
              <div className="vignette">
                <Row>
                  <h1>
                    <strong>
                      Tmem132a<sup>tm1b(KOMP)Wtsi</sup>
                    </strong>
                  </h1>
                  <Col xs={8}>
                    <p>
                      Transmembrane protein132a is transmembrane protein of
                      unknown function. Homozygous null mutants were viable at
                      normal proportions at E15.5 and E18.5 but showed obvious
                      and severe defects that were readibly visible by eye.
                      Embryos had abnormal limb morphology with syndactyly,
                      spina bifida, heart abnormalities. Some mutants were
                      smaller than littermates.
                    </p>
                    <p>Phenotype data links</p>
                    <ul>
                      <li>
                        Viability:&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:2147810&mpTermId=MP:0011100"
                        >
                          Adult Homozygous - Lethal
                        </Link>
                        ,&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:2147810&alleleAccessionId=MGI:5548753&zygosity=homozygote&parameterStableId=IMPC_EVM_001_001&pipelineStableId=BCM_001&procedureStableId=IMPC_EVM_001&phenotypingCentre=BCM"
                        >
                          E12.5 Homozygous - Viable
                        </Link>
                        ,&nbsp;
                        <Link
                          className="link primary"
                          href="/supporting-data?mgiGeneAccessionId=MGI:2147810&alleleAccessionId=MGI:5548753&zygosity=homozygote&parameterStableId=IMPC_EVP_001_001&pipelineStableId=BCM_001&procedureStableId=IMPC_EVP_001&phenotypingCentre=BCM"
                        >
                          E18.5 Homozygous - Viable
                        </Link>
                      </li>
                      <li>
                        Embryo LacZ Expression:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:2147810/images/IMPC_ELZ_064_001"
                        >
                          Images
                        </Link>
                      </li>
                      <li>
                        3-D Imaging:&nbsp;
                        <Link
                          className="link primary"
                          href="https://www.mousephenotype.org/embryoviewer/?mgi=MGI:2147810"
                        >
                          3D Viewer
                        </Link>
                      </li>
                      <li>
                        All adult and embryo phenotypes:&nbsp;
                        <Link
                          className="link primary"
                          href="/genes/MGI:2147810#data"
                        >
                          Table
                        </Link>
                      </li>
                      <li>
                        Sagittal images from microCT:&nbsp;
                        <Button
                          onClick={() =>
                            setSelectedFile("Tmem132aE15.5 sag.png")
                          }
                          className="primary link"
                          variant="link"
                          style={{ padding: 0 }}
                        >
                          Centre provided image
                        </Button>
                      </li>
                      <li>
                        Axial images from microCT:&nbsp;
                        <Button
                          onClick={() => setSelectedFile("Tmem132a axial.png")}
                          className="primary link"
                          variant="link"
                          style={{ padding: 0 }}
                        >
                          Centre provided image
                        </Button>
                      </li>
                    </ul>
                  </Col>
                  <Col xs={4}>
                    <Image
                      src="/data/images/landing-pages/Tmem132a.png"
                      fluid
                      alt=""
                    />
                  </Col>
                </Row>
              </div>
            </Slider>
          </Container>
        </Card>
      </Container>
      <Modal
        show={!!selectedFile}
        onHide={() => setSelectedFile(undefined)}
        size="lg"
      >
        <Modal.Body>
          <Image
            src={`/data/images/landing-pages/${selectedFile}`}
            fluid
            alt=""
          />
          {selectedFile !== undefined &&
            !!additionalContentMap[selectedFile] && (
              <p
                className="mt-3"
                dangerouslySetInnerHTML={{
                  __html: additionalContentMap[selectedFile],
                }}
              ></p>
            )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default EmbryoVignettesPage;
