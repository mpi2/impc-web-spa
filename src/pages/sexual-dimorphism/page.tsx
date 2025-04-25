import { Metadata } from "next";
import SexualDimorphismPage from "./sexual-dimorphism-page";

export const metadata: Metadata = {
  title: "Sexual dimorphism | International Mouse Phenotyping Consortium",
};

export default async function Page() {
  return <SexualDimorphismPage />;
}
