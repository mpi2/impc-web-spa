import "./styles/global.scss";
import Layout from "./components/Layout";
import Providers from "./providers.tsx";
import { config } from "@fortawesome/fontawesome-svg-core";
import { Outlet } from "react-router";
import Toast from "react-bootstrap/Toast";

import "@fortawesome/fontawesome-svg-core/styles.css";
import "react-circular-progressbar/dist/styles.css";
import "react-loading-skeleton/dist/skeleton.css";
import "normalize.css/normalize.css";
import { useHeartbeatService } from "@/hooks/heartbeat.ts";
config.autoAddCss = false;

export default function RootLayout() {
  const { connectionIsStable } = useHeartbeatService();
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
          <Toast show={!connectionIsStable} className="connection-toast">
            <Toast.Header>Unstable connection to data site</Toast.Header>
            <Toast.Body>
              The connection to the data site is unstable, some sections and
              pages won't be able to load properly. Reload the page or try
              later.
            </Toast.Body>
          </Toast>
        </Layout>
      </Providers>
    </>
  );
}
