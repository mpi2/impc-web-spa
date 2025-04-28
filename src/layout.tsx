import "./styles/global.scss";
import Layout from "./components/Layout";
import Providers from "./providers.tsx";
import { config } from "@fortawesome/fontawesome-svg-core";
import { Outlet } from "react-router";

import "@fortawesome/fontawesome-svg-core/styles.css";
import "react-circular-progressbar/dist/styles.css";
import "react-loading-skeleton/dist/skeleton.css";
import "normalize.css/normalize.css";
config.autoAddCss = false;

export default function RootLayout() {
  return (
    <html lang="en">
    <head>
      <title>International Mouse Phenotype Consortium</title>
      <link rel="icon" href="/favicon.ico" />
    </head>
    <body>
    <script>
      {` // Google Tag Manager
              (function(w, d, s, l, i) {
                  w[l] = w[l] || [];
                  w[l].push({
                      'gtm.start': new Date().getTime(),
                      event: 'gtm.js'
                  });
                  var f = d.getElementsByTagName(s)[0],
                      j = d.createElement(s),
                      dl = l != 'dataLayer' ? '&l=' + l : '';
                  j.async = true;
                  j.src =
                      'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
                  f.parentNode.insertBefore(j, f);
              })(window, document, 'script', 'dataLayer', 'GTM-NZPSPWR');`}
    </script>
    <script
      type="text/javascript"
      id="usercentrics-cmp"
      src="https://web.cmp.usercentrics.eu/ui/loader.js"
      data-settings-id="y7WXZ02Q6JSq6Q"
      async
    />
    <Providers>
      <Layout>
        <Outlet />
      </Layout>
    </Providers>
    </body>
    </html>
  );
}
