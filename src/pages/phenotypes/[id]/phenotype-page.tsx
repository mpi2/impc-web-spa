"use client";

import { Container } from "react-bootstrap";
import Card from "@/components/Card";
import {
  Summary,
  PhenotypeGeneAssociations,
  ManhattanPlot,
} from "@/components/Phenotype";
import Search from "@/components/Search";
import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/api-service";
import { PhenotypeGenotypes, PhenotypeSummary } from "@/models/phenotype";
import { PhenotypeContext } from "@/contexts";
import { uniqBy } from "lodash";
import { useMemo } from "react";

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL;

type PhenotypePageProps = {
  phenotypeId: string;
  phenotype: PhenotypeSummary;
  phenotypeHits: Array<PhenotypeGenotypes>;
};

const sortAndUniqPhenotypeProcedures = (
  data: PhenotypeSummary,
): PhenotypeSummary => ({
  ...data,
  procedures: uniqBy(data.procedures, "procedureName").sort((a, b) => {
    return a.procedureName.localeCompare(b.procedureName);
  }),
});

const Phenotype = (props: PhenotypePageProps) => {
  const {
    phenotype: phenotypeFromServer,
    phenotypeHits: phenotypeHitsFromServer,
    phenotypeId,
  } = props;

  const {
    data: phenotype,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["phenotype", phenotypeId, "summary"],
    queryFn: () => fetchAPI(`/api/v1/phenotypes/${phenotypeId}/summary`),
    enabled: !!phenotypeId && !phenotypeFromServer,
  });

  const phenotypeData = useMemo(() => {
    const selectedData = phenotypeFromServer || phenotype;
    return {
      ...sortAndUniqPhenotypeProcedures(selectedData),
      phenotypeDefinition: selectedData.phenotypeDefinition.replaceAll(
        "gender",
        "sex",
      ),
    };
  }, [phenotypeFromServer, phenotype]);

  const { phenotypeName } = phenotypeData;
  const jsonLd = {
    "@type": "Dataset",
    "@context": "http://schema.org",
    name: `${phenotypeName} mouse phenotype`,
    description: `Discover ${phenotypeName} significant genes, associations, procedures and more. Data for phenotype ${phenotypeName} is all freely available for download.`,
    creator: [
      {
        "@type": "Organization",
        name: "International Mouse Phenotyping Consortium",
      },
    ],
    citation: "https://doi.org/10.1093/nar/gkac972",
    isAccessibleForFree: true,
    url: `${WEBSITE_URL}/data/phenotypes/${phenotypeId}`,
    license: "https://creativecommons.org/licenses/by/4.0/",
  };

  return (
    <>
      <PhenotypeContext.Provider value={phenotypeData}>
        <Search defaultType="phenotype" />
        <Container className="page">
          <Summary {...{ phenotype: phenotypeData }} />
          <Card id="associations-table">
            <PhenotypeGeneAssociations initialData={phenotypeHitsFromServer} />
          </Card>
          <Card>
            <h2>
              Most significant associations for {phenotypeData?.phenotypeName}
            </h2>
            <ManhattanPlot phenotypeId={phenotypeId} />
          </Card>
          <Card>
            <h2>The way we measure</h2>
            <p>Procedure</p>
            {phenotypeData?.procedures.map((prod) => (
              <p key={prod.procedureStableId}>
                <a
                  className="secondary"
                  href={`https://www.mousephenotype.org/impress/search?searchterm=${prod.procedureName}`}
                >
                  {prod.procedureName}
                </a>
              </p>
            ))}
          </Card>
        </Container>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </PhenotypeContext.Provider>
    </>
  );
};

export default Phenotype;
