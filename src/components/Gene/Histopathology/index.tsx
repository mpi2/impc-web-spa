import { useContext, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMars, faVenus } from "@fortawesome/free-solid-svg-icons";
import { Alert } from "react-bootstrap";
import Link from "next/link";
import _ from "lodash";
import { fetchAPI } from "@/api-service";
import { useQuery } from "@tanstack/react-query";
import { GeneHistopathology } from "@/models/gene";
import { sectionWithErrorBoundary } from "@/hoc/sectionWithErrorBoundary";
import { GeneContext } from "@/contexts";
import {
  AlleleSymbol,
  Card,
  Pagination,
  SectionHeader,
  SortableTable,
} from "@/components";
import { SortType } from "@/models";

type GeneHistopathologyProps = {
  initialData: Array<GeneHistopathology>;
};

const Histopathology = ({ initialData }: GeneHistopathologyProps) => {
  const gene = useContext(GeneContext);
  const [sorted, setSorted] = useState<any[]>([]);
  const defaultSort: SortType = useMemo(() => ["parameterName", "asc"], []);

  const { isLoading, isError, data, error } = useQuery<
    Array<GeneHistopathology>
  >({
    queryKey: ["genes", gene.mgiGeneAccessionId, "histopathology"],
    queryFn: () =>
      fetchAPI(`/api/v1/genes/${gene.mgiGeneAccessionId}/gene_histopathology`),
    enabled: !!gene.mgiGeneAccessionId,
    select: (data) => data as Array<GeneHistopathology>,
  });

  useEffect(() => {
    if (data) {
      setSorted(_.orderBy(data, "parameterName", "asc"));
    }
  }, [data]);

  if (isLoading) {
    return (
      <Card id="histopathology">
        <SectionHeader
          containerId="#histopathology"
          title="Histopathology"
          href="https://dev.mousephenotype.org/help/data-visualization/gene-pages/"
        />
        <p className="grey">Loading...</p>
      </Card>
    );
  }

  if (!sorted?.length && gene.hasHistopathologyData) {
    return (
      <Card id="histopathology">
        <SectionHeader
          containerId="#histopathology"
          title="Histopathology"
          href="https://dev.mousephenotype.org/help/data-visualization/gene-pages/"
        />
        <Alert variant="primary">
          This gene doesn't have any significant Histopathology hits.&nbsp;
          <Link
            className="primary link"
            href={`/supporting-data/histopath/${gene.mgiGeneAccessionId}`}
          >
            Click here to see the raw data
          </Link>
        </Alert>
      </Card>
    );
  }

  if (isError || !sorted?.length) {
    return (
      <Card id="histopathology">
        <SectionHeader
          containerId="#histopathology"
          title="Histopathology"
          href="https://www.mousephenotype.org/help/data-visualization/gene-pages/"
        />
        <Alert variant="primary">
          There is no histopathology data found for <i>{gene.geneSymbol}</i>.
        </Alert>
      </Card>
    );
  }

  return (
    <Card id="histopathology">
      <SectionHeader
        containerId="#histopathology"
        title="Histopathology"
        href="https://www.mousephenotype.org/help/data-visualization/gene-pages/"
      />
      <p>
        Summary table of phenotypes displayed during the Histopathology
        procedure which are considered significant.
        <br />
        Full histopathology data table, including submitted images,&nbsp;
        <Link
          className="link primary"
          href={`/supporting-data/histopath/${gene.mgiGeneAccessionId}`}
        >
          can be accessed by clicking this link
        </Link>
        .
      </p>
      <Pagination data={sorted}>
        {(pageData) => (
          <SortableTable
            doSort={(sort) => {
              setSorted(_.orderBy(data, sort[0], sort[1]));
            }}
            defaultSort={defaultSort}
            headers={[
              { width: 4, label: "Phenotype", field: "parameterName" },
              {
                width: 2,
                label: "Allele",
                field: "alleleSymbol",
              },
              { width: 2, label: "Zygosity", field: "zygosity" },
              { width: 2, label: "Sex", field: "sex" },
              { width: 2, label: "Life Stage", field: "lifeStageName" },
            ]}
          >
            {pageData.map((p, index) => {
              return (
                <tr key={index}>
                  <td>
                    <Link
                      href={`/supporting-data/histopath/${gene.mgiGeneAccessionId}?anatomy=${(
                        p.parameterName.split(" -")[0] || ""
                      ).toLowerCase()}`}
                      legacyBehavior
                    >
                      <strong className="link">{`${p.parameterName} ${p.mpathTermName}`}</strong>
                    </Link>
                  </td>
                  <td>
                    <AlleleSymbol symbol={p.alleleSymbol} withLabel={false} />
                  </td>

                  <td>{p.zygosity}</td>
                  <td>
                    <FontAwesomeIcon
                      icon={p.sex == "female" ? faVenus : faMars}
                    />{" "}
                    {p.sex}
                  </td>
                  <td>{p.lifeStageName}</td>
                </tr>
              );
            })}
          </SortableTable>
        )}
      </Pagination>
    </Card>
  );
};

export default sectionWithErrorBoundary(
  Histopathology,
  "Histopathology",
  "histopathology",
);
