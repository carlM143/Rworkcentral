/** Database timestamps without an offset are UTC; display decisions in Philippine time. */
export const formatApprovalDateTime = (value?: string | null): string => {
  if (!value) return '—'
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value)
  let normalized = value.replace(' ', 'T')
  if (dateOnly) normalized += 'T00:00:00+08:00'
  else if (!/(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized)) normalized += 'Z'
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    month: 'short', day: 'numeric', year: 'numeric',
    ...(dateOnly ? {} : { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' } as const),
  }).format(date)
}
