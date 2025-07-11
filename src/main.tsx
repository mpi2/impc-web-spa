import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import RootLayout from "./layout.tsx";
import SearchResults from "@/pages/search/search-page.tsx";
import FallbackPage from "@/components/FallbackPage";
const GenePage = lazy(() => import("@/pages/genes/[pid]/gene-page.tsx"));
const PhenotypePage = lazy(
  () => import("@/pages/phenotypes/[id]/phenotype-page.tsx"),
);
const AllelePage = lazy(
  () => import("@/pages/alleles/[pid]/[...alleleSymbol]/allele-page.tsx"),
);
const SupportingDataPage = lazy(
  () => import("@/pages/supporting-data/supporting-data-page.tsx"),
);
const ImageComparator = lazy(
  () =>
    import(
      "@/pages/genes/[pid]/images/[parameterStableId]/image-viewer-page.tsx"
    ),
);
const ImageDownloader = lazy(
  () =>
    import(
      "@/pages/genes/[pid]/download-images/[parameterStableId]/image-downloader-page.tsx"
    ),
);
const HistopathChartPage = lazy(
  () =>
    import("@/pages/supporting-data/histopath/[pid]/histopath-chart-page.tsx"),
);
const ViabilityChartPage = lazy(
  () => import("@/pages/supporting-data/viability/viability-chart-page.tsx"),
);
const BodyweightChartPage = lazy(
  () => import("@/pages/supporting-data/bodyweight/bodyweight-chart-page.tsx"),
);
const DesignsPage = lazy(() => import("@/pages/designs/[id]/designs-page.tsx"));
const CardiovascularLandingPage = lazy(
  () => import("@/pages/cardiovascular/cardiovascular-page.tsx"),
);
const ConservationLandingPage = lazy(
  () => import("@/pages/conservation/conservation-page.tsx"),
);
const EmbryoLandingPage = lazy(() => import("@/pages/embryo/embryo-page.tsx"));
const EmbryoVignettesPage = lazy(
  () => import("@/pages/embryo/vignettes/vignettes-page.tsx"),
);
const HearingLandingPage = lazy(
  () => import("@/pages/hearing/hearing-page.tsx"),
);
const HistopathLandingPage = lazy(
  () => import("@/pages/histopath/histopath-page.tsx"),
);
const LateAdultDataLandingPage = lazy(
  () => import("@/pages/late-adult-data/late-adult-page.tsx"),
);
const MetabolismLandingPage = lazy(
  () => import("@/pages/metabolism/metabolism-page.tsx"),
);
const PublicationsPage = lazy(
  () => import("@/pages/publications/publications-page.tsx"),
);
const IDGPage = lazy(() => import("@/pages/secondaryproject/idg/idg-page.tsx"));
const SexualDimorphismLandingPage = lazy(
  () => import("@/pages/sexual-dimorphism/sexual-dimorphism-page.tsx"),
);
import { ReleaseNotesPage } from "@/components";
import HTMLPage from "./static-html/HTMLPage.tsx";
import IMPCDataGenerationPage from "../src/static-html/impc-data-generation.html?raw";
import GenomeBrowserPage from "@/pages/genes/[pid]/genome-browser/genome-browser-page.tsx";
import { DATA_SITE_BASE_PATH } from "@/shared";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Suspense fallback={<FallbackPage />}>
        <Routes>
          <Route path={DATA_SITE_BASE_PATH} element={<RootLayout />}>
            <Route path="search" element={<SearchResults />} />
            <Route path="genes/:pid" element={<GenePage />} />
            <Route
              path="genes/:pid/images/:parameterStableId"
              element={<ImageComparator />}
            />
            <Route
              path="genes/:pid/download-images/:parameterStableId"
              element={<ImageDownloader />}
            />
            <Route
              path="genes/:pid/genome-browser"
              element={<GenomeBrowserPage />}
            />
            <Route path="alleles/:pid/:alleleSymbol" element={<AllelePage />} />
            <Route path="supporting-data" element={<SupportingDataPage />} />
            <Route
              path="supporting-data/histopath/:pid"
              element={<HistopathChartPage />}
            />
            <Route
              path="supporting-data/viability"
              element={<ViabilityChartPage />}
            />
            <Route
              path="supporting-data/bodyweight"
              element={<BodyweightChartPage />}
            />
            <Route path="phenotypes/:id" element={<PhenotypePage />} />
            <Route path="designs/:id" element={<DesignsPage />} />
            <Route
              path="cardiovascular"
              element={<CardiovascularLandingPage />}
            />
            <Route path="conservation" element={<ConservationLandingPage />} />
            <Route path="embryo" element={<EmbryoLandingPage />} />
            <Route path="embryo/vignettes" element={<EmbryoVignettesPage />} />
            <Route path="hearing" element={<HearingLandingPage />} />
            <Route path="histopath" element={<HistopathLandingPage />} />
            <Route
              path="late-adult-data"
              element={<LateAdultDataLandingPage />}
            />
            <Route path="metabolism" element={<MetabolismLandingPage />} />
            <Route path="publications" element={<PublicationsPage />} />
            <Route path="secondaryproject/idg" element={<IDGPage />} />
            <Route
              path="sexual-dimorphism"
              element={<SexualDimorphismLandingPage />}
            />
            <Route path="release" element={<ReleaseNotesPage />} />
            <Route
              path="release/22.1"
              element={<ReleaseNotesPage releaseVersion="DR22.1" />}
            />
            <Route
              path="release/22.0"
              element={<ReleaseNotesPage releaseVersion="DR22.0" />}
            />
          </Route>
          <Route
            path="/understand/start-using-the-impc/impc-data-generation"
            element={<HTMLPage htmlContent={IMPCDataGenerationPage} />}
          ></Route>
          <Route
            path="*"
            element={<Navigate to={`${DATA_SITE_BASE_PATH}/search`} replace />}
          ></Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
);
