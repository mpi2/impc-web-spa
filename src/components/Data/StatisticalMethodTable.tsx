import SortableTable from "@/components/SortableTable";
import { formatPValue } from "@/utils";
import Card from "@/components/Card";
import { Dataset } from "@/models";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import React, { Fragment, useMemo } from "react";

type Props = {
  datasetSummary: Dataset;
  onlyDisplayTable?: boolean;
};
const StatisticalMethodTable = ({
  datasetSummary,
  onlyDisplayTable = false,
}: Props) => {
  const WrapperCmp = onlyDisplayTable ? Fragment : Card;
  const {
    statisticalMethod: { attributes },
  } = datasetSummary;

  if (datasetSummary.resourceName === "3i") {
    return (
      <WrapperCmp>
        <h2>Statistical method</h2>
        <span>Supplied as data</span>
        <span>
          <Link
            className="link primary"
            href="https://www.immunophenotype.org/threei/#/methods/statistical-design"
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
            href="https://www.mousephenotype.org/publications/data-supporting-impc-papers/pain/"
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
    const pValue = formatPValue(attributes.genotypeEffectPValue);
    return zeroPValueDataTypes.includes(datasetSummary.dataType)
      ? pValue
      : pValue || "N/A";
  };

  return (
    <WrapperCmp>
      {!onlyDisplayTable && <h2>Statistical method</h2>}
      <SortableTable
        headers={[
          { width: 8, label: "Model attribute", disabled: true },
          { width: 4, label: "Value", disabled: true },
        ]}
      >
        <tr>
          <td>Batch effect significant </td>
          <td>{attributes["batchSignificant"] ? "true" : "false"}</td>
        </tr>
        <tr>
          <td>Variance significant </td>
          <td>{attributes["varianceSignificant"] ? "true" : "false"}</td>
        </tr>
        <tr>
          <td>Genotype*Sex interaction effect p value </td>
          <td>{getFormattedPValue("sexEffectPValue")}</td>
        </tr>
        <tr>
          <td>Genotype parameter estimate </td>
          <td>
            {attributes["sexEffectParameterEstimate"]
              ? attributes["sexEffectParameterEstimate"].toFixed(3)
              : "N/A"}
          </td>
        </tr>
        <tr>
          <td>Genotype standard error estimate </td>
          <td>
            {attributes["genotypeEffectStderrEstimate"]
              ? attributes["genotypeEffectStderrEstimate"].toFixed(3)
              : "N/A"}
          </td>
        </tr>
        <tr>
          <td>Genotype Effect P Value </td>
          <td>{getFormattedPValue("genotypeEffectPValue")}</td>
        </tr>
        <tr>
          <td>Sex Parameter Estimate </td>
          <td>
            {attributes["sexEffectParameterEstimate"]
              ? attributes["sexEffectParameterEstimate"].toFixed(3)
              : "N/A"}
          </td>
        </tr>
        <tr>
          <td>Sex Standard Error Estimate </td>
          <td>
            {attributes["sexEffectStderrEstimate"]
              ? attributes["sexEffectStderrEstimate"].toFixed(3)
              : "N/A"}
          </td>
        </tr>
        <tr>
          <td>Sex Effect P Value </td>
          <td>{getFormattedPValue("sexEffectPValue")}</td>
        </tr>
        <tr>
          <td>Intercept Estimate </td>
          <td>
            {attributes["interceptEstimate"]
              ? attributes["interceptEstimate"].toFixed(3)
              : "N/A"}
          </td>
        </tr>
        <tr>
          <td>Intercept Estimate Standard Error </td>
          <td>
            {attributes["interceptEstimateStderrEstimate"]
              ? attributes["interceptEstimateStderrEstimate"].toFixed(3)
              : "N/A"}
          </td>
        </tr>
        <tr>
          <td>Sex Male KO P Value </td>
          <td>{getFormattedPValue("maleKoEffectPValue")}</td>
        </tr>
        <tr>
          <td>Sex Female KO P Value </td>
          <td>{getFormattedPValue("femaleKoEffectPValue")}</td>
        </tr>
        <tr>
          <td>WT Residuals Normality Tests </td>
          <td>
            {attributes["group1ResidualsNormalityTest"]
              ? formatPValue(attributes["group1ResidualsNormalityTest"])
              : "N/A"}
          </td>
        </tr>
        <tr>
          <td>KO Residuals Normality Tests </td>
          <td>
            {attributes["group2ResidualsNormalityTest"]
              ? formatPValue(attributes["group2ResidualsNormalityTest"])
              : "N/A"}
          </td>
        </tr>
      </SortableTable>
    </WrapperCmp>
  );
};

export default StatisticalMethodTable;
