import { useQuery } from "@tanstack/react-query";
import { fetchLandingPageData } from "@/api-service";
import { PleiotropyData } from "@/models";

const phenotypesToID = {
  "respiratory system": "MP:0005388",
  "digestive/alimentary": "MP:0005381",
  "hematopoietic system": "MP:0005397",
  "hearing/vestibular/ear": "MP:0005377",
  "growth/size/body region": "MP:0005378",
  "limbs/digits/tail": "MP:0005371",
  "adipose tissue": "MP:0005375",
  "immune system": "MP:0005387",
  "liver/biliary system": "MP:0005370",
  "nervous system": "MP:0003631",
  craniofacial: "MP:0005382",
  "cardiovascular system": "MP:0005385",
  "reproductive system": "MP:0005389",
  "homeostasis/metabolism": "MP:0005376",
  "vision/eye": "MP:0005391",
  "renal/urinary system": "MP:0005367",
  embryo: "MP:0005380",
  muscle: "MP:0005369",
  integument: "MP:0010771",
  pigmentation: "MP:0001186",
  "behavior/neurological": "MP:0005386",
  "endocrine/exocrine gland": "MP:0005379",
  "mortality/aging": "MP:0010768",
  skeleton: "MP:0005390",
};

export const usePleiotropyQuery = (
  phenotype: keyof typeof phenotypesToID,
  enabled = true
) => {
  return useQuery({
    queryKey: ["landing-page", "pleiotropy"],
    queryFn: () => fetchLandingPageData("phenotype_pleiotropy"),
    placeholderData: [],
    select: (data) => data[phenotypesToID[phenotype]] as Array<PleiotropyData>,
    enabled,
  });
};
