import { Metadata } from "next";
import IDGPage from "./idg-page";

export const metadata: Metadata = {
  title:
    "Illuminating the Druggable Genome | International Mouse Phenotyping Consortium",
};

export default async function Page() {
  return <IDGPage />;
}
