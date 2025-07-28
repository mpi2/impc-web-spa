import lunr from "lunr";

const API_DATA_ROOT = import.meta.env.VITE_PROTOTYPE_DATA_ROOT;
const url = `${API_DATA_ROOT}publications/consortium-publications-index.json`;

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
