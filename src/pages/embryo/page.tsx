import { Metadata } from "next";
import EmbryoLandingPage from "./embryo-page";

export const metadata: Metadata = {
  title: "IMPC Embryo | International Mouse Phenotyping Consortium",
};

export default async function Page() {
  return <EmbryoLandingPage />;
}
