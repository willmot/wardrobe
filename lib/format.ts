export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date));
}

export function confidenceLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function categoryCount(items: { category: string }[], category: string): number {
  return items.filter((item) => item.category === category).length;
}
