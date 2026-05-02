const pad = (n: number) => String(n).padStart(2, "0");

/** Format a Date as "YYYY-MM-DD" in LOCAL time for calendar day comparisons. */
export function toLocalDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
