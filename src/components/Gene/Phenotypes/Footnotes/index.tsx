import { useQueryFlags } from "@/hooks";

type Props = {
  table: "all-data" | "sig-phenotypes";
  hoveringRef: "*" | "**" | "+" | null;
  hasDataRelatedToPWG: boolean;
};

const Footnotes = (props: Props) => {
  const { isNNumbersFootnoteAvailable } = useQueryFlags();
  const { hoveringRef, hasDataRelatedToPWG } = props;
  const isAllDataTable = props.table === "all-data";
  return (
    <>
      <div style={{ fontSize: "85%", flex: "1 0 100%" }}>
        <span
          style={{
            backgroundColor: hoveringRef === "*" ? "#FDF0E5" : "#FFF",
          }}
        >
          {isAllDataTable ? (
            <>* This parameter was manually assessed for significance.</>
          ) : (
            <>
              * Does not have a P-Value assigned because it was manually marked
              as significant.
            </>
          )}
        </span>
      </div>
      {isNNumbersFootnoteAvailable && props.table === "all-data" && (
        <div style={{ fontSize: "85%", flex: "1 0 100%" }}>
          <span
            style={{
              backgroundColor: hoveringRef === "+" ? "#FDF0E5" : "#FFF",
            }}
          >
            + Procedure has less specimen numbers recorded than those specified
            in IMPReSS, check&nbsp;
            <a
              className="primary link"
              href="https://dev.mousephenotype.org/help/data-analysis/faqs/how-many-specimens-go-through-the-statistical-analysis/"
              target="_blank"
            >
              N-numbers documentation page
            </a>
            &nbsp;for more information.
          </span>
        </div>
      )}
      {hasDataRelatedToPWG && (
        <div style={{ fontSize: "85%", flex: "1 0 100%" }}>
          <span
            style={{
              backgroundColor: hoveringRef === "**" ? "#FDF0E5" : "#FFF",
            }}
          >
            ** Significant with a threshold of 1x10<sup>-3</sup>, check
            the&nbsp;
            <a
              className="primary link"
              href="https://www.mousephenotype.org/publications/data-supporting-impc-papers/pain/"
            >
              Pain Sensitivity page
            </a>
            &nbsp;for more information.
          </span>
        </div>
      )}
    </>
  );
};

export default Footnotes;
