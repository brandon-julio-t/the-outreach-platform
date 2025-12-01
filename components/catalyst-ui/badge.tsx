import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import React from "react";

const colors = {
  red: "bg-red-500/15 text-red-700 group-data-hover:bg-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:group-data-hover:bg-red-500/20",
  orange:
    "bg-orange-500/15 text-orange-700 group-data-hover:bg-orange-500/25 dark:bg-orange-500/10 dark:text-orange-400 dark:group-data-hover:bg-orange-500/20",
  amber:
    "bg-amber-400/20 text-amber-700 group-data-hover:bg-amber-400/30 dark:bg-amber-400/10 dark:text-amber-400 dark:group-data-hover:bg-amber-400/15",
  yellow:
    "bg-yellow-400/20 text-yellow-700 group-data-hover:bg-yellow-400/30 dark:bg-yellow-400/10 dark:text-yellow-300 dark:group-data-hover:bg-yellow-400/15",
  lime: "bg-lime-400/20 text-lime-700 group-data-hover:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-hover:bg-lime-400/15",
  green:
    "bg-green-500/15 text-green-700 group-data-hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:group-data-hover:bg-green-500/20",
  emerald:
    "bg-emerald-500/15 text-emerald-700 group-data-hover:bg-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400 dark:group-data-hover:bg-emerald-500/20",
  teal: "bg-teal-500/15 text-teal-700 group-data-hover:bg-teal-500/25 dark:bg-teal-500/10 dark:text-teal-300 dark:group-data-hover:bg-teal-500/20",
  cyan: "bg-cyan-400/20 text-cyan-700 group-data-hover:bg-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300 dark:group-data-hover:bg-cyan-400/15",
  sky: "bg-sky-500/15 text-sky-700 group-data-hover:bg-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300 dark:group-data-hover:bg-sky-500/20",
  blue: "bg-blue-500/15 text-blue-700 group-data-hover:bg-blue-500/25 dark:text-blue-400 dark:group-data-hover:bg-blue-500/25",
  indigo:
    "bg-indigo-500/15 text-indigo-700 group-data-hover:bg-indigo-500/25 dark:text-indigo-400 dark:group-data-hover:bg-indigo-500/20",
  violet:
    "bg-violet-500/15 text-violet-700 group-data-hover:bg-violet-500/25 dark:text-violet-400 dark:group-data-hover:bg-violet-500/20",
  purple:
    "bg-purple-500/15 text-purple-700 group-data-hover:bg-purple-500/25 dark:text-purple-400 dark:group-data-hover:bg-purple-500/20",
  fuchsia:
    "bg-fuchsia-400/15 text-fuchsia-700 group-data-hover:bg-fuchsia-400/25 dark:bg-fuchsia-400/10 dark:text-fuchsia-400 dark:group-data-hover:bg-fuchsia-400/20",
  pink: "bg-pink-400/15 text-pink-700 group-data-hover:bg-pink-400/25 dark:bg-pink-400/10 dark:text-pink-400 dark:group-data-hover:bg-pink-400/20",
  rose: "bg-rose-400/15 text-rose-700 group-data-hover:bg-rose-400/25 dark:bg-rose-400/10 dark:text-rose-400 dark:group-data-hover:bg-rose-400/20",
  zinc: "bg-zinc-600/10 text-zinc-700 group-data-hover:bg-zinc-600/20 dark:bg-white/5 dark:text-zinc-400 dark:group-data-hover:bg-white/10",
};

type BadgeProps = { color?: keyof typeof colors };

/** @docs https://catalyst.tailwindui.com/docs/badge */
export function Badge({
  color = "zinc",
  className,
  ...props
}: BadgeProps & React.ComponentPropsWithoutRef<"span">) {
  return (
    <span
      {...props}
      className={clsx(
        className,
        "inline-flex items-center gap-x-1.5 rounded-md px-1.5 py-0.5 text-sm/5 font-medium sm:text-xs/5 forced-colors:outline",
        colors[color],
      )}
    />
  );
}

const badgePillVariants = cva(
  "inline-flex items-center rounded-full text-xs font-medium",
  {
    variants: {
      color: {
        gray: "bg-gray-50 text-gray-600 inset-ring inset-ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:inset-ring-gray-400/20",
        red: "bg-red-50 text-red-700 inset-ring inset-ring-red-600/10 dark:bg-red-400/10 dark:text-red-400 dark:inset-ring-red-400/20",
        yellow:
          "bg-yellow-50 text-yellow-800 inset-ring inset-ring-yellow-600/20 dark:bg-yellow-400/10 dark:text-yellow-500 dark:inset-ring-yellow-400/20",
        green:
          "bg-green-50 text-green-700 inset-ring inset-ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:inset-ring-green-500/20",
        blue: "bg-blue-50 text-blue-700 inset-ring inset-ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:inset-ring-blue-400/30",
        indigo:
          "bg-indigo-50 text-indigo-700 inset-ring inset-ring-indigo-700/10 dark:bg-indigo-400/10 dark:text-indigo-400 dark:inset-ring-indigo-400/30",
        purple:
          "bg-purple-50 text-purple-700 inset-ring inset-ring-purple-700/10 dark:bg-purple-400/10 dark:text-purple-400 dark:inset-ring-purple-400/30",
        pink: "bg-pink-50 text-pink-700 inset-ring inset-ring-pink-700/10 dark:bg-pink-400/10 dark:text-pink-400 dark:inset-ring-pink-400/20",
      },
      size: {
        default: "px-2 py-1",
        sm: "px-1.5 py-0.5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

/** @docs https://tailwindcss.com/plus/ui-blocks/application-ui/elements/badges */
export function BadgePill({
  color,
  size,
  className,
  ...props
}: {
  color: NonNullable<VariantProps<typeof badgePillVariants>["color"]>;
} & VariantProps<typeof badgePillVariants> &
  React.ComponentPropsWithoutRef<"span">) {
  return (
    <span
      className={clsx(badgePillVariants({ color, size }), className)}
      {...props}
    />
  );
}

const badgePillDotVariants = cva(
  "inline-flex items-center gap-x-1.5 rounded-full text-xs font-medium text-gray-900 inset-ring inset-ring-gray-200 dark:text-gray-200 dark:inset-ring-white/10",
  {
    variants: {
      size: {
        default: "px-2 py-1",
        sm: "px-1.5 py-0.5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const badgePillDotSvgVariants = cva("", {
  variants: {
    color: {
      red: "fill-red-500 dark:fill-red-400",
      yellow: "fill-yellow-500 dark:fill-yellow-400",
      green: "fill-green-500 dark:fill-green-400",
      blue: "fill-blue-500 dark:fill-blue-400",
      indigo: "fill-indigo-500 dark:fill-indigo-400",
      purple: "fill-purple-500 dark:fill-purple-400",
      pink: "fill-pink-500 dark:fill-pink-400",
    },
  },
});

/** @docs https://tailwindcss.com/plus/ui-blocks/application-ui/elements/badges */
export function BadgePillDot({
  color,
  size,
  className,
  children,
  ...props
}: VariantProps<typeof badgePillDotVariants> &
  VariantProps<typeof badgePillDotSvgVariants> &
  React.ComponentPropsWithoutRef<"span">) {
  return (
    <span
      className={clsx(badgePillDotVariants({ size }), className)}
      {...props}
    >
      <svg
        viewBox="0 0 6 6"
        aria-hidden="true"
        className={clsx("size-1.5", badgePillDotSvgVariants({ color }))}
      >
        <circle r={3} cx={3} cy={3} />
      </svg>
      {children}
    </span>
  );
}
