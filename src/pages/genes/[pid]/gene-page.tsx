import { Container } from "react-bootstrap";
import Search from "@/components/Search";
import {
  Summary,
  ExternalLinks,
  Images,
  Publications,
  Histopathology,
  Expressions,
  Order,
  Phenotypes,
  HumanDiseases,
} from "@/components/Gene";
import { useEffect, useState } from "react";
import { AllelesStudiedContext, GeneContext } from "@/contexts";
import { useGeneSummaryQuery } from "@/hooks";
import { useParams } from "react-router";

const GenePage = () => {
  const params = useParams<{ pid: string }>();
  const [allelesStudied, setAlleles] = useState<Array<string>>([]);
  const [numAllelesAvailable, setNumAllelesAvailable] = useState(-1);
  const [allelesStudiedLoading, setAllelesStudiedLoading] =
    useState<boolean>(true);

  const allelesStudiedContextValue = {
    allelesStudied,
    setAlleles,
    allelesStudiedLoading,
    setAllelesStudiedLoading,
    numAllelesAvailable,
    setNumAllelesAvailable,
  };

  const { data: gene } = useGeneSummaryQuery(
    params.pid,
    !!params.pid
  );

  const geneData = gene;

  useEffect(() => {
    if (gene) {
      const hash = window.location.hash;
      if (hash.length > 0) {
        setTimeout(() => {
          document.querySelector(window.location.hash)?.scrollIntoView();
        }, 500);
      }
    }
  }, [geneData]);

  return (
    <>
      <GeneContext.Provider value={geneData}>
        <AllelesStudiedContext.Provider value={allelesStudiedContextValue}>
          <Search />
          <Container className="page">
            <Summary numOfAlleles={numAllelesAvailable ?? 0} />
            {!!geneData && (
              <>
                <Phenotypes />
                <Expressions />
                <Images />
                <HumanDiseases />
                <Histopathology />
                <Publications />
                <ExternalLinks />
                <Order
                  allelesStudied={allelesStudied}
                  allelesStudiedLoading={allelesStudiedLoading}
                />
              </>
            )}
          </Container>
        </AllelesStudiedContext.Provider>
      </GeneContext.Provider>
    </>
  );
};

export default GenePage;
