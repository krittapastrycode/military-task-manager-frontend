const pad = (n: number) => String(n).padStart(2, "0");

/** Format a Date as "YYYY-MM-DDTHH:mm:00" in LOCAL time (no UTC conversion).
 *  The backend (Laravel Asia/Bangkok) treats no-timezone strings as local time,
 *  so sending local avoids the double-UTC-shift bug. */
export function toLocalISOString(date: Date): string {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
  );
}

/** Format a Date as "YYYY-MM-DD" in LOCAL time (no UTC conversion). */
export function toLocalDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
