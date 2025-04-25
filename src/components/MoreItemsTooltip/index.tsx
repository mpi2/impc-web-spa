import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretSquareDown } from "@fortawesome/free-regular-svg-icons";
import { Fragment } from "react";

type Props = {
  items: Array<string>;
  maxItems: number;
}
const MoreItemsTooltip = ({ items, maxItems }: Props) => {
  if (items.length > maxItems) {
    return (
      <OverlayTrigger
        placement="bottom"
        trigger={["hover", "focus"]}
        overlay={
          <Tooltip>
            <div style={{ textAlign: "left" }}>
              {items
                .slice(maxItems, items.length)
                .map((s, i) => (
                  <Fragment key={i}>
                    <span style={{ whiteSpace: "nowrap" }}>
                      {s}
                      {i <items.length ? ", " : ""}
                    </span>
                    <br />
                  </Fragment>
                ))}
            </div>
          </Tooltip>
        }
      >
        {({ ref, ...triggerHandler }) => (
          <span {...triggerHandler} ref={ref} className="link">
            +{items.length - maxItems} more&nbsp;
            <FontAwesomeIcon icon={faCaretSquareDown} />
          </span>
        )}
      </OverlayTrigger>
    )
  }
  else {
    return null;
  }
}

export default MoreItemsTooltip;