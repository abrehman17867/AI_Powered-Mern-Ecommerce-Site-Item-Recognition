import React from "react";
import { classNames } from "../../utils/classNames";

const Card = ({ title, subtitle, children, className, padding = true, as: Component = "section" }) => {
  return (
    <Component className={classNames("ui-card", padding && "p-5 md:p-6", className)}>
      {(title || subtitle) && (
        <div className="mb-5">
          {title ? (
            <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
          ) : null}
          {subtitle ? (
            <p className="mt-1 text-sm leading-relaxed text-foreground-muted">{subtitle}</p>
          ) : null}
        </div>
      )}
      {children}
    </Component>
  );
};

export default Card;
