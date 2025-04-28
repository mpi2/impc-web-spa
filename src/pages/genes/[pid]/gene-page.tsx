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
import {
  GeneDisease,
  GeneExpression,
  GeneHistopathology,
  GeneImage,
  GeneOrder,
  GenePhenotypeHits,
  GeneSummary,
} from "@/models/gene";
import { useParams } from "react-router";

type GenePageProps = {
  gene: GeneSummary | null;
  significantPhenotypes: Array<GenePhenotypeHits>;
  orderData: Array<GeneOrder>;
  expressionData: Array<GeneExpression>;
  imageData: Array<GeneImage>;
  histopathologyData: Array<GeneHistopathology>;
  humanDiseasesData: Array<GeneDisease>;
};

const GenePage = (props: GenePageProps) => {
  const {
    gene: geneFromServer,
    significantPhenotypes: sigPhenotypesFromServer,
    orderData: orderDataFromServer,
    expressionData: expressionDataFromServer,
    imageData: imageDataFromServer,
    histopathologyData: histopathologyDataFromServer,
    humanDiseasesData: associatedDiseasesDataFromServer,
  } = props;
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
    !!params.pid && !geneFromServer,
    geneFromServer,
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
            <Summary numOfAlleles={orderDataFromServer?.length ?? 0} />
            {!!geneData && (
              <>
                <Phenotypes sigPhenotypesFromServer={sigPhenotypesFromServer} />
                <Expressions initialData={expressionDataFromServer} />
                <Images initialData={imageDataFromServer} />
                <HumanDiseases initialData={associatedDiseasesDataFromServer} />
                <Histopathology initialData={histopathologyDataFromServer} />
                <Publications />
                <ExternalLinks />
                <Order
                  allelesStudied={allelesStudied}
                  allelesStudiedLoading={allelesStudiedLoading}
                  orderDataFromServer={orderDataFromServer}
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
