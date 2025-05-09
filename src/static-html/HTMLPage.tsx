import { Fragment, memo, useEffect } from "react";
import "@/styles/main-site/css/main.css";
import "@/styles/main-site/css/wpp.css";
import "@/styles/main-site/css/style-block.css";

type HtmlPageProps = {
  htmlContent: string;
}


const HTMLPage = memo(({ htmlContent }: HtmlPageProps) => {

  useEffect(() => {
    const parser = new DOMParser();
    const htmlDocument = parser.parseFromString(htmlContent, "text/html");
    document.body = htmlDocument.body;

  }, [htmlContent]);

  return <Fragment>HTML PAGE</Fragment>;
});

export default HTMLPage;