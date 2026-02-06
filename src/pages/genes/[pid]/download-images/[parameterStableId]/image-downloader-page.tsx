import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/api-service";
import Search from "@/components/Search";
import { Link, useParams } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faDownload } from "@fortawesome/free-solid-svg-icons";
import { Button, Container } from "react-bootstrap";
import { Card } from "@/components";
import Skeleton from "react-loading-skeleton";
import {
  SmartTable,
  AlleleCell,
  SexCell,
  PlainTextCell,
} from "@/components/SmartTable";
import { SortType, TableCellProps } from "@/models";
import _ from "lodash";
import { useMemo } from "react";
import styles from "../../images/[parameterStableId]/styles.module.scss";
import geneChromosomeMap from "@/static-data/chromosome-map.json";
import { DATA_SITE_BASE_PATH } from "@/shared";
import { Helmet } from "react-helmet";

type Image = {
  alleleSymbol: string;
  sex: string;
  zygosity: string;
  procedureName: string;
  parameterName: string;
  downloadUrl: string;
  sampleGroup: string;
  ageInWeeks: number;
};

const DownloadButtonCell = <T extends Image>(props: TableCellProps<T>) => {
  return (
    <Button
      href={_.get(props.value, props.field) as string}
      className="impc-secondary-button"
      variant=""
    >
      <FontAwesomeIcon icon={faDownload} />
      &nbsp;
      <span>Download</span>
    </Button>
  );
};

const DownloadImagesPage = () => {
  const params = useParams<{ pid: string; parameterStableId: string }>();
  const { parameterStableId = "" } = params;
  const pid = decodeURIComponent(params.pid);
  const chromosome: string = geneChromosomeMap[pid];
  const id = pid.replace(":", "_");
  const { data: mutantImages, isLoading: isMutantImagesLoading } = useQuery({
    queryKey: ["genes", pid, "images", parameterStableId],
    queryFn: () =>
      fetchData(`${chromosome}/${id}/images/${parameterStableId}/mutant.json`),
    enabled: !!pid && !!parameterStableId,
    select: (data) => {
      const selectedDataset = data.find((d) =>
        d.pipelineStableId.includes("IMPC"),
      );
      const dataset = !!selectedDataset ? selectedDataset : data[0];
      return {
        ...dataset,
        images: dataset.images.map((i) => ({
          ...i,
          procedureName: dataset.procedureName,
          parameterName: dataset.parameterName,
          sampleGroup: dataset.biologicalSampleGroup,
        })),
      };
    },
  });

  const { data: controlImages, isLoading: isControlImagesLoading } = useQuery({
    queryKey: ["control", pid, "images", parameterStableId],
    queryFn: () =>
      fetchData(
        `${chromosome}/${id}/images/${parameterStableId}/wildtype.json`,
      ),
    enabled: !!parameterStableId,
    select: (data) => {
      const selectedDataset = data.find((d) =>
        d.pipelineStableId.includes("IMPC"),
      );
      const dataset = !!selectedDataset ? selectedDataset : data[0];
      return {
        ...dataset,
        images: dataset.images.map((i) => ({
          ...i,
          procedureName: dataset.procedureName,
          parameterName: dataset.parameterName,
          sampleGroup: dataset.biologicalSampleGroup,
        })),
      };
    },
  });
  const defaultSort: SortType = useMemo(() => ["alleleSymbol", "asc"], []);

  const { geneSymbol } = useMemo(() => {
    if (mutantImages?.geneSymbol) {
      return { geneSymbol: mutantImages.geneSymbol };
    }
    return {
      geneSymbol: null,
    };
  }, [mutantImages]);

  return (
    <>
      <Search />
      <Helmet>
        <title>{`${geneSymbol} image comparator | International Mouse Phenotyping Consortium`}</title>
      </Helmet>
      <Container className="page">
        <Card>
          <div className={styles.subheading}>
            <span className={`${styles.subheadingSection} primary`}>
              <Link
                to={`/${DATA_SITE_BASE_PATH}/genes/${pid}#images`}
                className="mb-3"
                style={{
                  textTransform: "none",
                  fontWeight: "normal",
                  letterSpacing: "normal",
                  fontSize: "1.15rem",
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                &nbsp; Go Back to{" "}
                <i>
                  {mutantImages?.geneSymbol || (
                    <Skeleton style={{ width: "50px" }} inline />
                  )}
                </i>
              </Link>
            </span>
          </div>
          <h1 className="mb-4 mt-2" style={{ display: "flex", gap: "1rem" }}>
            <strong>
              {mutantImages?.procedureName || (
                <Skeleton style={{ width: "50px" }} inline />
              )}
            </strong>{" "}
            /&nbsp;
            {mutantImages?.parameterName || (
              <Skeleton style={{ width: "50px" }} inline />
            )}
          </h1>
          <h2>Mutant Files</h2>
          <SmartTable<Image>
            data={mutantImages?.images}
            defaultSort={defaultSort}
            showLoadingIndicator={isMutantImagesLoading}
            columns={[
              {
                width: 1,
                label: "Allele Symbol",
                field: "alleleSymbol",
                cmp: <AlleleCell />,
              },
              {
                width: 1,
                label: "Age",
                field: "ageInWeeks",
                cmp: <PlainTextCell />,
              },
              { width: 1, label: "Sex", field: "sex", cmp: <SexCell /> },
              {
                width: 1,
                label: "Zygosity",
                field: "zygosity",
                cmp: <PlainTextCell />,
              },
              {
                width: 1,
                label: "Sample group",
                field: "sampleGroup",
                cmp: <PlainTextCell />,
              },
              {
                width: 1,
                label: "Procedure",
                field: "procedureName",
                cmp: <PlainTextCell />,
              },
              {
                width: 1,
                label: "Parameter",
                field: "parameterName",
                cmp: <PlainTextCell />,
              },
              {
                width: 1,
                label: "",
                field: "downloadUrl",
                cmp: <DownloadButtonCell />,
                disabled: true,
              },
            ]}
          />
          <h2 className="mt-2">Control Files</h2>
          <SmartTable<Image>
            data={controlImages?.images}
            defaultSort={defaultSort}
            showLoadingIndicator={isControlImagesLoading}
            columns={[
              {
                width: 1,
                label: "Zygosity",
                field: "zygosity",
                cmp: <PlainTextCell />,
              },
              {
                width: 1,
                label: "Age",
                field: "ageInWeeks",
                cmp: <PlainTextCell />,
              },
              { width: 1, label: "Sex", field: "sex", cmp: <SexCell /> },
              {
                width: 1,
                label: "Procedure",
                field: "procedureName",
                cmp: <PlainTextCell />,
              },
              {
                width: 1,
                label: "Parameter",
                field: "parameterName",
                cmp: <PlainTextCell />,
              },
              {
                width: 1,
                label: "",
                field: "downloadUrl",
                cmp: <DownloadButtonCell />,
                disabled: true,
              },
            ]}
          />
        </Card>
      </Container>
    </>
  );
};

export default DownloadImagesPage;
