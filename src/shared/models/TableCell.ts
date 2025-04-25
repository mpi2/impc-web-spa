import React from "react";
import { Model } from "@/models/index";

export interface TableCellProps<T extends Model> {
  value?: T;
  field?: keyof T;
  style?: React.CSSProperties;
}
