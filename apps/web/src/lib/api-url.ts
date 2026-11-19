/**
 * Where the API lives. Read ONCE, checked ONCE, imported everywhere.
 *
 * Next.js replaces `process.env.NEXT_PUBLIC_API_URL` with its value at build
 * time, so it must be written out in full: process.env[name] finds nothing
 * in the browser.
 */
const WHERE_TO_SET = "Set it in apps/web/.env.local (see .env.example), or pass it as a build argument when building the Docker image.";

function readApiUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL;

  if (!value) {
    throw new Error(`NEXT_PUBLIC_API_URL is missing. ${WHERE_TO_SET}`);
  }

  // Only the line that can throw goes in the try: anything else in there
  // would have its own error swallowed by the catch.
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`NEXT_PUBLIC_API_URL is not a valid URL: "${value}". ${WHERE_TO_SET}`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(
      `NEXT_PUBLIC_API_URL must start with http:// or https://, got "${value}". ${WHERE_TO_SET}`,
    );
  }

  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export const API_URL = readApiUrl();
