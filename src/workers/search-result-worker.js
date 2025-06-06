import lunr from "lunr";

const params = new URL(location).searchParams;
const API_DATA_ROOT = params.get("api-data-root");
const searchType = params.get("type");
let fileName =
  searchType === "gene"
    ? "gene_search_index.json"
    : "phenotype_search_index.json";
const url = `${API_DATA_ROOT}${fileName}`;
let searchIndex;
fetch(url)
  .then((res) => res.json())
  .then((serializedIndex) => {
    postMessage({ type: "index-loaded" });
    searchIndex = lunr.Index.load(serializedIndex);
  });
addEventListener("message", (event) => {
  if (searchIndex) {
    const ids = searchIndex.search(`${event.data}*`).map((item) => item.ref);
    postMessage({
      type: "query-result",
      result: ids,
      noMatches: ids.length === 0,
    });
  }
});
