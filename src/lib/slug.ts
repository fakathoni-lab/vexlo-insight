import { nanoid } from "nanoid";

/**
 * Generate a URL-safe slug for public proof sharing.
 * Default alphabet: A-Za-z0-9_-
 */
export function generateSlug(length = 10): string {
  return nanoid(length);
}
