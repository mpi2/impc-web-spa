import { useContext, useMemo, useState } from "react";
import { usePhenotypeGeneAssociationsQuery } from "@/hooks";
import { PhenotypeContext } from "@/contexts";
import {
  PlainTextCell,
  SignificantPValueCell,
  SignificantSexesCell,
  SmartTable,
} from "@/components/SmartTable";
import { PhenotypeGenotypes } from "@/models/phenotype";
import { SortType, TableCellProps } from "@/models";
import { AlleleSymbol, DownloadData, FilterBox } from "@/components";
import { formatAlleleSymbol } from "@/utils";
import { get, orderBy, uniq } from "lodash";
import { Link } from "react-router";
import Skeleton from "react-loading-skeleton";
import { Alert } from "react-bootstrap";
import { DATA_SITE_BASE_PATH } from "@/shared";

const ParameterCell = <T extends PhenotypeGenotypes>(
  props: TableCellProps<T>,
) => {
  return (
    <>
      {props.value?.parameterName}
      <br />
      <span className="small">{props.value?.procedureName}</span>
    </>
  );
};

const PhenotypingCentreCell = <T extends PhenotypeGenotypes>(
  props: TableCellProps<T>,
) => {
  return (
    <>
      {props.value?.phenotypingCentre}
      <br />
      <span className="small">{props.value?.projectName}</span>
    </>
  );
};

const AlleleWithLinkCell = <T extends PhenotypeGenotypes>(
  props: TableCellProps<T>,
) => {
  const fullAllele = get(props.value, props.field) as string;
  const allele = formatAlleleSymbol(fullAllele);
  return (
    <span style={{ lineHeight: 1.5 }}>
      <small>
        <Link
          className="link"
          to={`/${DATA_SITE_BASE_PATH}/genes/${props.value.mgiGeneAccessionId}`}
        >
          <i>{allele[0]}</i>
        </Link>
      </small>
      <br />
      <strong>
        <AlleleSymbol symbol={fullAllele} withLabel={false} />
      </strong>
    </span>
  );
};

export const SupportingDataCell = <T extends PhenotypeGenotypes>(
  props: TableCellProps<T>,
) => {
  const mgiAccessionId = get(props.value, "mgiGeneAccessionId") as string;
  const mpTermpId = get(props.value, "phenotype.id") as string;

  let url = `/${DATA_SITE_BASE_PATH}/supporting-data?mgiGeneAccessionId=${mgiAccessionId}&mpTermId=${mpTermpId}`;
  const isAssociatedToPWG = props.value?.["projectName"] === "PWG" || false;
  if (isAssociatedToPWG) {
    url =
      "https://www.mousephenotype.org/publications/data-supporting-impc-papers/pain/";
  }
  return (
    <Link to={url}>
      <span className="link primary small float-right">Supporting data</span>
    </Link>
  );
};

const Associations = () => {
  const phenotype = useContext(PhenotypeContext);
  const [query, setQuery] = useState("");
  const [selectedZygosity, setSelectedZygosity] = useState("");
  const [selectedLifeStageName, setSelectedLifeStageName] = useState("");
  const [sortOptions, setSortOptions] = useState<string>("");
  const defaultSort: SortType = useMemo(() => ["alleleSymbol", "asc"], []);
  const { data, isFetching, isError } = usePhenotypeGeneAssociationsQuery(
    phenotype?.phenotypeId,
    !!phenotype,
    sortOptions,
  );

  const { availableZygosities, availableLifestages } = useMemo(() => {
    if (!data) {
      return {
        availableZygosities: [],
        availableLifestages: [],
      };
    }
    return {
      availableZygosities: uniq(data.map((item) => item.zygosity)),
      availableLifestages: uniq(data.map((item) => item.lifeStageName)),
    };
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data) {
      return [];
    }
    return data.filter(
      ({
        phenotypeName,
        phenotypeId,
        alleleSymbol,
        mgiGeneAccessionId,
        zygosity,
        lifeStageName,
      }: PhenotypeGenotypes) => {
        return (
          (!query ||
            `${mgiGeneAccessionId} ${alleleSymbol} ${phenotypeName} ${phenotypeId} `
              .toLowerCase()
              .includes(query.toLowerCase())) &&
          (!selectedZygosity || selectedZygosity === zygosity) &&
          (!selectedLifeStageName || selectedLifeStageName === lifeStageName)
        );
      },
    );
  }, [data, query, selectedZygosity, selectedLifeStageName]);

  const sortAssociations = (
    data: Array<PhenotypeGenotypes>,
    field: keyof PhenotypeGenotypes,
    order: "asc" | "desc",
  ) => {
    if (field === "pValue") {
      return data.sort((p1, p2) => {
        const p1PValue = p1.pValue;
        const p2PValue = p2.pValue;
        if (!p1PValue) {
          return 1;
        } else if (!p2PValue) {
          return -1;
        }
        return order === "asc" ? p1PValue - p2PValue : p2PValue - p1PValue;
      });
    }
    return orderBy(data, field, order);
  };

  if (isError) {
    return (
      <>
        <h2>
          IMPC Gene variants with{" "}
          {phenotype?.phenotypeName || <Skeleton inline width={150} />}
        </h2>
        <Alert variant="primary">No data available for this section</Alert>
      </>
    );
  }

  return (
    <>
      <h2>
        IMPC Gene variants with{" "}
        {phenotype?.phenotypeName || <Skeleton inline width={150} />}
      </h2>
      <p>
        Number of significant genotype-phenotype associations:&nbsp;
        {filteredData?.length}
      </p>
      <SmartTable<PhenotypeGenotypes>
        data={filteredData}
        defaultSort={defaultSort}
        customSortFunction={sortAssociations}
        customFiltering
        showLoadingIndicator={isFetching}
        additionalTopControls={
          <>
            <FilterBox
              controlId="queryFilterAD"
              hideLabel
              value={query}
              onChange={setQuery}
              ariaLabel="Filter by parameters"
              controlStyle={{ width: 150 }}
              emitValueLowercase={false}
            />
            <FilterBox
              controlId="zygosityFilterAD"
              label="Zygosity"
              value={selectedZygosity}
              onChange={(value) => setSelectedZygosity(value)}
              ariaLabel="Filter by zygosity"
              options={availableZygosities}
              controlStyle={{ width: 100, textTransform: "capitalize" }}
              isLoading={isFetching}
            />
            <FilterBox
              controlId="lifeStageFilterAD"
              label="Life Stage"
              value={selectedLifeStageName}
              onChange={(value) => setSelectedLifeStageName(value)}
              ariaLabel="Filter by life stage"
              options={availableLifestages}
              controlStyle={{ display: "inline-block", width: 100 }}
              isLoading={isFetching}
            />
          </>
        }
        additionalBottomControls={
          <DownloadData<PhenotypeGenotypes>
            data={data}
            fileName={`${phenotype?.phenotypeName}-associations`}
            fields={[
              {
                key: "alleleSymbol",
                label: "Gene",
                getValueFn: (item) => item?.alleleSymbol.split("<")[0],
              },
              {
                key: "alleleSymbol",
                label: "Allele",
                getValueFn: (item) =>
                  item?.alleleSymbol.split("<")[1].slice(0, -1),
              },
              { key: "phenotypeName", label: "Phenotype" },
              { key: "zygosity", label: "Zygosity" },
              { key: "sex", label: "Sex" },
              { key: "lifeStageName", label: "Life stage" },
              { key: "parameterName", label: "Parameter" },
              { key: "phenotypingCentre", label: "Phenotyping center" },
              {
                key: "pValue",
                label: "Most significant P-Value",
                getValueFn: (item) => item.pValue?.toString(10) || "1",
              },
            ]}
          />
        }
        columns={[
          {
            width: 2,
            label: "Gene / allele",
            field: "alleleSymbol",
            cmp: <AlleleWithLinkCell />,
          },
          {
            width: 1.3,
            label: "Phenotype",
            field: "phenotypeName",
            cmp: <PlainTextCell />,
          },
          {
            width: 1,
            label: "Supporting data",
            cmp: <SupportingDataCell />,
            disabled: true,
          },
          {
            width: 1,
            label: "Zygosity",
            field: "zygosity",
            cmp: <PlainTextCell style={{ textTransform: "capitalize" }} />,
          },
          {
            width: 0.7,
            label: "Sex",
            field: "sex",
            cmp: <SignificantSexesCell />,
          },
          {
            width: 1,
            label: "Life stage",
            field: "lifeStageName",
            cmp: <PlainTextCell />,
          },
          {
            width: 1.5,
            label: "Parameter",
            field: "parameterName",
            cmp: <ParameterCell />,
          },
          {
            width: 1.5,
            label: "Phenotyping Center",
            field: "phenotypingCentre",
            cmp: <PhenotypingCentreCell />,
          },
          {
            width: 1,
            label: "Most significant P-Value",
            field: "pValue",
            cmp: <SignificantPValueCell />,
          },
        ]}
      />
    </>
  );
};

export default Associations;
