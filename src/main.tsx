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
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
