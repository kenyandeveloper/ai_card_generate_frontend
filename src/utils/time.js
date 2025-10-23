// src/utils/time.js
export function parseAsUTC(iso) {
  if (!iso) return null;
  // has Z or ±hh:mm at the end?
  const hasTZ = /(?:Z|[+-]\d{2}:\d{2})$/i.test(iso);
  return new Date(hasTZ ? iso : `${iso}Z`);
}

export function formatEAT(iso) {
  const d = parseAsUTC(iso);
  if (!d || isNaN(d)) return "—";
  return new Intl.DateTimeFormat(undefined, {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(d);
}
