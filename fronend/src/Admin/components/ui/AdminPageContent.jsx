import React from "react";
import { classNames } from "../../../utils/classNames";

/** Keeps admin route content within the same width rules as customer pages. */
export default function AdminPageContent({ children, className }) {
  return <div className={classNames("w-full min-w-0 max-w-full", className)}>{children}</div>;
}
