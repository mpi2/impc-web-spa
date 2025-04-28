import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import RootLayout from "./layout.tsx";
import SearchResults from "@/pages/search/search-page.tsx";
import GenePage from "@/pages/genes/[pid]/gene-page.tsx";


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<SearchResults data={{ numResults: -1, results: []}} />} />
          <Route path="genes/:pid" element={<GenePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
