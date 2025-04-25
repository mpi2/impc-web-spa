import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/api-service";
import { orderBy } from "lodash";
import { PhenotypeGenotypes } from "@/models/phenotype";

export const processGenotypeHitsByPhenotype = (
  data: Array<PhenotypeGenotypes>,
  sortOptions: string,
) => {
  const groups: Record<string, PhenotypeGenotypes> = data.reduce((acc, d) => {
    const {
      phenotype: { id, name },
      alleleAccessionId,
      zygosity,
      sex,
      pValue,
      lifeStageName,
    } = d;

    const key = `${id}-${alleleAccessionId}-${zygosity}-${lifeStageName}`;
    if (acc[key]) {
      if (acc[key].pValue > pValue) {
        acc[key].pValue = Number(pValue);
        acc[key].sex = sex;
      }
    } else {
      acc[key] = { ...d };
    }
    acc[key][`pValue_${sex}`] = Number(pValue);

    return acc;
  }, {});
  const processed = Object.values(groups).map((d) => ({
    ...d,
    phenotypeName: d.phenotype.name,
    phenotypeId: d.phenotype.id,
  }));
  const [field, order] = sortOptions.split(";");
  return orderBy(
    processed,
    field,
    order as "asc" | "desc",
  ) as Array<PhenotypeGenotypes>;
};

export const usePhenotypeGeneAssociationsQuery = (
  phenotypeId: string,
  routerIsReady: boolean,
  sortOptions: string,
  initialData: Array<PhenotypeGenotypes>,
) => {
  return useQuery({
    queryKey: ["phenotype", phenotypeId, "genotype-hits"],
    queryFn: () =>
      fetchAPI(
        `/api/v1/phenotypes/${phenotypeId}/genotype-hits/by-any-phenotype-Id`,
      ),
    enabled: routerIsReady,
    select: (data: Array<PhenotypeGenotypes>) =>
      processGenotypeHitsByPhenotype(data, sortOptions),
    placeholderData: [],
  });
};
