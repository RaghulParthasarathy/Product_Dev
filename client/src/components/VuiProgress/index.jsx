import { forwardRef } from "react";
import PropTypes from "prop-types";
import VuiTypography from "../VuiTypography";
import VuiProgressRoot from "../VuiProgress/VuiProgressRoot"
;
const VuiProgress = forwardRef(({ variant, color, value, label, ...rest }, ref) => (
  <>
    {label && (
      <VuiTypography variant="button" fontWeight="medium" color="text">
        {value}%
      </VuiTypography>
    )}
    <VuiProgressRoot
      {...rest}
      ref={ref}
      variant="determinate"
      value={value}
      ownerState={{ color, value, variant }}
    />
  </>
));

// Setting default values for the props of VuiProgress
VuiProgress.defaultProps = {
  variant: "contained",
  color: "info",
  value: 0,
  label: false,
};

// Typechecking props for the VuiProgress
VuiProgress.propTypes = {
  variant: PropTypes.oneOf(["contained", "gradient"]),
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
  value: PropTypes.number,
  label: PropTypes.bool,
};

export default VuiProgress;
