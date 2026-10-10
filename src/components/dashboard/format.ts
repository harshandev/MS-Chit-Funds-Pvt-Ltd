const TZ = "Asia/Kolkata";
const date = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
const dateTime = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ });

export const formatDate = (iso: string): string => date.format(new Date(iso));
export const formatDateTime = (iso: string): string => `${dateTime.format(new Date(iso))} IST`;
export const todayIso = (): string => new Date().toISOString().slice(0, 10);

const hourFmt = new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: TZ });
export function greeting(now = new Date()): string {
  const h = Number(hourFmt.format(now)) % 24;
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}
