export const clockMinutes = (time: string) => {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null
  const [hours, minutes] = time.split(':').map(Number)
  return hours! * 60 + minutes!
}

export const overtimeDuration = (start: string, end: string, nextDay: boolean) => {
  const first = clockMinutes(start)
  const last = clockMinutes(end)
  if (first === null || last === null) return null
  const minutes = last + (nextDay ? 1440 : 0) - first
  return minutes > 0 && minutes <= 1440 ? minutes : null
}

export const undertimeDuration = (shiftStart: string, shiftEnd: string, requestedStart: string, requestedEnd = shiftEnd) => {
  const first = clockMinutes(shiftStart)
  const last = clockMinutes(shiftEnd)
  const start = clockMinutes(requestedStart)
  const end = clockMinutes(requestedEnd)
  if (first === null || last === null || start === null || end === null || last <= first || start < first || end > last || end <= start) return null
  return end - start
}

export const requestClock = (value?: string) => {
  const minutes = clockMinutes(value || '')
  return minutes === null ? 'Not provided' : `${Math.floor(minutes / 60) % 12 || 12}:${String(minutes % 60).padStart(2, '0')} ${minutes >= 720 ? 'PM' : 'AM'}`
}
