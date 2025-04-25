import DesignsPage from "./designs-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design Oligos page | International Mouse Phenotyping Consortium",
};

export default async function Page() {
  return <DesignsPage />;
}
