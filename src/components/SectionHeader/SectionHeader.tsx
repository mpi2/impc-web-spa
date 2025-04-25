import { PropsWithChildren } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import styles from "./styles.module.scss";
import { Link } from "react-router";

type Props = {
  containerId: string;
  title: string;
  href?: string;
};

const SectionHeader = (props: PropsWithChildren<Props>) => {
  const { href } = props;

  return (
    <>
      <div className={styles.titleWrapper}>
        <h2 dangerouslySetInnerHTML={{ __html: props.title }}></h2>
        {!!href && (
          <Link
            to={href}
            className="btn"
            aria-label={`${props.title} documentation`}
          >
            <FontAwesomeIcon icon={faCircleQuestion} size="xl" />
          </Link>
        )}
      </div>
    </>
  );
};

export default SectionHeader;
