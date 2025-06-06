export type SearchWebWorkerResult =
  | {
      type: "index-loaded";
    }
  | {
      type: "query-result";
      result: Array<string>;
      noMatches: boolean;
    };
