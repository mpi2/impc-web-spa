import { Metadata } from "next";
import HearingPage from "./hearing-page";

export const metadata: Metadata = {
  title: "Hearing | International Mouse Phenotyping Consortium",
};

export default async function Page() {
  return <HearingPage />;
}
