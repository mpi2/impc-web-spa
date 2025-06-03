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
    <>
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
    </>
  );
}
