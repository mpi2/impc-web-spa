import { Model, TableCellProps } from "@/models";
import _ from "lodash";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getIcon, getSexLabel } from "@/utils";


const SexCell = <T extends Model>(props: TableCellProps<T> & {  }) => {
  return (
    <>
      {["male", "female", "not_considered"]
        .filter(sex => _.get(props.value, props.field) === sex)
        .map((significantSex, index) => (
          <OverlayTrigger
            key={index}
            placement="top"
            trigger={["hover", "focus"]}
            overlay={<Tooltip>{getSexLabel(significantSex)}</Tooltip>}
          >
            <span className="me-2" data-testid="sex-icon">
              <FontAwesomeIcon icon={getIcon(significantSex)} size="lg" />
            </span>
          </OverlayTrigger>
        ))}
    </>
  )
};

export default SexCell;