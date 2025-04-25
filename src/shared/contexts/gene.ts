import { createContext } from "react";
import { GeneSummary } from "@/models/gene";

export const GeneContext = createContext<GeneSummary>(null);

