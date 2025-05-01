import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import RootLayout from "./layout.tsx";
import SearchResults from "@/pages/search/search-page.tsx";
import GenePage from "@/pages/genes/[pid]/gene-page.tsx";
import PhenotypePage from "@/pages/phenotypes/[id]/phenotype-page.tsx";
import AllelePage from "@/pages/alleles/[pid]/[...alleleSymbol]/allele-page.tsx";
import SupportingDataPage from "@/pages/supporting-data/supporting-data-page.tsx";
import ImageComparator from "@/pages/genes/[pid]/images/[parameterStableId]/image-viewer-page.tsx";
import ImageDownloader from "@/pages/genes/[pid]/download-images/[parameterStableId]/image-downloader-page.tsx";
import HistopathChartPage from "@/pages/supporting-data/histopath/[pid]/histopath-chart-page.tsx";
import ViabilityChartPage from "@/pages/supporting-data/viability/viability-chart-page.tsx";
import BodyweightChartPage from "@/pages/supporting-data/bodyweight/bodyweight-chart-page.tsx";
import DesignsPage from "@/pages/designs/[id]/designs-page.tsx";
import CardiovascularLandingPage from "@/pages/cardiovascular/cardiovascular-page.tsx";
import ConservationLandingPage from "@/pages/conservation/conservation-page.tsx";
import EmbryoLandingPage from "@/pages/embryo/embryo-page.tsx";
import EmbryoVignettesPage from "@/pages/embryo/vignettes/vignettes-page.tsx";
import HearingLandingPage from "@/pages/hearing/hearing-page.tsx";
import HistopathLandingPage from "@/pages/histopath/histopath-page.tsx";
import LateAdultDataLandingPage from "@/pages/late-adult-data/late-adult-page.tsx";
import MetabolismLandingPage from "@/pages/metabolism/metabolism-page.tsx";
import PublicationsPage from "@/pages/publications/publications-page.tsx";
import IDGPage from "@/pages/secondaryproject/idg/idg-page.tsx";
import SexualDimorphismLandingPage from "@/pages/sexual-dimorphism/sexual-dimorphism-page.tsx";
import { ReleaseNotesPage } from "@/components";


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<SearchResults data={{ numResults: -1, results: []}} />} />
          <Route path="genes/:pid" element={<GenePage />} />
          <Route path="genes/:pid/images/:parameterStableId" element={<ImageComparator />} />
          <Route path="genes/:pid/download-images/:parameterStableId" element={<ImageDownloader />} />
          <Route path="alleles/:pid/:alleleSymbol" element={<AllelePage />} />
          <Route path="supporting-data" element={<SupportingDataPage />} />
          <Route path="supporting-data/histopath/:pid" element={<HistopathChartPage />} />
          <Route path="supporting-data/viability" element={<ViabilityChartPage />} />
          <Route path="supporting-data/bodyweight" element={<BodyweightChartPage />} />
          <Route path="phenotypes/:id" element={<PhenotypePage />} />
          <Route path="designs/:id" element={<DesignsPage />} />
          <Route path="cardiovascular" element={<CardiovascularLandingPage />} />
          <Route path="conservation" element={<ConservationLandingPage />} />
          <Route path="embryo" element={<EmbryoLandingPage />} />
          <Route path="embryo/vignettes" element={<EmbryoVignettesPage />} />
          <Route path="hearing" element={<HearingLandingPage />} />
          <Route path="histopath" element={<HistopathLandingPage />} />
          <Route path="late-adult-data" element={<LateAdultDataLandingPage />} />
          <Route path="metabolism" element={<MetabolismLandingPage />} />
          <Route path="publications" element={<PublicationsPage />} />
          <Route path="secondaryproject/idg" element={<IDGPage />} />
          <Route path="sexual-dimorphism" element={<SexualDimorphismLandingPage />} />
          <Route path="release" element={<ReleaseNotesPage />}/>
          <Route path="release/22.1" element={<ReleaseNotesPage releaseVersion="DR22.1" />}/>
          <Route path="release/22.0" element={<ReleaseNotesPage releaseVersion="DR22.0" />}/>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
