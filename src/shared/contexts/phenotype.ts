import { createContext } from "react";
import { PhenotypeSummary } from "@/models/phenotype";

export const PhenotypeContext = createContext<PhenotypeSummary>(null);

