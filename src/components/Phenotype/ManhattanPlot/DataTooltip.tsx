import styles from "@/components/Phenotype/ManhattanPlot/styles.module.scss";
import { formatPValue } from "@/utils";
import classNames from "classnames";

type Gene = { mgiGeneAccessionId: string, geneSymbol: string, pValue: number, significant: boolean };

type TooltipProps = {
  tooltip: {
    opacity: number;
    top: number;
    left: number;
    chromosome: string,
    genes: Array<Gene>,
  };
  offsetX: number;
  offsetY: number;
  onClick: () => void;
};

const DataTooltip = ({tooltip, offsetY, offsetX, onClick}: TooltipProps) => {
  const getChromosome = () => {
    if (tooltip.chromosome === '20') {
      return 'X';
    } else if (tooltip.chromosome === '21') {
      return 'Y';
    }
    return tooltip.chromosome;
  };
  const getTooltipContent = (gene: Gene) => {
    if (gene.significant && gene.pValue === 0) {
      return <span>Manually annotated as significant</span>;
    }
    return <span>P-value: {!!gene.pValue ? formatPValue(gene.pValue) : '-'}</span>;
  };

  const tooltipClasses = classNames(styles.tooltip, {
    [styles.noVisible]: tooltip.opacity === 0,
    [styles.visible]: tooltip.opacity !== 0,
  });
  return (
    <div
      className={tooltipClasses}
      style={{ top: tooltip.top + offsetY, left: tooltip.left + offsetX, opacity: tooltip.opacity }}
    >
      <button className={styles.closeBtn} onClick={onClick}>×</button>
      <span><strong>Chr: </strong>{ getChromosome() }</span>
      <ul>
        { tooltip.genes.map(gene => (
          <li key={gene.mgiGeneAccessionId}>
            Gene:&nbsp;
            <a className="primary link" target="_blank" href={`/genes/${gene.mgiGeneAccessionId}`}>
              <i>{gene.geneSymbol}</i>
            </a>
            <br/>
            {getTooltipContent(gene)}
          </li>
        )) }
      </ul>
    </div>
  )
}
export default DataTooltip;