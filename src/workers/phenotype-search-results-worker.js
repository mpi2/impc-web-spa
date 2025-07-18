import { fetchSearchIndex, searchAndReturnResults } from "./shared.js";

const API_DATA_ROOT = import.meta.env.VITE_PROTOTYPE_DATA_ROOT;
const url = `${API_DATA_ROOT}phenotype_search_index.json`;
let initialQuery = null;
let searchIndex;

if (API_DATA_ROOT) {
  fetchSearchIndex(url).then((searchIndexRes) => {
    searchIndex = searchIndexRes;
    postMessage({ type: "index-loaded" });
    if (initialQuery) {
      postMessage(searchAndReturnResults(searchIndexRes, initialQuery));
      initialQuery = null;
    }
  });
}

addEventListener("message", (event) => {
  // console.log("Received event", event.data);
  if (searchIndex) {
    postMessage(searchAndReturnResults(searchIndex, event.data));
  } else {
    initialQuery = event.data;
  }
});
