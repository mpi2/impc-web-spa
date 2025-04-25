import { Metadata } from "next";
import PublicationsPage from "./publications-page";

export const metadata: Metadata = {
  title:
    "Publications with IMPC alleles | International Mouse Phenotyping Consortium",
};

export default async function Page() {
  return <PublicationsPage />;
}
