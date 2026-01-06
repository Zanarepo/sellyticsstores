/**
 * Safely creates a page URL with optional query params
 *
 * @param {string} path - Base path (e.g. "/register", "/dashboard")
 * @param {Object} [params] - Optional query parameters
 * @returns {string} - Final URL
 *
 * Example:
 * createPageUrl('/register')
 * createPageUrl('/dashboard', { storeId: 12, tab: 'inventory' })
 */
export function createPageUrl(path = '/', params = {}) {
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  const query = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ''
    ) {
      query.append(key, String(value));
    }
  });

  const queryString = query.toString();

  return queryString ? `${path}?${queryString}` : path;
}
