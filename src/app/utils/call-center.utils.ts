const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-09-22T20:08:06+05:30" -> "20:08:06" */
export function isoTime(iso?: string | null): string {
  return iso ? iso.slice(11, 19) : '--';
}

/** -> "22/09/2026, 20:10:17" */
export function isoDateTime(iso?: string | null): string {
  if (!iso) return '--';
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}, ${iso.slice(11, 19)}`;
}

/** -> "Sep 17, 09:00:59" */
export function recordStart(iso?: string | null): string {
  if (!iso) return '--';
  const month = MONTHS[parseInt(iso.slice(5, 7), 10) - 1];
  return `${month} ${parseInt(iso.slice(8, 10), 10)}, ${iso.slice(11, 19)}`;
}

/** 0 -> "0s", 75 -> "1m 15s", null -> "--" */
export function formatSeconds(s?: number | null): string {
  if (s === null || s === undefined) return '--';
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = Math.round(s % 60);
  return r ? `${m}m ${r}s` : `${m}m`;
}

/** weekStart "2026-08-31" -> "31 Aug" */
export function shortDate(isoDate?: string | null): string {
  if (!isoDate) return '';
  return `${parseInt(isoDate.slice(8, 10), 10)} ${MONTHS[parseInt(isoDate.slice(5, 7), 10) - 1]}`;
}