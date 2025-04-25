import { Metadata } from "next";
import CardiovascularLandingPage from "./cardiovascular-page";

export const metadata: Metadata = {
  title: "Cardiovascular system | International Mouse Phenotyping Consortium",
};

export default async function Page() {
  return <CardiovascularLandingPage />;
}
