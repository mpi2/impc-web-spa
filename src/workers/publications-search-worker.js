import lunr from "lunr";

const params = new URL(location).searchParams;
const API_DATA_ROOT = params.get("api-data-root");
const onlyConsortium = params.get("only-consortium") === "true";
let fileName = onlyConsortium
  ? "publications/consortium_publications_index.json"
  : "publications/all_publications_index.json";
const url = `${API_DATA_ROOT}${fileName}`;
let searchIndex;
fetch(url)
  .then((res) => res.json())
  .then((serializedIndex) => {
    searchIndex = lunr.Index.load(serializedIndex);
  });
addEventListener("message", (event) => {
  console.log("Received message", event);
  postMessage(url);
});
