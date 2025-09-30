import React from "react";
type Variant = "card" | "avatar" | "text" | "list" | "grid";
type Size = "xs" | "sm" | "md" | "lg";

interface Props {
  variant?: Variant;
  count?: number; // how many skeleton items to render
  size?: Size; // controls scale for avatar/text variants
  responsive?: boolean; // for list/grid variants — whether to adapt columns responsively
  className?: string;
  children?: React.ReactNode; // optional children to overlay on skeleton for complex placeholders
}

const basePulse = "animate-pulse dark:opacity-80";

function sizeClasses(size: Size | undefined, variant: Variant) {
  const s = size || "md";
  if (variant === "avatar") {
    switch (s) {
      case "xs":
        return "h-6 w-6 rounded-full";
      case "sm":
        return "h-10 w-10 rounded-full";
      case "md":
        return "h-14 w-14 rounded-full";
      case "lg":
        return "h-20 w-20 rounded-full";
    }
  }

  if (variant === "text") {
    switch (s) {
      case "xs":
        return "h-3";
      case "sm":
        return "h-4";
      case "md":
        return "h-5";
      case "lg":
        return "h-6";
    }
  }

  // default fallback
  return "h-5";
}

function CardSkeleton({ size }: { size?: Size }) {
  return (
    <div className="w-full rounded-2xl border border-transparent bg-gray-100 dark:bg-gray-800 p-4">
      <div className={`${basePulse} bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden`}>
        <div className="w-full h-44 sm:h-36 md:h-48 rounded-lg" />
      </div>

      <div className="mt-3 space-y-2">
        <div className={`${basePulse} bg-gray-200 dark:bg-gray-700 rounded ${sizeClasses(size, "text")}`} />
        <div className={`${basePulse} bg-gray-200 dark:bg-gray-700 rounded ${sizeClasses(size, "text")}`} />
        <div className={`${basePulse} bg-gray-200 dark:bg-gray-700 rounded ${sizeClasses(size, "text")} w-3/4`} />
      </div>
    </div>
  );
}

function AvatarSkeleton({ size }: { size?: Size }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`${basePulse} bg-gray-200 dark:bg-gray-700 ${sizeClasses(size, "avatar")}`} />
      <div className="flex-1 space-y-2">
        <div className={`${basePulse} bg-gray-200 dark:bg-gray-700 rounded ${sizeClasses(size, "text")} w-1/2`} />
        <div className={`${basePulse} bg-gray-200 dark:bg-gray-700 rounded ${sizeClasses(size, "text")} w-1/3`} />
      </div>
    </div>
  );
}

function TextSkeleton({ size }: { size?: Size }) {
  return (
    <div className="space-y-2">
      <div className={`${basePulse} bg-gray-200 dark:bg-gray-700 rounded ${sizeClasses(size, "text")} w-full`} />
      <div className={`${basePulse} bg-gray-200 dark:bg-gray-700 rounded ${sizeClasses(size, "text")} w-5/6`} />
      <div className={`${basePulse} bg-gray-200 dark:bg-gray-700 rounded ${sizeClasses(size, "text")} w-2/3`} />
    </div>
  );
}

function ListSkeleton({ count = 3, size }: { count?: number; size?: Size }) {
  const items = Array.from({ length: count });
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700 rounded-md overflow-hidden">
      {items.map((_, i) => (
        <div key={i} className="p-3">
          <div className="flex items-center gap-3">
            <div className={`${basePulse} bg-gray-200 dark:bg-gray-700 rounded-full h-10 w-10`} />
            <div className="flex-1">
              <div className={`${basePulse} bg-gray-200 dark:bg-gray-700 rounded ${sizeClasses(size, "text")} w-1/2`} />
              <div className={`${basePulse} bg-gray-200 dark:bg-gray-700 rounded ${sizeClasses(size, "text")} w-1/4 mt-2`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function GridSkeleton({ count = 4, responsive = true }: { count?: number; responsive?: boolean }) {
  const items = Array.from({ length: count });
  const cols = responsive
    ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    : "grid-cols-2";

  return (
    <div className={`grid gap-4 ${cols}`}>
      {items.map((_, i) => (
        <div key={i} className="rounded-lg overflow-hidden">
          <div className={`${basePulse} bg-gray-200 dark:bg-gray-700 rounded-md`} style={{ height: 140 }} />
          <div className="mt-2 space-y-2 p-2">
            <div className={`${basePulse} bg-gray-200 dark:bg-gray-700 rounded h-4 w-3/4`} />
            <div className={`${basePulse} bg-gray-200 dark:bg-gray-700 rounded h-3 w-1/2`} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ResponsiveSkeleton({
  variant = "card",
  count = 1,
  size = "md",
  responsive = true,
  className = "",
  children,
}: Props) {
  // Respect user preference for reduced motion
  const prefersReduced = typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // if reduced motion is preferred, remove the animation class
  const pulseClass = prefersReduced ? "" : basePulse;

  // Small helper to render repeated units
  const renderRepeated = (el: React.ReactElement) => {
    if (count <= 1) return el;
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i}>{el}</div>
        ))}
      </div>
    );
  };

  // Provide minimal accessible wrapper
  return (
    <div className={`w-full ${className}`} aria-busy="true" aria-live="polite">
      {/* If reduced motion is on, we simply avoid animating. We still keep the layout. */}
      <div className={prefersReduced ? "" : ""}>
        {variant === "card" && renderRepeated(<CardSkeleton size={size} />)}
        {variant === "avatar" && renderRepeated(<AvatarSkeleton size={size} />)}
        {variant === "text" && renderRepeated(<TextSkeleton size={size} />)}
        {variant === "list" && renderRepeated(<ListSkeleton count={count} size={size} />)}
        {variant === "grid" && renderRepeated(<GridSkeleton count={count} responsive={responsive} />)}
      </div>

      {children /* optional overlay children for customizing the placeholder */}
    </div>
  );
}

/* ------------------ EXAMPLES ------------------

1) Simple card placeholder
<ResponsiveSkeleton variant="card" className="max-w-md" />

2) Avatar + two-line text
<ResponsiveSkeleton variant="avatar" size="sm" />

3) Grid of product placeholders (responsive)
<ResponsiveSkeleton variant="grid" count={8} responsive />

4) List of items
<ResponsiveSkeleton variant="list" count={4} />

5) Inline text block
<ResponsiveSkeleton variant="text" size="lg" />

Tips:
- Override spacing/width using className. e.g. className="max-w-2xl mx-auto"
- Wrap the skeleton with your container so the internal widths respond to parent size.
- For accessibility, set aria-hidden="true" on purely decorative skeletons if they shouldn't be read by screen readers.

*/
