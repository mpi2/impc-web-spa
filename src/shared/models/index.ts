import * as Gene from "./gene";
import * as Phenotype from "./phenotype";
import * as Allele from "./allele";
import type { PhenotypeRef } from "./phenotype-ref";
import { MetabolismGeneData } from "@/app/metabolism/metabolism-page";
import { HistopathologyResponse, Histopathology } from "./histopathology";
import { GrossPathology, GrossPathologyDataset } from "./gross-pathology";
import { Dataset } from "./dataset";
import * as Release from "./release";

export type { PhenotypeRef } from "./phenotype-ref";
export type { TableCellProps } from "./TableCell";
export type { HistopathologyResponse, Histopathology } from "./histopathology";
export type { GrossPathology, GrossPathologyDataset } from "./gross-pathology";
export type { Dataset, DatasetExtra } from "./dataset";
export type { Gene };
export type { Phenotype };
export type { Allele };
export type {
  GeneralChartProps,
  ChartSeries,
  PleiotropyData,
  ChartDimensions,
} from "./chart";
export type { EventHandler, EventBus, Bus, EventMap } from "./eventbus";
export type { TableHeader, Sort, SortType } from "./sortableTable";
export type { PaginatedResponse } from "./paginated-response";
export type {
  LateAdultDataResponse,
  LateAdultDataParsed,
  LateAdultRowResponse,
} from "./LandingPages";
export type { AlleleSummary } from "./allele";
export type { Release };
export type { PublicationAggregationDataResponse } from "./publications";

type Model =
  | PhenotypeRef
  | typeof Gene
  | typeof Phenotype
  | MetabolismGeneData
  | Dataset
  | HistopathologyResponse
  | Histopathology
  | GrossPathology
  | GrossPathologyDataset;
export type { Model };
