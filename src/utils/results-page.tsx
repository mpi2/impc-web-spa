import DOMPurify from "isomorphic-dompurify";
import ReactHtmlParser from "react-html-parser";
export const surroundWithMarkEl = (text: string, query: string | undefined) => {
  if (!query) {
    return text;
  }
  const matchingSubsIndex = text.toLowerCase().indexOf(query?.toLowerCase());
  const originalTextMatchedQuery =
    matchingSubsIndex !== -1
      ? DOMPurify.sanitize(
          text.slice(matchingSubsIndex, matchingSubsIndex + query.length),
        )
      : "";
  return ReactHtmlParser(
    text.replaceAll(
      originalTextMatchedQuery,
      `<mark style="padding: 0;">${originalTextMatchedQuery}</mark>`,
    ),
  );
};
