"use client";
import { useLang } from "@/i18n/LanguageProvider";

const TZ = "Asia/Kolkata";
const dateFmts = new Map<string, Intl.DateTimeFormat>();
const dateTimeFmts = new Map<string, Intl.DateTimeFormat>();
const dateFmt = (loc: string) => {
  let f = dateFmts.get(loc);
  if (!f) dateFmts.set(loc, (f = new Intl.DateTimeFormat(loc, { day: "numeric", month: "short", year: "numeric", timeZone: TZ })));
  return f;
};
const dateTimeFmt = (loc: string) => {
  let f = dateTimeFmts.get(loc);
  if (!f) dateTimeFmts.set(loc, (f = new Intl.DateTimeFormat(loc, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ })));
  return f;
};

export const formatDate = (iso: string, loc = "en-IN"): string => dateFmt(loc).format(new Date(iso));
export const formatDateTime = (iso: string, loc = "en-IN"): string => `${dateTimeFmt(loc).format(new Date(iso))} IST`;
export const todayIso = (): string => new Date().toISOString().slice(0, 10);

/** Locale-aware date helpers bound to the active language (en-IN or ta-IN). */
export function useDates() {
  const { lang } = useLang();
  const loc = lang === "ta" ? "ta-IN" : "en-IN";
  return { formatDate: (iso: string) => formatDate(iso, loc), formatDateTime: (iso: string) => formatDateTime(iso, loc), locale: loc };
}

const hourFmt = new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: TZ });
/** Returns an English greeting key; wrap with tr() at render. */
export function greeting(now = new Date()): string {
  const h = Number(hourFmt.format(now)) % 24;
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}
