import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { CSSProperties } from "react";

const Check = ({ isChecked }) => {
  const styles: CSSProperties = isChecked ? {} : { borderColor: '#8e8e8e' }
  return (
    <span style={styles}>
      <FontAwesomeIcon icon={isChecked ? faCheck : faXmark} style={{ color: '#000' }} />
    </span>
  )
};

export default Check;
