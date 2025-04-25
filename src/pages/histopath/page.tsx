import { Metadata } from "next";
import HistopathPage from "./histopath-page";

export const metadata: Metadata = {
  title: "Histopathology | International Mouse Phenotyping Consortium",
};

export default async function Page() {
  return <HistopathPage />;
}
