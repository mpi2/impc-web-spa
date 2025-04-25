import { GenePhenotypeHits } from "@/models/gene";
import { Alert, Form } from "react-bootstrap";
import { useContext, useEffect, useMemo, useState } from "react";
import { GeneContext } from "@/contexts";
import { UpSetJS, extractCombinations } from "@upsetjs/react";
import styles from "./styles.module.scss";
import { ISetCombinations } from "@upsetjs/model";
import { sortBy, uniq } from "lodash";
import { FilterBox } from "@/components";
import { useIntersectionObserver } from "usehooks-ts";

type Allele = {
  significantPhenotypes: Set<string>;
  zygosities: Set<string>;
  topLevelPhenotypes: Set<string>;
};

type Filters = {
  selectedZyg: string;
  selectedLifeSt: string;
  selectedSex: string;
};

const dataMatchesFilters = (
  phenotype: GenePhenotypeHits,
  filters: Filters
): boolean => {
  const { selectedZyg, selectedLifeSt, selectedSex } = filters;
  return (
    (selectedZyg === undefined || phenotype.zygosity === selectedZyg) &&
    (selectedLifeSt === undefined ||
      phenotype.lifeStageName === selectedLifeSt) &&
    (selectedSex === undefined || phenotype.sex === selectedSex)
  );
};
const getAlleleDataObject = (
  phenotypeData: Array<GenePhenotypeHits>,
  filters: Filters
) => {
  const result: Record<string, Allele> = {};
  phenotypeData?.forEach((phenotype) => {
    if (dataMatchesFilters(phenotype, filters)) {
      if (result[phenotype.alleleSymbol] === undefined) {
        result[phenotype.alleleSymbol] = {
          significantPhenotypes: new Set(),
          zygosities: new Set(),
          topLevelPhenotypes: new Set(),
        };
      }
      result[phenotype.alleleSymbol].significantPhenotypes.add(
        phenotype.phenotypeName
      );
      result[phenotype.alleleSymbol].topLevelPhenotypes.add(
        phenotype.topLevelPhenotypeName
      );
      result[phenotype.alleleSymbol].zygosities.add(phenotype.zygosity);
    }
  });
  return result;
};
const generateSets = (
  alleleData: Record<string, Allele>,
  field: keyof Allele,
  selectedAlleles: Array<string>
) => {
  const allelesByValues: Record<string, { name: string; sets: Array<string> }> =
    {};
  Object.entries(alleleData).forEach(([allele, alleleData]) => {
    if (selectedAlleles.length === 0 || selectedAlleles.includes(allele)) {
      alleleData[field].forEach((value) => {
        if (allelesByValues[value] === undefined) {
          allelesByValues[value] = { name: value, sets: [] };
        }
        allelesByValues[value].sets.push(allele);
      });
    }
  });
  return Object.values(allelesByValues);
};
const simplifySets = (combinations: ISetCombinations) => {
  return combinations.toSorted((c1, c2) => c1.degree - c2.degree);
};

const AllelePhenotypeDiagram = ({
  phenotypeData,
  isPhenotypeLoading,
  isPhenotypeError,
}: {
  phenotypeData: Array<GenePhenotypeHits>;
  isPhenotypeLoading: boolean;
  isPhenotypeError: boolean;
}) => {
  const gene = useContext(GeneContext);
  const [field, setField] = useState<keyof Allele>("significantPhenotypes");
  const [selection, setSelection] = useState(null);
  const [clickSelection, setClickSelection] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const { ref } = useIntersectionObserver({
    threshold: 0.7,
    // if user scrolls away from component and drawer is open, close it
    onChange: (isIntersecting, entry) => {
      if (isIntersecting === false && isOpen) {
        setIsOpen(false);
      }
    },
  });
  const [selectedAlleles, setSelectedAlleles] = useState([]);
  const [availableZyg, setAvailableZyg] = useState<Array<string>>([]);
  const [availableLifeSt, setAvailableLifeSt] = useState<Array<string>>([]);
  const [availableSexes, setAvailableSexes] = useState<Array<string>>([]);
  const [selectedZyg, setSelectedZyg] = useState<string>(undefined);
  const [selectedLifeSt, setSelectedLifeSt] = useState<string>(undefined);
  const [selectedSex, setSelectedSexes] = useState<string>(undefined);
  const updateSelectedField = (field: keyof Allele) => {
    setClickSelection(null);
    setSelection(null);
    setField(field);
  };

  const allelesData: Record<string, Allele> = useMemo(() => {
    const data = getAlleleDataObject(phenotypeData, {
      selectedZyg,
      selectedLifeSt,
      selectedSex: selectedSex === "combined" ? "not_considered" : selectedSex,
    });
    setSelectedAlleles(Object.keys(data));
    return data;
  }, [phenotypeData, selectedZyg, selectedLifeSt, selectedSex]);

  const dataByField = useMemo(() => {
    return generateSets(allelesData, field, selectedAlleles);
  }, [phenotypeData, field, selectedAlleles]);

  const { sets, combinations } = useMemo(() => {
    const results = extractCombinations(dataByField);
    return {
      sets: results.sets.toSorted((s1, s2) => s1.name.localeCompare(s2.name)),
      combinations: simplifySets(results.combinations),
    };
  }, [dataByField]);

  useEffect(() => {
    if (phenotypeData?.length) {
      const zygosities = uniq(phenotypeData.map((p) => p.zygosity));
      const lifeStages = sortBy(
        uniq(phenotypeData.map((p) => p.lifeStageName))
      );
      const sexes = sortBy(
        uniq(
          phenotypeData.map((p) =>
            p.sex === "not_considered" ? "combined" : p.sex
          )
        )
      );
      setAvailableZyg(zygosities);
      setAvailableLifeSt(lifeStages);
      setAvailableSexes(sexes);
    }
  }, [phenotypeData]);

  if (isPhenotypeLoading) {
    return (
      <p className="grey" style={{ padding: "1rem" }}>
        Loading...
      </p>
    );
  }
  if (isPhenotypeError) {
    return (
      <Alert variant="primary" className="mt-3">
        No significant phenotypes for {gene.geneSymbol}.
      </Alert>
    );
  }

  return (
    <div ref={ref}>
      <div className={styles.selectorsWrapper}>
        <div className={styles.selector}>
          <Form.Group>
            <Form.Label>Group by</Form.Label>
            <Form.Check
              name="groupBy"
              type="radio"
              id="significantPhenotype"
              label="Significant phenotype"
              checked={field === "significantPhenotypes"}
              onChange={() => updateSelectedField("significantPhenotypes")}
            />
            <Form.Check
              type="radio"
              name="groupBy"
              id="topLevelPhenotype"
              label="Physiological system"
              checked={field === "topLevelPhenotypes"}
              onChange={() => updateSelectedField("topLevelPhenotypes")}
            />
          </Form.Group>
        </div>
        <div className={styles.selector}>
          <FilterBox
            controlId="zygosityFilter"
            label="Zygosity"
            onChange={setSelectedZyg}
            ariaLabel="Filter by zygosity"
            options={availableZyg}
          />
        </div>
        <div className={styles.selector}>
          <FilterBox
            controlId="lifeStageFilter-apd"
            label="Life stage"
            onChange={setSelectedLifeSt}
            ariaLabel="Filter by life stage"
            options={availableLifeSt}
          />
        </div>
        <div className={styles.selector}>
          <FilterBox
            controlId="sexFilter"
            label="Sex"
            onChange={setSelectedSexes}
            ariaLabel="Filter by sex"
            options={availableSexes}
          />
        </div>
      </div>
      <div className="mt-3">
        <span>
          Click on a bar to view the phenotypes that belongs to an allele or set
          of alleles in the results section.
          <br />
          Hovering over the columns will highlight the shared phenotypes across
          all the sets.
          <br />
          Information about allele design can be found in&nbsp;
          <a
            className="link primary"
            href="https://www.mousephenotype.org/understand/start-using-the-impc/allele-design/"
          >
            this page
          </a>
          .
        </span>
      </div>
      <div
        style={{ position: "relative", display: "flex", paddingTop: "1rem" }}
      >
        <UpSetJS
          sets={sets}
          combinations={combinations}
          width={1200}
          height={400}
          selection={selection}
          onHover={setSelection}
          onClick={setClickSelection}
          widthRatios={[0, 0.2]}
          setLabelAlignment="right"
          combinationName="Number of Phenotypes"
        />
      </div>
      <div className="selection">
        <h3>Results section</h3>
        {clickSelection ? (
          <>
            {clickSelection.name.split("∩").length === 1 ? (
              <>The allele&nbsp;</>
            ) : (
              <>The following intersection of alleles:&nbsp;</>
            )}
            <strong>{clickSelection.name}</strong> <br />
            {clickSelection.name.split("∩").length === 1 ? (
              <>has these phenotypes:</>
            ) : (
              <>have these phenotypes in common:</>
            )}
            <ul>
              {clickSelection.elems
                .map((phenotype) => phenotype.name)
                .sort()
                .map((phenotypeName) => (
                  <li>{phenotypeName}</li>
                ))}
            </ul>
          </>
        ) : (
          <>
            <i className="grey">
              Data will appear here after a column is clicked.
            </i>
          </>
        )}
      </div>
    </div>
  );
};

export default AllelePhenotypeDiagram;
