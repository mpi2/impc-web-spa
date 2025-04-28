import { Container } from "react-bootstrap";
import Search from "@/components/Search";
import Card from "@/components/Card";
import { useParams } from "react-router";
import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRightLong,
  faCartShopping,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./styles.module.scss";
import { useEffect, useState } from "react";
import {
  AlleleMap,
  Crispr,
  ESCell,
  IntermediateVector,
  Mice,
  QCModal,
  TargetingVector,
} from "@/components/Allele";
import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/api-service";
import classNames from "classnames";
import { AlleleSymbol } from "@/components";
import { AlleleSummary } from "@/models";
import Skeleton from "react-loading-skeleton";

const ProductItem = ({
  name,
  link,
  hasData,
}: {
  name: string;
  link: string;
  hasData: boolean;
}) => (
  <div
    className={hasData ? styles.dataCollection : styles.dataCollectionInactive}
  >
    {name}
    <p className="mt-2">
      <a
        className={classNames("btn", {
          "btn-grey impc-base-button": !hasData,
          "impc-primary-button": hasData,
        })}
        style={{ minWidth: 120, cursor: hasData ? "pointer" : "initial" }}
        href={link}
      >
        {hasData ? (
          <span>
            <FontAwesomeIcon icon={faCartShopping} />
            Order
          </span>
        ) : (
          "Not available"
        )}
      </a>
    </p>
  </div>
);

const AllelePage = () => {
  const params = useParams<{ pid: string; alleleSymbol: string }>();
  const pid = decodeURIComponent(params.pid);
  const alleleSymbol = params.alleleSymbol;

  const { data: allele } = useQuery<AlleleSummary>({
    queryKey: ["genes", pid, "alleles", alleleSymbol, "order"],
    queryFn: () =>
      fetchAPI(`/api/v1/alleles/${pid}/${encodeURIComponent(alleleSymbol)}`),
    enabled: !!pid,
  });

  const [qcData, setQcData] = useState<any[]>([]);

  const alleleData: AlleleSummary = allele;

  useEffect(() => {
    if (alleleData) {
      const hash = window.location.hash;
      if (hash.length > 0) {
        setTimeout(() => {
          document.querySelector(window.location.hash)?.scrollIntoView();
        }, 100);
      }
    }
  }, [alleleData]);

  const productTypes = [
    { name: "Mice", link: "#mice", hasData: alleleData?.doesMiceProductsExist },
    {
      name: "Targeted ES cells",
      link: "#esCell",
      hasData: alleleData?.doesEsCellProductsExist,
    },
    {
      name: "Targeting vectors",
      link: "#targetingVector",
      hasData: alleleData?.doesTargetingVectorProductsExist,
    },
    {
      name: "Intermediate vectors",
      link: "#intermediateVector",
      hasData: alleleData?.doesIntermediateVectorProductsExist,
    },
  ];

  return (
    <>
      <Search />
      <Container className="page">
        <Card>
          <div className="subheading">
            <span className="subheadingSection primary">
              <Link
                to={`/genes/${pid}`}
                className="mb-3"
                style={{
                  textTransform: "none",
                  fontWeight: "normal",
                  letterSpacing: "normal",
                  fontSize: "1.15rem",
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                &nbsp; Go Back to <i>{alleleData?.geneSymbol}</i>
              </Link>
            </span>
          </div>
          <p className={`${styles.subheading} mt-2`}>ALLELE</p>
          <h1 className="mb-2 mt-2">
            {!!alleleData ? (
              <AlleleSymbol
                symbol={`${alleleData.geneSymbol}<${alleleData.alleleName}>`}
                withLabel={false}
              ></AlleleSymbol>
            ) : (
              <Skeleton style={{ width: "50px"}} inline />
            )}
          </h1>
          <p className="mb-4 grey">{alleleData?.alleleDescription}</p>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {productTypes.map((productType) => (
              <ProductItem {...productType} />
            ))}
          </div>
        </Card>
        {alleleData?.doesEsCellProductsExist && (
          <AlleleMap
            mgiGeneAccessionId={alleleData?.mgiGeneAccessionId}
            alleleName={alleleSymbol as string}
            emsembleUrl={alleleData?.emsembleUrl}
          />
        )}
        {alleleData?.doesMiceProductsExist && (
          <Mice
            isCrispr={alleleData?.doesCrisprProductsExist}
            mgiGeneAccessionId={alleleData?.mgiGeneAccessionId}
            alleleName={alleleSymbol as string}
            setQcData={setQcData}
          />
        )}
        {alleleData?.doesEsCellProductsExist && (
          <ESCell
            mgiGeneAccessionId={alleleData?.mgiGeneAccessionId}
            alleleName={alleleSymbol as string}
            setQcData={setQcData}
          />
        )}
        {alleleData?.doesTargetingVectorProductsExist && (
          <TargetingVector
            mgiGeneAccessionId={alleleData?.mgiGeneAccessionId}
            alleleName={alleleSymbol as string}
          />
        )}
        {alleleData?.doesIntermediateVectorProductsExist && (
          <IntermediateVector
            mgiGeneAccessionId={alleleData?.mgiGeneAccessionId}
            alleleName={alleleSymbol as string}
          />
        )}

        {alleleData?.doesCrisprProductsExist && (
          <Crispr
            mgiGeneAccessionId={alleleData?.mgiGeneAccessionId}
            alleleName={alleleSymbol as string}
          />
        )}
        <Card>
          <Link
            to={`/genes/${pid}/#order`}
            className="primary link"
          >
            See all alleles for the gene{" "}
            <FontAwesomeIcon icon={faArrowRightLong} />
          </Link>
        </Card>
      </Container>
      <QCModal
        onClose={() => {
          setQcData([]);
        }}
        qcData={qcData}
      />
    </>
  );
};

export default AllelePage;
