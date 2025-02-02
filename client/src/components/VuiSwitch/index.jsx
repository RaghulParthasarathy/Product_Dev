import { forwardRef } from "react";
import PropTypes from "prop-types";
import VuiSwitchRoot from "../VuiSwitch/VuiSwitchRoot";

const VuiSwitch = forwardRef(({ color, size, ...rest }, ref) => (
  <VuiSwitchRoot {...rest} ref={ref} color="white" size={size} ownerState={{ color, size }} />
));

// Setting default values for the props of VuiSwitch
VuiSwitch.defaultProps = {
  size: "medium",
  color: "white",
};

// Typechecking props for the VuiSwitch
VuiSwitch.propTypes = {
  size: PropTypes.oneOf(["small", "medium", "large"]),
  color: PropTypes.oneOf([
    "white",
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
};

export default VuiSwitch;
