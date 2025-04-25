import { useContext, useEffect, useMemo, useState } from "react";
import {
  AlleleCell,
  OptionsCell,
  PlainTextCell,
  SmartTable,
} from "@/components/SmartTable";
import { GeneStatisticalResult } from "@/models/gene";
import { DownloadData, FilterBox } from "@/components";
import { AllelesStudiedContext, GeneContext } from "@/contexts";
import {
  MutantCountCell,
  ParameterCell,
  PhenotypeIconsCell,
  SignificantPValueCell,
  SupportingDataCell,
} from "./custom-cells";
import { orderPhenotypedSelectionChannel } from "@/eventChannels";
import { usePagination } from "@/hooks";
import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/api-service";
import { PaginatedResponse, SortType } from "@/models";
import { buildURL } from "@/utils";
import Skeleton from "react-loading-skeleton";
import { useDebounce } from "usehooks-ts";
import Footnotes from "../Footnotes";
import { Alert } from "react-bootstrap";

type FilterOptions = {
  procedures: Array<string>;
  systems: Array<string>;
  lifestages: Array<string>;
  zygosities: Array<string>;
  alleles: Array<string>;
};

type SelectedValues = {
  procedureName: string | undefined;
  topLevelPhenotypeName: string | undefined;
  lifeStageName: string | undefined;
  zygosity: string | undefined;
  alleleSymbol: string | undefined;
};

const defaultFilterOptions: FilterOptions = {
  procedures: [],
  systems: [],
  lifestages: [],
  zygosities: [],
  alleles: [],
};

const defaultSelectedValues: SelectedValues = {
  procedureName: undefined,
  topLevelPhenotypeName: undefined,
  lifeStageName: undefined,
  zygosity: undefined,
  alleleSymbol: undefined,
};

const getMutantCount = (dataset: GeneStatisticalResult) => {
  if (!dataset.maleMutantCount && !dataset.femaleMutantCount) {
    return "N/A";
  }
  return `${dataset.maleMutantCount || 0}m/${dataset.femaleMutantCount || 0}f`;
};

type Props = {
  tableIsVisible: boolean;
  onTotalData: (arg: number) => void;
  additionalSelectedValues?: SelectedValues;
  queryFromURL: string;
  hasDataRelatedToPWG: boolean;
};

const AllData = (props: Props) => {
  const gene = useContext(GeneContext);
  const {
    onTotalData,
    additionalSelectedValues,
    queryFromURL,
    hasDataRelatedToPWG,
  } = props;
  const { setAlleles } = useContext(AllelesStudiedContext);
  const [sortField, setSortField] = useState<string>("pValue");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const defaultSort: SortType = useMemo(() => ["pValue", "asc"], []);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [query, setQuery] = useState(queryFromURL);
  const debouncedQuery = useDebounce(query, 500);
  const [filterOptions, setFilterOptions] =
    useState<FilterOptions>(defaultFilterOptions);

  const initialSelectedValues = Object.assign(
    { ...defaultSelectedValues },
    additionalSelectedValues,
  );
  const [selectedValues, setSelectedValues] = useState<SelectedValues>(
    initialSelectedValues,
  );
  const [hoveringRef, setHoveringRef] = useState<"*" | "**" | "+" | null>(null);

  const updateSelectedValue = (
    key: keyof SelectedValues,
    newValue: string,
  ): void => {
    setActivePage(0);
    setSelectedValues((prevState) => ({
      ...prevState,
      [key]: newValue,
    }));
  };

  const { activePage, pageSize, setActivePage, setPageSize } = usePagination();

  const { data, isError, isFetching } = useQuery({
    queryKey: [
      "statistical-result",
      gene.mgiGeneAccessionId,
      activePage,
      pageSize,
      selectedValues,
      sortField,
      sortOrder,
      debouncedQuery,
    ],
    queryFn: () => {
      const url = `/api/v1/genes/statistical-result/filtered/page`;
      const params = {
        mgiGeneAccessionId: gene.mgiGeneAccessionId,
        page: activePage.toString(10),
        size: pageSize.toString(10),
        sortBy: sortField,
        sort: sortOrder,
      };

      Object.entries(selectedValues)
        .filter(([, value]) => !!value)
        .forEach(([key, value]) => (params[key] = value));

      if (debouncedQuery) {
        params["searchQuery"] = debouncedQuery;
      }

      return fetchAPI(buildURL(url, params));
    },
    select: (response: PaginatedResponse<GeneStatisticalResult>) => {
      return {
        ...response,
        content: response.content.map((d) => ({
          ...d,
          pValue: Number(d.pValue),
          mutantCount: getMutantCount(d),
        })),
      } as PaginatedResponse<GeneStatisticalResult>;
    },
    enabled: props.tableIsVisible,
  });

  const { data: filterData } = useQuery({
    queryKey: ["filterData", gene.mgiGeneAccessionId],
    queryFn: () =>
      fetchAPI(
        `/api/v1/genes/${gene.mgiGeneAccessionId}/dataset/get_filter_data`,
      ),
    enabled: props.tableIsVisible,
  });

  const getDownloadData = () => {
    const url = `/api/v1/genes/statistical-result/filtered`;
    const params = {
      mgiGeneAccessionId: gene.mgiGeneAccessionId,
      sortBy: sortField,
      sort: sortOrder,
    };

    Object.entries(selectedValues)
      .filter(([, value]) => !!value)
      .forEach(([key, value]) => (params[key] = value));

    if (query) {
      params["searchQuery"] = query;
    }

    return fetchAPI(buildURL(url, params));
  };

  const onRefHover = (ref: "*" | "**" | "+", active: boolean) => {
    const value = active ? ref : null;
    setHoveringRef(value);
  };

  useEffect(() => {
    if (data && data.totalElements !== totalItems) {
      setTotalItems(data.totalElements);
      onTotalData(data.totalElements);
    }
  }, [data, totalItems]);

  useEffect(() => {
    if (filterData) {
      setFilterOptions({
        procedures: filterData.procedureName,
        systems: filterData.topLevelPhenotypes,
        lifestages: filterData.lifeStageName,
        zygosities: filterData.zygosity,
        alleles: filterData.alleleSymbol,
      });
      setAlleles(filterData.alleleSymbol);
    }
  }, [filterData]);

  useEffect(() => {
    const unsubscribeOnAlleleSelection = orderPhenotypedSelectionChannel.on(
      "onAlleleSelected",
      (newAllele) => {
        if (newAllele !== selectedValues.alleleSymbol) {
          updateSelectedValue("alleleSymbol", newAllele);
        }
      },
    );
    return () => {
      unsubscribeOnAlleleSelection();
    };
  }, [selectedValues.alleleSymbol]);

  useEffect(() => {
    if (
      !!additionalSelectedValues &&
      Object.values(additionalSelectedValues).some(Boolean)
    ) {
      setSelectedValues(additionalSelectedValues);
    }
  }, [additionalSelectedValues]);

  useEffect(() => {
    if (!!queryFromURL && query !== queryFromURL) {
      setQuery(queryFromURL);
    }
  }, [queryFromURL, query]);

  if (isError && !data) {
    return (
      <Alert variant="primary" className="mt-3">
        <span>
          No phenotype data available for <i>{gene.geneSymbol}</i>.
        </span>
      </Alert>
    );
  }

  return (
    <SmartTable<GeneStatisticalResult>
      data={data?.content}
      defaultSort={defaultSort}
      onSortChange={(sortOptions) => {
        const [sortField, sortOrder] = sortOptions.split(";");
        setSortField(sortField);
        setSortOrder(sortOrder);
      }}
      customFiltering
      additionalTopControls={
        !!filterData ? (
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
              controlId="procedureFilterAD"
              label="Procedure"
              value={selectedValues.procedureName}
              onChange={(value) => updateSelectedValue("procedureName", value)}
              ariaLabel="Filter by procedures"
              options={filterOptions.procedures}
            />
            <FilterBox
              controlId="alleleFilterAD"
              label="Allele"
              value={selectedValues.alleleSymbol}
              onChange={(value) => updateSelectedValue("alleleSymbol", value)}
              ariaLabel="Filter by allele"
              options={filterOptions.alleles}
            />
            <FilterBox
              controlId="zygosityFilterAD"
              label="Zygosity"
              value={selectedValues.zygosity}
              onChange={(value) => updateSelectedValue("zygosity", value)}
              ariaLabel="Filter by zygosity"
              options={filterOptions.zygosities}
              controlStyle={{ width: 100, textTransform: "capitalize" }}
            />
            <FilterBox
              controlId="systemFilterAD"
              label="Phy. System"
              value={selectedValues.topLevelPhenotypeName}
              onChange={(value) =>
                updateSelectedValue("topLevelPhenotypeName", value)
              }
              ariaLabel="Filter by physiological system"
              options={filterOptions.systems}
            />
            <FilterBox
              controlId="lifeStageFilterAD"
              label="Life Stage"
              value={selectedValues.lifeStageName}
              onChange={(value) => updateSelectedValue("lifeStageName", value)}
              ariaLabel="Filter by life stage"
              options={filterOptions.lifestages}
              controlStyle={{ display: "inline-block", width: 100 }}
            />
          </>
        ) : (
          <>
            <div>
              <Skeleton width={100} height="1.75rem" inline />
            </div>
            <div>
              <Skeleton width={100} height="1.75rem" inline />
            </div>
            <div>
              <Skeleton width={100} height="1.75rem" inline />
            </div>
          </>
        )
      }
      additionalBottomControls={
        <>
          <Footnotes
            table="all-data"
            hoveringRef={hoveringRef}
            hasDataRelatedToPWG={hasDataRelatedToPWG}
          />
          <DownloadData<GeneStatisticalResult>
            getData={getDownloadData}
            fileName={`${gene.geneSymbol}-all-phenotype-data`}
            fields={[
              { key: "alleleSymbol", label: "Allele" },
              { key: "phenotypingCentre", label: "Phenotyping center" },
              { key: "procedureName", label: "Procedure" },
              { key: "parameterName", label: "Parameter" },
              { key: "zygosity", label: "Zygosity" },
              {
                key: "femaleMutantCount",
                label: "Female mutant count",
                getValueFn: (item) =>
                  item?.femaleMutantCount?.toString() || "0",
              },
              {
                key: "maleMutantCount",
                label: "Male mutant count",
                getValueFn: (item) =>
                  item?.maleMutantCount?.toString() || "N/A",
              },
              { key: "lifeStageName", label: "Life stage" },
              {
                key: "significant",
                label: "Significant",
                getValueFn: (item) => (item.significant ? "Yes" : "No"),
              },
              {
                key: "pValue",
                label: "Most significant P-value",
                getValueFn: (item) => item?.pValue?.toString() || "N/A",
              },
            ]}
          />
        </>
      }
      showLoadingIndicator={isFetching}
      pagination={{
        totalItems,
        onPageChange: setActivePage,
        onPageSizeChange: setPageSize,
        page: activePage,
        pageSize,
      }}
      columns={[
        {
          width: 2,
          label: "Procedure/parameter",
          field: "procedureName",
          cmp: <ParameterCell />,
        },
        {
          width: 1,
          label: "Supporting data",
          cmp: <SupportingDataCell />,
          disabled: true,
        },
        {
          width: 0.8,
          label: "System",
          field: "topLevelPhenotypes",
          sortField: "topLevelPhenotypeName",
          cmp: <PhenotypeIconsCell allPhenotypesField="topLevelPhenotypes" />,
        },
        {
          width: 1,
          label: "Allele",
          field: "alleleSymbol",
          cmp: <AlleleCell />,
        },
        {
          width: 1,
          label: "Zygosity",
          field: "zygosity",
          cmp: <PlainTextCell style={{ textTransform: "capitalize" }} />,
        },
        {
          width: 1,
          label: "Life stage",
          field: "lifeStageName",
          cmp: <PlainTextCell />,
        },
        {
          width: 1,
          label: "Center",
          field: "phenotypingCentre",
          cmp: <PlainTextCell />,
        },
        {
          width: 0.7,
          label: "Mutants",
          field: "mutantCount",
          cmp: <MutantCountCell onRefHover={onRefHover} />,
        },
        {
          width: 0.5,
          label: "Significant",
          field: "significant",
          cmp: (
            <OptionsCell
              options={{
                true: "Yes",
                false: "No",
                notProcessed: "Not analyzed",
              }}
              customFn={(value: GeneStatisticalResult, field) => {
                if (value.status === "NotProcessed") {
                  return "notProcessed";
                }
                return value[field];
              }}
            />
          ),
        },
        {
          width: 1,
          label: "P value",
          field: "pValue",
          cmp: <SignificantPValueCell onRefHover={onRefHover} />,
        },
      ]}
    />
  );
};

export default AllData;
