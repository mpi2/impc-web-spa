import { Container } from "react-bootstrap";
import Card from "@/components/Card";
import {
  Summary,
  PhenotypeGeneAssociations,
  ManhattanPlot,
} from "@/components/Phenotype";
import Search from "@/components/Search";
import { PhenotypeSummary } from "@/models/phenotype";
import { PhenotypeContext } from "@/contexts";
import { uniqBy } from "lodash";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { usePhenotypeSummaryQuery } from "@/hooks";
import { DATA_SITE_BASE_PATH } from "@/shared";

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
  const navigate = useNavigate();
  const phenotypeId = params.id;
  const {
    data: phenotype,
    isError,
    error,
  } = usePhenotypeSummaryQuery(phenotypeId);

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

  useEffect(() => {
    if (!phenotype && isError && error === "No content") {
      navigate(`/${DATA_SITE_BASE_PATH}/not-found`, { replace: true });
    }
  }, [phenotype, isError, error]);

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
