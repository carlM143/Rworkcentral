export const employeeTenure = (startDate: string, today = new Date()): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(startDate)
  if (!match) return 'Not provided'
  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const start = new Date(year, month, day)
  if (start.getFullYear() !== year || start.getMonth() !== month || start.getDate() !== day) return 'Not provided'
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (Number.isNaN(current.getTime())) return 'Not provided'
  if (start > current) return 'Not started yet'
  let months = (current.getFullYear() - year) * 12 + current.getMonth() - month
  // Month-end hires reach their anniversary on the last day of shorter months.
  const anniversaryDay = Math.min(day, new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate())
  if (current.getDate() < anniversaryDay) months--
  if (months === 0) return 'Less than a month'
  const years = Math.floor(months / 12)
  const remainder = months % 12
  return [years ? `${years} year${years === 1 ? '' : 's'}` : '', remainder ? `${remainder} month${remainder === 1 ? '' : 's'}` : ''].filter(Boolean).join(', ')
}
