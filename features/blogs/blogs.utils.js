export function createSlug(title) {
  const slug = title
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (slug) {
    return slug;
  }

  return `blog-${Date.now()}`;
}