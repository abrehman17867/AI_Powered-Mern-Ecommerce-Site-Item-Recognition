import React from "react";
import { classNames } from "../../utils/classNames";
import Button from "./Button";

const EmptyState = ({
  title = "Nothing here yet",
  description,
  actionLabel,
  onAction,
  icon,
  className,
}) => (
  <div
    className={classNames(
      "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center",
      className
    )}
  >
    {icon ? <div className="mb-4 text-foreground-subtle">{icon}</div> : null}
    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    {description ? (
      <p className="mt-2 max-w-sm text-sm text-foreground-muted">{description}</p>
    ) : null}
    {actionLabel && onAction ? (
      <Button className="mt-6" onClick={onAction}>
        {actionLabel}
      </Button>
    ) : null}
  </div>
);

export default EmptyState;
