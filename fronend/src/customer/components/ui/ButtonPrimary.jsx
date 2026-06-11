import React from "react";
import Button from "../../../components/ui/Button";

/** Orange primary CTA — for dark surfaces (navbar, hero on dark). */
const ButtonPrimary = React.forwardRef(function ButtonPrimary(props, ref) {
  return <Button ref={ref} variant="primary" surface="dark" {...props} />;
});

ButtonPrimary.displayName = "ButtonPrimary";

export default ButtonPrimary;
