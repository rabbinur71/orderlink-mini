/**
 * Simple, safe slugify function.
 * Produces: lowercase, ascii-only, hyphen-separated slug, trims to 64 chars.
 */
export function slugify(input: string, maxLen = 64): string {
  if (!input) return '';
  // convert to lower, normalize to NFKD to strip accents
  const s = input
    .toLowerCase()
    .normalize('NFKD')
    // remove combining diacritics
    .replace(/[\u0300-\u036f]/g, '')
    // replace non-alphanumeric with hyphen
    .replace(/[^a-z0-9]+/g, '-')
    // trim hyphens
    .replace(/^-+|-+$/g, '')
    // collapse multiple hyphens
    .replace(/-+/g, '-');
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen).replace(/-+$/,'');
}