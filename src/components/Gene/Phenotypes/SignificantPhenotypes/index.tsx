import { useContext, useEffect, useMemo, useState } from "react";
import { GeneContext } from "@/contexts";
import {
  PlainTextCell,
  SmartTable,
  PhenotypeIconsCell,
  AlleleCell,
  SignificantSexesCell,
  SignificantPValueCell,
} from "@/components/SmartTable";
import { GenePhenotypeHits } from "@/models/gene";
import { orderBy, uniq } from "lodash";
import { DownloadData, FilterBox } from "@/components";
import { summarySystemSelectionChannel } from "@/eventChannels";
import { SupportingDataCell } from "./custom-cells";
import Footnotes from "../Footnotes";
import { SortType } from "@/models";

const SignificantPhenotypes = ({
  phenotypeData = [],
  hasDataRelatedToPWG,
}: {
  phenotypeData: Array<GenePhenotypeHits>;
  hasDataRelatedToPWG: boolean;
}) => {
  const gene = useContext(GeneContext);
  const [query, setQuery] = useState(undefined);
  const [selectedAllele, setSelectedAllele] = useState<string>(undefined);
  const [selectedSystem, setSelectedSystem] = useState<string>(undefined);
  const [selectedLifeStage, setSelectedLifeStage] = useState<string>(undefined);
  const [selectedZygosity, setSelectedZygosity] = useState<string>(undefined);
  const [hoveringRef, setHoveringRef] = useState<"*" | "**">(undefined);
  const defaultSort: SortType = useMemo(() => ["phenotypeName", "asc"], []);

  useEffect(() => {
    const unsubscribeOnSystemSelection = summarySystemSelectionChannel.on(
      "onSystemSelection",
      (payload) => {
        setSelectedSystem(payload);
        document.querySelector("#data")?.scrollIntoView();
      },
    );
    return () => {
      unsubscribeOnSystemSelection();
    };
  }, []);

  const alleles = uniq(
    phenotypeData.map((phenotype) => phenotype.alleleSymbol),
  );
  const systems = uniq(
    phenotypeData.flatMap((p) => p.topLevelPhenotypes?.map((tl) => tl.name)),
  );
  const lifeStages = uniq(phenotypeData.map((p) => p.lifeStageName));
  const zygosities = uniq(phenotypeData.map((p) => p.zygosity));
  const filteredPhenotypeData = phenotypeData.filter(
    ({
      phenotypeName,
      phenotypeId,
      alleleSymbol,
      lifeStageName,
      topLevelPhenotypes,
      zygosity,
    }) =>
      (!selectedAllele || alleleSymbol === selectedAllele) &&
      (!query ||
        `${phenotypeName} ${phenotypeId}`.toLowerCase().includes(query)) &&
      (!selectedSystem ||
        (topLevelPhenotypes ?? []).some(
          ({ name }) => name === selectedSystem,
        )) &&
      (!selectedLifeStage || lifeStageName === selectedLifeStage) &&
      (!selectedZygosity || zygosity === selectedZygosity),
  );

  const sortPhenotypes = (
    data: Array<GenePhenotypeHits>,
    field: keyof GenePhenotypeHits,
    order: "asc" | "desc",
  ) => {
    if (field === "pValue") {
      return data.sort((p1, p2) => {
        if (!p1.pValue) {
          return 1;
        } else if (!p2.pValue) {
          return -1;
        }
        return order === "asc" ? p1.pValue - p2.pValue : p2.pValue - p1.pValue;
      });
    }
    return orderBy(data, field, order);
  };

  const onRefHover = (ref: "*" | "**", active: boolean) => {
    const value = active ? ref : null;
    setHoveringRef(value);
  };

  return (
    <>
      <SmartTable<GenePhenotypeHits>
        data={filteredPhenotypeData}
        defaultSort={defaultSort}
        customSortFunction={sortPhenotypes}
        customFiltering
        additionalTopControls={
          <>
            <FilterBox
              controlId="queryFilter"
              hideLabel
              onChange={setQuery}
              ariaLabel="Filter by parameters"
              controlStyle={{ width: 150 }}
            />
            <FilterBox
              controlId="zygosityFilterSP"
              label="Zygosity"
              onChange={setSelectedZygosity}
              ariaLabel="Filter by zygosity"
              options={zygosities}
              controlStyle={{ width: 100, textTransform: "capitalize" }}
            />
            <FilterBox
              controlId="alleleFilter"
              label="Allele"
              onChange={setSelectedAllele}
              ariaLabel="Filter by allele"
              options={alleles}
            />
            <FilterBox
              controlId="systemFilter"
              label="Phy. System"
              value={selectedSystem}
              onChange={setSelectedSystem}
              ariaLabel="Filter by physiological system"
              options={systems}
            />
            <FilterBox
              controlId="lifeStageFilter-sph"
              label="Life Stage"
              onChange={setSelectedLifeStage}
              ariaLabel="Filter by life stage"
              options={lifeStages}
              controlStyle={{ display: "inline-block", width: 100 }}
            />
          </>
        }
        additionalBottomControls={
          <>
            <Footnotes
              table="sig-phenotypes"
              hoveringRef={hoveringRef}
              hasDataRelatedToPWG={hasDataRelatedToPWG}
            />
            <DownloadData<GenePhenotypeHits>
              data={phenotypeData}
              fileName={`${gene.geneSymbol}-significant-phenotypes`}
              fields={[
                { key: "phenotypeName", label: "Phenotype" },
                { key: "alleleSymbol", label: "Allele" },
                { key: "zygosity", label: "Zygosity" },
                { key: "sex", label: "Sex" },
                { key: "lifeStageName", label: "Life stage" },
                { key: "procedureName", label: "Procedure" },
                { key: "parameterName", label: "Parameter" },
                { key: "phenotypingCentre", label: "Phenotyping center" },
                {
                  key: "pValue",
                  label: "Most significant P-Value",
                  getValueFn: (item) => item?.pValue?.toString(10) || "-",
                },
              ]}
            />
          </>
        }
        columns={[
          {
            width: 2.2,
            label: "Phenotype",
            field: "phenotypeName",
            cmp: <PlainTextCell style={{ fontWeight: "bold" }} />,
          },
          {
            width: 1,
            label: "Supporting data",
            field: "datasetsIds",
            cmp: <SupportingDataCell />,
          },
          {
            width: 0.8,
            label: "System",
            field: "topLevelPhenotypeName",
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
            width: 0.5,
            label: "Life stage",
            field: "lifeStageName",
            cmp: <PlainTextCell />,
          },
          {
            width: 0.5,
            label: "Significant sexes",
            field: "sex",
            cmp: <SignificantSexesCell />,
          },
          {
            width: 0.7,
            label: "Significant P-Value",
            field: "pValue",
            cmp: <SignificantPValueCell onRefHover={onRefHover} />,
          },
        ]}
      />
    </>
  );
};

export default SignificantPhenotypes;
