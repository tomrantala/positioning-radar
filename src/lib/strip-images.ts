/**
 * Strip image references from markdown/HTML content.
 * Removes markdown images (![alt](url)) and HTML <img> tags
 * to prevent base64 data URIs from being sent to the Claude API.
 */
export function stripImages(content: string): string {
  if (!content) return content;

  // Remove markdown images: ![alt text](url)
  let result = content.replace(/!\[[^\]]*\]\([^)]+\)/g, "");

  // Remove HTML img tags: <img ... /> or <img ...>
  result = result.replace(/<img\s[^>]*\/?>/gi, "");

  return result;
}
