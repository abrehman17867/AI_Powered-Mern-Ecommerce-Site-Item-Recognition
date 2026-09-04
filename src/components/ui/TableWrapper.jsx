"use client";

import React from "react";
import { classNames } from "../../utils/classNames";

/**
 * Horizontal scroll container for a data table.
 *
 * The scroll lives on this single element — an earlier version nested a second
 * `overflow-x-auto` div inside, which meant the global `.table-scroll > table`
 * rule never matched its table and the intended min-width was silently dead.
 * Give the `<table>` inside a `min-w-[...]` wide enough for its columns so it
 * scrolls on phones instead of squashing every column into a few characters.
 */
const TableWrapper = ({ children, className }) => (
  <div
    className={classNames(
      "table-scroll rounded-xl border border-line bg-surface",
      className
    )}
  >
    {children}
  </div>
);

export default TableWrapper;
