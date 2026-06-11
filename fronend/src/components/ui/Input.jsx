import React from "react";
import { classNames } from "../../utils/classNames";

const Input = React.forwardRef(function Input(
  { label, error, hint, id, className, wrapperClassName, ...props },
  ref
) {
  const inputId = id || props.name;

  return (
    <div className={classNames("flex flex-col gap-1.5", wrapperClassName)}>
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        className={classNames(
          "ui-input",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-foreground-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
