import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlassMinus, faMagnifyingGlassPlus, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { Placement } from "@popperjs/core";

type Props = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  containerClassName: string;
  tooltipsPosition?: Placement;
}

const ZoomButtons = (props: Props) => {
  const {
    onZoomIn,
    onZoomOut,
    onResetZoom,
    containerClassName,
    tooltipsPosition = "right",
  } = props;

  return (
    <div className={containerClassName}>
      <OverlayTrigger overlay={<Tooltip id="zoom-in-button-tooltip">Zoom in</Tooltip>} placement={tooltipsPosition}>
        <button onClick={onZoomIn}>
          <FontAwesomeIcon icon={faMagnifyingGlassPlus} title="zoom in button" titleId="zoom-in-icon"/>
        </button>
      </OverlayTrigger>
      <OverlayTrigger overlay={<Tooltip id="zoom-out-button-tooltip">Zoom out</Tooltip>} placement={tooltipsPosition}>
        <button onClick={onZoomOut}>
          <FontAwesomeIcon icon={faMagnifyingGlassMinus} title="zoom out button" titleId="zoom-out-icon"/>
        </button>
      </OverlayTrigger>
      <OverlayTrigger overlay={<Tooltip id="reset-zoom-button-tooltip">Reset zoom</Tooltip>} placement={tooltipsPosition}>
        <button onClick={onResetZoom}>
          <FontAwesomeIcon icon={faRefresh} title="reset zoom button" titleId="reset-zoom-icon"/>
        </button>
      </OverlayTrigger>
    </div>
  )
};

export default ZoomButtons;