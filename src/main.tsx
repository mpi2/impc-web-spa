import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import RootLayout from "./layout.tsx";
import SearchResults from "@/pages/search/search-page.tsx";
import GenePage from "@/pages/genes/[pid]/gene-page.tsx";

const genePageProps = {
  gene: null,
  significantPhenotypes: [],
  orderData: [],
  expressionData: [],
  imageData: [],
  histopathologyData: [],
  humanDiseasesData: [],
};


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<SearchResults data={{ numResults: -1, results: []}} />} />
          <Route path="genes/:pid" element={<GenePage {...genePageProps} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
