import React from "react";
import Button from "../../../components/ui/Button";

/** Orange secondary CTA — for dark surfaces (navbar). */
const ButtonSecondary = React.forwardRef(function ButtonSecondary(props, ref) {
  return <Button ref={ref} variant="secondary" surface="dark" {...props} />;
});

ButtonSecondary.displayName = "ButtonSecondary";

export default ButtonSecondary;
