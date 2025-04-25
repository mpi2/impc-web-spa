import BatchQueryPage from "./batch-query-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "IMPC dataset batch query | International Mouse Phenotyping Consortium",
};

export default async function Page() {
  return <BatchQueryPage />;
}
