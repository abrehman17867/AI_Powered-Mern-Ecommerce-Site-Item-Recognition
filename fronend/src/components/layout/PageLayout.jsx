import React from "react";
import { classNames } from "../../utils/classNames";
import AppContainer from "./AppContainer";

const PageLayout = ({
  title,
  description,
  eyebrow,
  actions,
  children,
  className,
  containerClassName,
  noContainer = false,
  as: Wrapper = "div",
}) => {
  const content = (
    <>
      {(eyebrow || title || description || actions) && (
        <header className="mb-8 flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                {eyebrow}
              </p>
            ) : null}
            {title ? <h1 className="page-title mt-1">{title}</h1> : null}
            {description ? <p className="page-subtitle">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </header>
      )}
      {children}
    </>
  );

  return (
    <Wrapper className={classNames("page-section", className)}>
      {noContainer ? content : <AppContainer className={containerClassName}>{content}</AppContainer>}
    </Wrapper>
  );
};

export default PageLayout;
