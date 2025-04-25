import "../styles/global.scss";
import Script from "next/script";
import { ReactNode } from "react";
import Layout from "../components/Layout";
import Providers from "./providers";
import { config } from "@fortawesome/fontawesome-svg-core";
import { Roboto } from "next/font/google";

import "@fortawesome/fontawesome-svg-core/styles.css";
import "react-circular-progressbar/dist/styles.css";
import "react-loading-skeleton/dist/skeleton.css";
import "normalize.css/normalize.css";
config.autoAddCss = false;

const roboto = Roboto({
  style: ["normal", "italic"],
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-impc",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={roboto.className}>
      <head />
      <body>
        <Script>
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
        </Script>
        <Script
          id="usercentrics-cmp"
          src="https://web.cmp.usercentrics.eu/ui/loader.js"
          data-settings-id="y7WXZ02Q6JSq6Q"
          async
        />
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
