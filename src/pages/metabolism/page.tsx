import { Metadata } from "next";
import MetabolismPage from "./metabolism-page";

export const metadata: Metadata = {
  title: "Metabolism landing page | International Mouse Phenotyping Consortium",
};

export default async function Page() {
  return <MetabolismPage />;
}
