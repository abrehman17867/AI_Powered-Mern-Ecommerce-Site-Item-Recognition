/** Shared primary / secondary CTA styles — solid border + color transition (no slide clip). */

const SHELL_BASE =
  "group/btn relative inline-flex flex-row items-center justify-center gap-1.5 rounded-lg font-semibold outline-none transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-orange-400 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const LABEL_BASE =
  "relative inline-flex flex-row items-center justify-center gap-1.5 transition-colors duration-200 ease-out";

export function buttonShell(variant, surface = "light") {
  const ringOffset =
    surface === "dark"
      ? "focus-visible:ring-offset-zinc-950"
      : "focus-visible:ring-offset-white";

  switch (variant) {
    case "primary":
      return `${SHELL_BASE} ${ringOffset} border-2 border-orange-500 bg-orange-500 hover:bg-white hover:shadow-sm`;
    case "secondary":
      if (surface === "dark") {
        return `${SHELL_BASE} ${ringOffset} border-2 border-white/25 bg-transparent hover:border-orange-400 hover:bg-orange-500`;
      }
      return `${SHELL_BASE} ${ringOffset} border-2 border-orange-500 bg-white hover:bg-orange-500 hover:shadow-sm`;
    case "danger":
      return `${SHELL_BASE} ${ringOffset} border-2 border-red-600 bg-red-600 hover:bg-white hover:shadow-sm focus-visible:ring-red-500`;
    case "ghost":
      return `inline-flex flex-row items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted transition hover:bg-zinc-100 hover:text-foreground focus-visible:ring-2 focus-visible:ring-orange-400 ${ringOffset} disabled:pointer-events-none disabled:opacity-50`;
    default:
      return buttonShell("primary", surface);
  }
}

export function buttonLabel(variant) {
  switch (variant) {
    case "primary":
      return `${LABEL_BASE} text-white group-hover/btn:text-orange-600`;
    case "secondary":
      return `${LABEL_BASE} text-orange-600 group-hover/btn:text-white`;
    case "danger":
      return `${LABEL_BASE} text-white group-hover/btn:text-red-600`;
    case "ghost":
      return null;
    default:
      return buttonLabel("primary");
  }
}

export const buttonSizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};
