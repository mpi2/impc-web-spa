import { Dataset, DatasetExtra } from "@/models";

export const groupData = (data) => {
  return data?.reduce((acc, d) => {
    const {
      alleleAccessionId,
      parameterStableId,
      zygosity,
      sex,
      reportedPValue,
      phenotypeSex,
      phenotypingCentre,
      colonyId,
      significantPhenotype,
      lifeStageName,
    } = d;
    const phenotypeId = significantPhenotype?.id || "";
    const key = `${phenotypeId}-${alleleAccessionId}-${parameterStableId}-${zygosity}-${phenotypingCentre}-${colonyId}-${lifeStageName}-${sex}`;
    const statMethodPValueKey =
      sex === "female" ? "femaleKoEffectPValue" : "maleKoEffectPValue";
    const pValueFromStatMethod =
      d.statisticalMethod?.attributes?.[statMethodPValueKey] || 1;

    if (acc[key]) {
      if (acc[key].reportedPValue < pValueFromStatMethod) {
        acc[key].reportedPValue = Number(pValueFromStatMethod);
        acc[key].sex = sex;
      }
    } else {
      acc[key] = {
        ...d,
        key,
        reportedPValue:
          pValueFromStatMethod !== null ? pValueFromStatMethod : reportedPValue,
      };
    }
    if (sex) {
      const pValue =
        reportedPValue < pValueFromStatMethod
          ? reportedPValue
          : pValueFromStatMethod;
      acc[key][`pValue_${sex}`] = Number(pValue);
    }
    if (phenotypeSex?.length > 0) {
      if (!!d.statisticalMethod?.attributes?.maleKoEffectPValue) {
        acc[key][`pValue_male`] =
          d.statisticalMethod?.attributes?.maleKoEffectPValue;
      }
      if (!!d.statisticalMethod?.attributes?.femaleKoEffectPValue) {
        acc[key][`pValue_female`] =
          d.statisticalMethod?.attributes?.femaleKoEffectPValue;
      }
      if (phenotypeSex.length >= 2) {
        acc[key][`pValue_not_considered`] = Number(reportedPValue);
      }
    }
    if (
      !sex &&
      d.statisticalMethod?.attributes?.genotypeEffectPValue !== null &&
      d.statisticalMethod?.attributes.genotypeEffectPValue !== undefined
    ) {
      acc[key][`pValue_not_considered`] =
        d.statisticalMethod?.attributes?.genotypeEffectPValue;
    }
    if (!sex && reportedPValue !== null && reportedPValue !== undefined) {
      acc[key][`pValue_not_considered`] = reportedPValue;
    }
    return acc;
  }, {});
};

export const processData = (groups: Array<Dataset>): Array<DatasetExtra> => {
  return (
    (groups ? Object.values(groups) : []).map((d: any, index) => {
      const getLethality = () => {
        if (!d.significant) {
          return "Viable";
        }
        if (d.significant && d.significantPhenotype?.id === "MP:0011100") {
          return "Lethal";
        }
        if (d.significant && d.significantPhenotype?.id === "MP:0011110") {
          return "Subviable";
        }
        return "-";
      };
      return {
        ...d,
        datasetNum: index + 1,
        topLevelPhenotype: d.topLevelPhenotypes?.[0]?.name,
        phenotype: d.significantPhenotype?.name,
        id: d.significantPhenotype?.id,
        viability: getLethality(),
      };
    }) || []
  );
};

export const getBackgroundColorForRow = (
  groupedDataset,
  index: number,
  selectedKey: string
): string => {
  const isFirstRender = selectedKey === "" && index === 0;
  const datasetMatchesKey = groupedDataset.key === selectedKey;
  if (isFirstRender || datasetMatchesKey) {
    return "highlighted-row";
  }
  return "";
};
