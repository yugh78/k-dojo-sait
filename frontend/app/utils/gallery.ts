export function galleryDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(value))
    : "";
}

export function galleryThumbnailIndices(
  active: number,
  total: number,
  limit = 9,
) {
  const count = Math.min(total, limit);
  const start = Math.max(
    0,
    Math.min(active - Math.floor(count / 2), total - count),
  );
  return Array.from({ length: count }, (_, index) => start + index);
}
