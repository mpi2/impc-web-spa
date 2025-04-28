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
import { PhenotypeSummary } from "@/models/phenotype";
import { PhenotypeContext } from "@/contexts";
import { uniqBy } from "lodash";
import { useMemo } from "react";
import { useParams } from "react-router";

const sortAndUniqPhenotypeProcedures = (
  data: PhenotypeSummary,
): PhenotypeSummary => ({
  ...data,
  procedures: uniqBy(data?.procedures, "procedureName").sort((a, b) => {
    return a.procedureName.localeCompare(b.procedureName);
  }),
});

const Phenotype = () => {
  const params = useParams();
  const phenotypeId = params.id;
  const {
    data: phenotype,
    isLoading,
    isError,
  } = useQuery<PhenotypeSummary>({
    queryKey: ["phenotype", phenotypeId, "summary"],
    queryFn: () => fetchAPI(`/api/v1/phenotypes/${phenotypeId}/summary`),
    enabled: !!phenotypeId
  });

  const phenotypeData = useMemo(() => {
    const selectedData = phenotype;
    return {
      ...sortAndUniqPhenotypeProcedures(selectedData),
      phenotypeDefinition: selectedData?.phenotypeDefinition.replaceAll(
        "gender",
        "sex",
      ),
    };
  }, [phenotype]);

  return (
    <>
      <PhenotypeContext.Provider value={phenotypeData}>
        <Search defaultType="phenotype" />
        <Container className="page">
          <Summary {...{ phenotype: phenotypeData }} />
          <Card id="associations-table">
            <PhenotypeGeneAssociations />
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
      </PhenotypeContext.Provider>
    </>
  );
};

export default Phenotype;
