import SortableTable from "@/components/SortableTable";
import { formatPValue } from "@/utils";
import Card from "@/components/Card";
import { Dataset } from "@/models";
import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleQuestion,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Fragment, useMemo } from "react";
import styles from "./styles.module.scss";
import { DownloadData } from "@/components";

type Props = {
  datasetSummary: Dataset;
  onlyDisplayTable?: boolean;
};

type StatisticalMethodField = {
  key: keyof Dataset["statisticalMethod"]["attributes"];
  type: "number" | "boolean" | "pValue";
  label: string;
};

const generalData: Array<StatisticalMethodField> = [
  {
    key: "batchSignificant",
    type: "boolean",
    label: "Batch effect significant",
  },
  {
    key: "varianceSignificant",
    type: "boolean",
    label: "Variance significant",
  },
  {
    key: "interactionEffectPValue",
    type: "pValue",
    label: "Genotype*Sex interaction effect P-Value",
  },
  {
    key: "sexEffectParameterEstimate",
    type: "number",
    label: "Genotype parameter estimate",
  },
  {
    key: "genotypeEffectStderrEstimate",
    type: "number",
    label: "Genotype standard error estimate",
  },
  {
    key: "genotypeEffectPValue",
    type: "pValue",
    label: "Genotype Effect P-Value",
  },
  {
    key: "sexEffectParameterEstimate",
    type: "number",
    label: "Sex Parameter Estimate",
  },
  {
    key: "sexEffectStderrEstimate",
    type: "number",
    label: "Sex Standard Error Estimate",
  },
  { key: "sexEffectPValue", type: "pValue", label: "Sex Effect P-Value" },
  { key: "interceptEstimate", type: "number", label: "Intercept Estimate" },
  {
    key: "interceptEstimateStderrEstimate",
    type: "number",
    label: "Intercept Estimate Standard Error",
  },
  { key: "maleKoEffectPValue", type: "pValue", label: "Sex Male KO P-Value" },
  {
    key: "femaleKoEffectPValue",
    type: "pValue",
    label: "Sex Female KO P-Value",
  },
  {
    key: "group1ResidualsNormalityTest",
    type: "pValue",
    label: "WT Residuals Normality Tests",
  },
  {
    key: "group2ResidualsNormalityTest",
    type: "pValue",
    label: "KO Residuals Normality Tests",
  },
];

const linearMixedModelData: Array<StatisticalMethodField> = generalData.concat([
  { key: "weightEffectPValue", type: "pValue", label: "Weight Effect P-Value" },
  {
    key: "weightEffectParameterEstimate",
    type: "number",
    label: "Weight Effect Parameter Estimate",
  },
  {
    key: "weightEffectStderrEstimate",
    type: "number",
    label: "Weight Effect Standard Error Estimate",
  },
]);

const referenceRangeModelData: Array<StatisticalMethodField> = [
  {
    key: "femaleEffectSizeLowNormalVsHigh",
    type: "number",
    label: "Female Effect Size Low Normal VS High",
  },
  {
    key: "femaleEffectSizeLowVsNormalHigh",
    type: "number",
    label: "Female Effect Size Low VS Normal High",
  },
  {
    key: "femalePValueLowNormalVsHigh",
    type: "pValue",
    label: "Female P-Value Low Normal VS High",
  },
  {
    key: "femalePValueLowVsNormalHigh",
    type: "pValue",
    label: "Female P-Value Low VS Normal High",
  },
  {
    key: "maleEffectSizeLowNormalVsHigh",
    type: "number",
    label: "Male Effect Size Low Normal VS High",
  },
  {
    key: "maleEffectSizeLowVsNormalHigh",
    type: "number",
    label: "Male Effect Size Low VS Normal High",
  },
  {
    key: "malePValueLowNormalVsHigh",
    type: "pValue",
    label: "Male P-Value Low Normal VS High",
  },
  {
    key: "malePValueLowVsNormalHigh",
    type: "pValue",
    label: "Male P-Value Low VS Normal High",
  },
  {
    key: "genotypeEffectSizeLowNormalVsHigh",
    type: "number",
    label: "Genotype Effect Size Low Normal VS High",
  },
  {
    key: "genotypeEffectSizeLowVsNormalHigh",
    type: "number",
    label: "Genotype Effect Size Low VS Normal High",
  },
  {
    key: "genotypePValueLowNormalVsHigh",
    type: "pValue",
    label: "Genotype P-Value Low Normal VS High",
  },
  {
    key: "genotypePValueLowVsNormalHigh",
    type: "pValue",
    label: "Genotype P-Value Low VS Normal High",
  },
];

const StatisticalMethodTable = ({
  datasetSummary,
  onlyDisplayTable = false,
}: Props) => {
  const WrapperCmp = onlyDisplayTable ? Fragment : Card;

  const { attributes, name } = useMemo(() => {
    const {
      statisticalMethod: { attributes, name },
    } = datasetSummary;
    return {
      attributes,
      name: name ?? "Supplied as data",
    };
  }, [datasetSummary]);

  const statisticalMethodFields = useMemo(() => {
    switch (name) {
      case "Linear Mixed Model framework, LME, including Weight":
      case "Linear Mixed Model framework, LME, not including Weight":
        return linearMixedModelData;
      case "Reference Range Plus Test framework; quantile = 0.95 (Tails probability = 0.025)":
        return referenceRangeModelData;
      default:
        return generalData;
    }
  }, [name]);

  const statisticalDataIsEmpty = useMemo(() => {
    return statisticalMethodFields
      .map((field) => attributes[field.key])
      .every((attribute) => !!attribute === false);
  }, [datasetSummary]);

  if (datasetSummary.resourceName === "3i") {
    return (
      <WrapperCmp>
        <h2>Statistical method</h2>
        <span>Supplied as data</span>
        <span>
          <Link
            className="link primary"
            to="https://www.immunophenotype.org/threei/#/methods/statistical-design"
            target="_blank"
          >
            Statistical design
          </Link>
          &nbsp;
          <FontAwesomeIcon
            icon={faExternalLinkAlt}
            className="grey"
            size="xs"
          />
        </span>
      </WrapperCmp>
    );
  }
  if (datasetSummary.resourceName === "pwg") {
    return (
      <WrapperCmp>
        <h2>Statistical method</h2>
        <span>Supplied as data</span>
        <span>
          <Link
            className="link primary"
            to="https://www.mousephenotype.org/publications/data-supporting-impc-papers/pain/"
            target="_blank"
          >
            Pain sensitivity publication
          </Link>
        </span>
      </WrapperCmp>
    );
  }

  const getFormattedPValue = (key: keyof typeof attributes) => {
    const zeroPValueDataTypes = ["unidimensional", "categorical"];
    const pValue = formatPValue(attributes[key] as number);
    return zeroPValueDataTypes.includes(datasetSummary.dataType)
      ? pValue
      : pValue || "N/A";
  };

  const getFormattedValue = (field: StatisticalMethodField) => {
    switch (field.type) {
      case "boolean":
        return attributes[field.key] ? "True" : "False";
      case "number":
        return (attributes[field.key] as number)?.toFixed(3);
      case "pValue":
        return getFormattedPValue(field.key);
    }
  };

  const getDownloadData = () => {
    return [
      statisticalMethodFields.reduce(
        (acc, field) => {
          acc[field.key] =
            (field.type === "boolean"
              ? attributes[field.key]
                ? "True"
                : "False"
              : attributes[field.key]) ?? "N/A";
          return acc;
        },
        {} as Record<keyof typeof attributes, string | number | boolean>,
      ),
    ];
  };

  const getDownloadFields = () => {
    return statisticalMethodFields.map(({ key, label }) => ({
      key,
      label,
    })) as Array<{ key: keyof typeof attributes; label: string }>;
  };

  return (
    <WrapperCmp>
      {!onlyDisplayTable && (
        <div className={styles.titleWrapper}>
          <h2>Statistical method</h2>
          <Link
            to="https://www.mousephenotype.org/help/data-analysis/statistical-analysis/"
            className="btn"
            aria-label={`Statistical analysis documentation`}
          >
            <FontAwesomeIcon icon={faCircleQuestion} size="xl" />
          </Link>
        </div>
      )}
      <span>
        <b>{name === "MM" ? "Mixed Model" : name}</b>
      </span>
      {!statisticalDataIsEmpty && (
        <>
          <SortableTable
            className={styles.table}
            headers={[
              { width: 8, label: "Model attribute", disabled: true },
              { width: 4, label: "Value", disabled: true },
            ]}
          >
            {statisticalMethodFields.map((field) => (
              <tr>
                <td>{field.label}</td>
                <td>{getFormattedValue(field) ?? "N/A"}</td>
              </tr>
            ))}
          </SortableTable>
          <DownloadData
            data={getDownloadData()}
            fileName="statistical-method-data"
            fields={getDownloadFields()}
          />
        </>
      )}
    </WrapperCmp>
  );
};

export default StatisticalMethodTable;
