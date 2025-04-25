import { TooltipWithBounds, defaultStyles } from "@visx/tooltip";

export interface TooltipData {
  phenotypeCount?: number;
  otherPhenotypeCount?: number;
  phenotypeName?: string;
  markerSymbol?: string;
}

interface Props {
  left: number;
  top: number;
  data?: TooltipData;
  isTooltipOpen: boolean;
  phenotypeName: string;
}

export default function ToolTip({
  left,
  top,
  data = {},
  isTooltipOpen,
  phenotypeName,
}: Props) {
  return (
    <TooltipWithBounds
      key={isTooltipOpen ? 1 : 0} // needed for bounds to update correctly
      style={{
        ...defaultStyles,
        display: "flex",
        flexDirection: "column",
        opacity: isTooltipOpen ? 1 : 0,
        transition: "all 0.1s ease-out",
      }}
      left={left}
      top={top}
    >
      <b>
        <i>{data.markerSymbol}</i>
      </b>
      <span>Other phenotype calls: {data.otherPhenotypeCount}</span>
      <span>
        {phenotypeName} phenotype calls: {data.phenotypeCount}
      </span>
    </TooltipWithBounds>
  );
}
