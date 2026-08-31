"use client";

import React from "react";
import { classNames } from "../../utils/classNames";

const TableWrapper = ({ children, className }) => (
  <div className={classNames("table-scroll rounded-xl border border-border bg-surface", className)}>
    <div className="overflow-x-auto">{children}</div>
  </div>
);

export default TableWrapper;
