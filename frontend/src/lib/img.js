// Convert stored image strings to browser-loadable URLs.
// - "/api/files/..." -> prepend REACT_APP_BACKEND_URL
// - "/images/..."     -> served by React's public/ folder as-is
// - full "https://..." -> as-is
export function imageUrl(image) {
  if (!image) return "";
  if (image.startsWith("/api/")) {
    return `${process.env.REACT_APP_BACKEND_URL || ""}${image}`;
  }
  return image;
}
