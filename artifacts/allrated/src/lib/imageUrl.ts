const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

/**
 * Build a TMDB image URL with the desired size.
 * Handles both full URLs (from backend) and path-only strings.
 */
export function buildImageUrl(
  pathOrUrl: string | null | undefined,
  size: string = 'w500'
): string | null {
  if (!pathOrUrl) return null;

  // If it's already a full TMDB URL, replace the size
  if (pathOrUrl.startsWith(TMDB_IMAGE_BASE)) {
    return pathOrUrl.replace(/\/w\d+\//, `/${size}/`);
  }

  // If it's already any full URL, return as-is
  if (pathOrUrl.startsWith('http')) {
    return pathOrUrl;
  }

  // Otherwise, prepend the base
  return `${TMDB_IMAGE_BASE}/${size}${pathOrUrl}`;
}
