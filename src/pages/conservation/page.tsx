import { Metadata } from "next";
import ConservationLandingPage from "./conservation-page";

export const metadata: Metadata = {
  title:
    "Conservation landing page | International Mouse Phenotyping Consortium",
};

export default async function Page() {
  return <ConservationLandingPage />;
}
