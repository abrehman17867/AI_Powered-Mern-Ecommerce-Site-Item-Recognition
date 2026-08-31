"use client";

import React, { Fragment, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { classNames } from "../../utils/classNames";

function SelectOptions({ options, compact }) {
  if (!options.length) {
    return <p className="px-4 py-2.5 text-sm text-foreground-muted">No options</p>;
  }

  return options.map((option) => (
    <Listbox.Option
      key={option.value || "__empty"}
      value={option.value}
      disabled={option.disabled}
      className={({ active, selected: isSelected, disabled: isDisabled }) =>
        classNames(
          "relative cursor-pointer select-none py-2.5 pl-10 pr-4 transition",
          compact ? "text-xs" : "text-sm",
          isDisabled && "cursor-not-allowed opacity-50",
          active && !isDisabled && "bg-brand-50 text-brand-800",
          isSelected && !active && "bg-zinc-50 font-medium text-foreground",
          !isSelected && !active && "text-foreground"
        )
      }
    >
      {({ selected: isSelected }) => (
        <>
          <span className={classNames("block truncate", isSelected ? "font-semibold" : "font-normal")}>
            {option.label}
          </span>
          {isSelected ? (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-600">
              <CheckIcon className={compact ? "h-4 w-4" : "h-5 w-5"} aria-hidden />
            </span>
          ) : null}
        </>
      )}
    </Listbox.Option>
  ));
}

function SelectPanel({ open, compact, menuStyle, options }) {
  const panel = (
    <Listbox.Options
      className={classNames(
        "max-h-60 overflow-auto rounded-xl border border-line bg-surface py-1.5 shadow-lg ring-1 ring-black/5 focus:outline-none",
        compact ? "min-w-[9.5rem]" : "absolute z-50 mt-1.5 w-full"
      )}
      style={compact && menuStyle ? menuStyle : undefined}
    >
      <SelectOptions options={options} compact={compact} />
    </Listbox.Options>
  );

  if (compact && open && menuStyle) {
    return createPortal(panel, document.body);
  }

  return panel;
}

function SelectControl({
  open,
  compact,
  className,
  label,
  fieldId,
  required,
  displayLabel,
  isPlaceholder,
  error,
  disabled,
  buttonRef,
  options,
  menuStyle,
  hint,
}) {
  return (
    <div className={classNames("flex flex-col gap-1.5", className)}>
      {label ? (
        <Listbox.Label htmlFor={fieldId} className="text-sm font-medium text-foreground">
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </Listbox.Label>
      ) : null}

      <div className="relative">
        <Listbox.Button
          ref={buttonRef}
          id={fieldId}
          className={classNames(
            "ui-input flex w-full items-center justify-between gap-2 text-left",
            compact ? "h-9 px-3 text-xs" : "h-11 text-sm",
            open && "border-brand-500 ring-2 ring-brand-500/20",
            error && "border-red-500 ring-red-500/20",
            disabled && "cursor-not-allowed opacity-60",
            isPlaceholder && "text-foreground-subtle"
          )}
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronDownIcon
            className={classNames(
              "shrink-0 text-foreground-muted transition-transform",
              compact ? "h-4 w-4" : "h-5 w-5",
              open && "rotate-180"
            )}
            aria-hidden
          />
        </Listbox.Button>

        <Transition
          as={Fragment}
          show={open}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
          enter="transition ease-out duration-100"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
        >
          <SelectPanel open={open} compact={compact} menuStyle={menuStyle} options={options} />
        </Transition>
      </div>

      {error ? (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-foreground-subtle">{hint}</p>
      ) : null}
    </div>
  );
}

/**
 * Custom dropdown — replaces native <select> with styled Headless UI Listbox.
 */
export default function Select({
  label,
  value = "",
  onChange,
  options = [],
  placeholder = "Select…",
  disabled = false,
  required = false,
  hint,
  error,
  id,
  name,
  compact = false,
  className,
}) {
  const buttonRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState(null);
  const fieldId = id || name || label?.replace(/\s+/g, "-").toLowerCase();
  const selected = options.find((o) => o.value === value);
  const displayLabel = selected?.label ?? placeholder;
  const isPlaceholder = !selected && value === "";

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled} name={name}>
      {({ open }) => (
        <SelectControlWithPortal
          open={open}
          compact={compact}
          buttonRef={buttonRef}
          menuStyle={menuStyle}
          setMenuStyle={setMenuStyle}
          className={className}
          label={label}
          fieldId={fieldId}
          required={required}
          displayLabel={displayLabel}
          isPlaceholder={isPlaceholder}
          error={error}
          disabled={disabled}
          options={options}
          hint={hint}
        />
      )}
    </Listbox>
  );
}

function SelectControlWithPortal(props) {
  const { open, compact, buttonRef, setMenuStyle, ...rest } = props;

  useLayoutEffect(() => {
    if (!open || !compact || !buttonRef.current) {
      setMenuStyle(null);
      return undefined;
    }

    const update = () => {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuStyle({
        position: "fixed",
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    };

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, compact, buttonRef, setMenuStyle]);

  return (
    <SelectControl
      {...rest}
      open={open}
      compact={compact}
      buttonRef={buttonRef}
      menuStyle={props.menuStyle}
    />
  );
}
