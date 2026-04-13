/**
 * Calculates age from a birthDate string (ISO format).
 * Used in admin panel table and Excel export.
 */
export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Formats a date string for display.
 */
export function formatDate(
  date: string,
  locale = "tr-TR",
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }
): string {
  return new Date(date).toLocaleDateString(locale, options);
}

/**
 * Formats a date with time for display.
 */
export function formatDateTime(
  date: string,
  locale = "tr-TR",
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }
): string {
  return new Date(date).toLocaleString(locale, options);
}
