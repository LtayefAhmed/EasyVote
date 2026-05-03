/**
 * Format a date in long French style: "lundi 4 mai 2026"
 */
export function formatLongFr(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d)
}

/**
 * Format a date in short French style: "04/05/2026"
 */
export function formatShortFr(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d)
}

/**
 * Format a date+time in French: "04/05/2026 14:32"
 */
export function formatDateTimeFr(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

/**
 * Returns a relative-time string like "il y a 2j" / "il y a 5min" / "à l'instant"
 */
export function timeAgoFr(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const diff = Date.now() - d.getTime()

  if (diff < 60_000) return "à l'instant"
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 60) return `il y a ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `il y a ${days}j`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `il y a ${weeks}sem`
  const months = Math.floor(days / 30)
  if (months < 12) return `il y a ${months}mois`
  const years = Math.floor(days / 365)
  return `il y a ${years}an${years > 1 ? "s" : ""}`
}
