import { useContext, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { formatAlleleSymbol } from "@/utils";
import { Alert } from "react-bootstrap";
import _ from "lodash";
import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/api-service";
import { Publication } from "../../PublicationsList/types";
import moment from "moment";
import MoreItemsTooltip from "../../MoreItemsTooltip";
import { sectionWithErrorBoundary } from "@/hoc/sectionWithErrorBoundary";
import {
  Card,
  DownloadData,
  Pagination,
  SectionHeader,
  SortableTable,
} from "@/components";
import { SortType } from "@/models";
import { GeneContext } from "@/contexts";

const ALLELES_COUNT = 2;
const AllelesCell = ({ pub }: { pub: Publication }) => {
  const alleles = pub.alleles.map((allele) =>
    formatAlleleSymbol(allele.alleleSymbol),
  );
  return (
    <>
      {alleles.slice(0, ALLELES_COUNT).map((symbol, index) => (
        <i key={index}>
          {symbol[0]}
          <sup>{symbol[1]}</sup>
          &nbsp;
        </i>
      ))}
      <MoreItemsTooltip
        items={pub.alleles.map((a) => a.alleleSymbol)}
        maxItems={ALLELES_COUNT}
      />
    </>
  );
};

const Publications = () => {
  const gene = useContext(GeneContext);
  const [page, setPage] = useState(0);
  let totalItems = 0;
  const [sorted, setSorted] = useState<any[]>([]);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["genes", gene.mgiGeneAccessionId, "publication", page],
    queryFn: () =>
      fetchAPI(
        `/api/v1/genes/${gene.mgiGeneAccessionId}/publication?page=${page}`,
      ),
    enabled: !!gene.mgiGeneAccessionId,
    select: (response) => {
      totalItems = response.totalElements;
      return response.content as Array<Publication>;
    },
  });
  const defaultSort: SortType = useMemo(() => ["title", "asc"], []);

  useEffect(() => {
    if (data) {
      setSorted(_.orderBy(data, "title", "asc"));
    }
  }, [data]);

  const getPubDate = (publication: Publication) => {
    return moment(publication.publicationDate).format("MM/YYYY");
  };

  if (isLoading) {
    return (
      <Card id="publications">
        <SectionHeader
          containerId="#publications"
          title="IMPC related publications"
          href="https://www.mousephenotype.org/help/data-visualization/gene-pages/"
        />
        <p className="grey">Loading...</p>
      </Card>
    );
  }

  if (isError || !sorted) {
    return (
      <Card id="publications">
        <SectionHeader
          containerId="#publications"
          title="IMPC related publications"
          href="https://www.mousephenotype.org/help/data-visualization/gene-pages/"
        />
        <Alert variant="primary">
          No publications found that use IMPC mice or data for the{" "}
          <i>{gene.geneSymbol}</i> gene.
        </Alert>
      </Card>
    );
  }

  return (
    <Card id="publications">
      <SectionHeader
        containerId="#publications"
        title="IMPC related publications"
        href="https://dev.mousephenotype.org/help/data-visualization/gene-pages/"
      />
      <p>
        The table below lists publications which used either products generated
        by the IMPC or data produced by the phenotyping efforts of the IMPC.
        These publications have also been associated to the{" "}
        <i>{gene.geneSymbol}</i> gene.
      </p>
      {!!sorted && sorted.length ? (
        <Pagination
          data={sorted}
          totalItems={totalItems}
          additionalBottomControls={
            <DownloadData<Publication>
              data={sorted}
              fileName={`${gene.geneSymbol}-related-publications`}
              fields={[
                { key: "title", label: "Title" },
                { key: "journalTitle", label: "Journal" },
                {
                  key: "alleles",
                  label: "Allele(s)",
                  getValueFn: (item) =>
                    item.alleles
                      .map(({ alleleSymbol }) => alleleSymbol)
                      .join(","),
                },
                {
                  key: "alleles",
                  label: "Pubmed link",
                  getValueFn: (item) =>
                    `https://pubmed.ncbi.hlm.nih.gov/${item.pmId}`,
                },
              ]}
            />
          }
        >
          {(pageData) => (
            <SortableTable
              doSort={(sort) => {
                setSorted(_.orderBy(data, sort[0], sort[1]));
              }}
              defaultSort={defaultSort}
              headers={[
                { width: 5, label: "Title", field: "title" },
                {
                  width: 3,
                  label: "Journal",
                  field: "journalTitle",
                },
                { width: 2, label: "Allele", field: "alleleSymbol" },
                { width: 2, label: "PubMed ID", field: "pmId" },
              ]}
            >
              {pageData.map((p, index) => {
                return (
                  <tr key={index}>
                    <td>
                      {p.doi ? (
                        <a
                          className="link"
                          target="_blank"
                          href={`https://www.doi.org/${p.doi}`}
                        >
                          <strong>{p.title}</strong>&nbsp;
                          <FontAwesomeIcon
                            className="grey"
                            size="xs"
                            icon={faExternalLinkAlt}
                          />
                        </a>
                      ) : (
                        <strong>{p.title}</strong>
                      )}
                    </td>
                    <td>
                      {p.journalTitle} ({getPubDate(p)})
                    </td>
                    <td>
                      <AllelesCell pub={p} />
                    </td>
                    <td>
                      <a
                        href={`https://pubmed.ncbi.nlm.nih.gov/${p.pmId}`}
                        target="_blank"
                        className="link primary"
                        title={`view more publication details in PubMed`}
                      >
                        {p.pmId}&nbsp;
                        <FontAwesomeIcon
                          icon={faExternalLinkAlt}
                          className="grey"
                          size="xs"
                        />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </SortableTable>
          )}
        </Pagination>
      ) : (
        <Alert variant="primary">
          No publications found that use IMPC mice or data for the{" "}
          <i>{gene.geneSymbol}</i> gene.
        </Alert>
      )}
    </Card>
  );
};

export default sectionWithErrorBoundary(
  Publications,
  "IMPC related publications",
  "publications",
);
