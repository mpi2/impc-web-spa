"use client";

import { Container } from "react-bootstrap";
import Search from "@/components/Search";
import Card from "@/components/Card";
import { useParams } from "next/navigation";
import Link from "next/link";
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

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL;

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

const AllelePage = ({ alleleData: alleleFromServer, alleleSymbol }) => {
  const params = useParams<{ pid: string; alleleSymbol: Array<string> }>();
  const pid = decodeURIComponent(params.pid);

  const { data: allele } = useQuery<AlleleSummary>({
    queryKey: ["genes", pid, "alleles", alleleSymbol, "order"],
    queryFn: () =>
      fetchAPI(`/api/v1/alleles/${pid}/${encodeURIComponent(alleleSymbol)}`),
    enabled: !!pid && !alleleFromServer,
  });

  const [qcData, setQcData] = useState<any[]>([]);

  const alleleData: AlleleSummary = allele || alleleFromServer;
  const allelePageURL = `${WEBSITE_URL}/data/alleles/${pid}/${alleleData.alleleName}`;
  const jsonLd = {
    "@type": "Dataset",
    "@context": "http://schema.org",
    name: `Mouse allele ${alleleData.geneSymbol}<${alleleData.alleleName}>`,
    description: `Discover mouse allele ${alleleData.alleleName} of ${alleleData.geneSymbol} gene, view all available products and tissues with their detailed information.`,
    creator: [
      {
        "@type": "Organization",
        name: "International Mouse Phenotyping Consortium",
      },
    ],
    citation: "https://doi.org/10.1093/nar/gkac972",
    isAccessibleForFree: true,
    url: allelePageURL,
    license: "https://creativecommons.org/licenses/by/4.0/",
  };

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

  const {
    mgiGeneAccessionId,
    alleleDescription,
    doesMiceProductsExist,
    doesEsCellProductsExist,
    doesCrisprProductsExist,
    doesIntermediateVectorProductsExist,
    doesTargetingVectorProductsExist,
    emsembleUrl,
  } = alleleData;

  const productTypes = [
    { name: "Mice", link: "#mice", hasData: doesMiceProductsExist },
    {
      name: "Targeted ES cells",
      link: "#esCell",
      hasData: doesEsCellProductsExist,
    },
    {
      name: "Targeting vectors",
      link: "#targetingVector",
      hasData: doesTargetingVectorProductsExist,
    },
    {
      name: "Intermediate vectors",
      link: "#intermediateVector",
      hasData: doesIntermediateVectorProductsExist,
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
                href={`/genes/${pid}`}
                className="mb-3"
                style={{
                  textTransform: "none",
                  fontWeight: "normal",
                  letterSpacing: "normal",
                  fontSize: "1.15rem",
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                &nbsp; Go Back to <i>{alleleData.geneSymbol}</i>
              </Link>
            </span>
          </div>
          <p className={`${styles.subheading} mt-2`}>ALLELE</p>
          <h1 className="mb-2 mt-2">
            <AlleleSymbol
              symbol={`${alleleData.geneSymbol}<${alleleData.alleleName}>`}
              withLabel={false}
            ></AlleleSymbol>
          </h1>
          <p className="mb-4 grey">{alleleDescription}</p>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {productTypes.map((productType) => (
              <ProductItem {...productType} />
            ))}
          </div>
        </Card>
        {doesEsCellProductsExist && (
          <AlleleMap
            mgiGeneAccessionId={mgiGeneAccessionId}
            alleleName={alleleSymbol as string}
            emsembleUrl={emsembleUrl}
          />
        )}
        {doesMiceProductsExist && (
          <Mice
            isCrispr={doesCrisprProductsExist}
            mgiGeneAccessionId={mgiGeneAccessionId}
            alleleName={alleleSymbol as string}
            setQcData={setQcData}
          />
        )}
        {doesEsCellProductsExist && (
          <ESCell
            mgiGeneAccessionId={mgiGeneAccessionId}
            alleleName={alleleSymbol as string}
            setQcData={setQcData}
          />
        )}
        {doesTargetingVectorProductsExist && (
          <TargetingVector
            mgiGeneAccessionId={mgiGeneAccessionId}
            alleleName={alleleSymbol as string}
          />
        )}
        {doesIntermediateVectorProductsExist && (
          <IntermediateVector
            mgiGeneAccessionId={mgiGeneAccessionId}
            alleleName={alleleSymbol as string}
          />
        )}

        {doesCrisprProductsExist && (
          <Crispr
            mgiGeneAccessionId={mgiGeneAccessionId}
            alleleName={alleleSymbol as string}
          />
        )}
        <Card>
          <Link
            href={`/genes/${pid}/#order`}
            scroll={false}
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
};

export default AllelePage;
