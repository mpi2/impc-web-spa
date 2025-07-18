import lunr from "lunr";

export const fetchSearchIndex = (url) =>
  fetch(url)
    .then((res) => res.json())
    .then((serializedIndex) => {
      postMessage({ type: "index-loaded" });
      return lunr.Index.load(serializedIndex);
    });

export const searchAndReturnResults = (searchIndex, query) => {
  const ids = searchIndex.search(`${query}*`).map((item) => item.ref);
  console.log({
    type: "query-result",
    result: ids,
    noMatches: ids.length === 0,
  });
  return {
    type: "query-result",
    result: ids,
    noMatches: ids.length === 0,
  };
};
