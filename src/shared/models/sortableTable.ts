import { ReactNode } from "react";

export type TableHeader = {
  width: number;
  label: string;
  field?: string;
  sortFn?: (any) => void;
  disabled?: boolean;
  sortField?: string;
  children?: TableHeader[];
  extraContent?: ReactNode;
};

export type SortType = [string | ((any) => void), "asc" | "desc"];

export type Sort = {
  field: string | undefined;
  sortFn: (any) => void | undefined;
  order: SortType[1];
};
