import { Metadata } from "next";
import LateAdultDataPage from "./late-adult-page";

export const metadata: Metadata = {
  title: "Late Adult Data | IMPC | International Mouse Phenotyping Consortium",
};

export default async function Page() {
  return <LateAdultDataPage />;
}
