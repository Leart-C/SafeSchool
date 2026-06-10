export function formatDisplayDate(date: string): string {
  const parsedDate = date.includes('T')
    ? new Date(date)
    : new Date(`${date}T00:00:00`)

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(parsedDate)
}