import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import styles from "./styles.module.scss";
import classNames from "classnames";

type ChartNavProps = {
  mgiGeneAccessionId: string;
  geneSymbol: string | undefined;
  isFetching: boolean;
};

const ChartNav = (props: ChartNavProps) => {
  const { mgiGeneAccessionId, geneSymbol, isFetching } = props;

  return (
    <div className={styles.subheading}>
      <span
        className={`${styles.subheadingSection} primary`}
        data-testid="back-to-gene-page-link"
      >
        <Link
          href={`/genes/${mgiGeneAccessionId}`}
          className={classNames("mb-3", styles.link)}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          &nbsp; Go Back to{" "}
          <i>
            {geneSymbol && isFetching ? (
              <Skeleton style={{ width: "50px" }} inline />
            ) : !!geneSymbol ? (
              <span>{geneSymbol}</span>
            ) : (
              <span style={{ fontStyle: "normal" }}>gene page</span>
            )}
          </i>
        </Link>
      </span>
    </div>
  );
};

export default ChartNav;
