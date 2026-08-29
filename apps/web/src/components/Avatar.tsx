/**
 * src/components/Avatar.tsx — avatar with initials fallback
 * TODOs: none — fully implemented scaffold.
 * Used in the navbar, profile header and settings; the settings avatar
 * uploader passes its preview through `src`.
 */

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-12 w-12 text-base",
  lg: "h-24 w-24 text-3xl",
} as const;

export interface AvatarProps {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZES;
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({ name, src, size = "md" }: AvatarProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- object URLs / data URIs from the uploader can't go through next/image
      <img
        src={src}
        alt={name}
        className={`${SIZES[size]} rounded-full object-cover ring-2 ring-white dark:ring-slate-800`}
      />
    );
  }
  return (
    <span
      aria-label={name}
      className={`${SIZES[size]} flex select-none items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-sky-600 font-semibold text-white ring-2 ring-white dark:ring-slate-800`}
    >
      {initialsOf(name)}
    </span>
  );
}
