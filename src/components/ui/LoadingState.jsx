"use client";

import React from "react";
import { classNames } from "../../utils/classNames";
import Spinner from "../../customer/components/Spinner/Spinner";

const LoadingState = ({ label = "Loading…", className, minHeight = "min-h-[40vh]" }) => (
  <div
    className={classNames("flex flex-col items-center justify-center gap-3", minHeight, className)}
    role="status"
    aria-live="polite"
  >
    <Spinner />
    {label ? <p className="text-sm text-foreground-muted">{label}</p> : null}
  </div>
);

export default LoadingState;
