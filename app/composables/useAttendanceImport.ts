
import type {
  AttendanceImportRow,
  AttendanceImportSummary,
} from '~/types/attendanceImport'

import type {
  TimeLogRecord,
} from '~/types/timekeeping'

export const useAttendanceImport = () => {
  const { employees } = useEmployees()
  const { timeLogs } = useTimeLogs()

  const rows = ref<AttendanceImportRow[]>([])
  const fileName = ref('')
  const error = ref('')
  const busy = ref(false)

  const normalize = (value: string) =>
    value.trim().toLowerCase().replace(/[^a-z0-9]/g, '')

  // Handles CSV quoted values, commas and line breaks.
  const parseCSV = (text: string): string[][] => {
    const result: string[][] = []
    let currentRow: string[] = []
    let cell = ''
    let quoted = false

    const content = text.replace(/^\uFEFF/, '')

    for (let i = 0; i < content.length; i++) {
      const char = content[i]

      if (char === '"') {
        if (quoted && content[i + 1] === '"') {
          cell += '"'
          i++
        } else {
          quoted = !quoted
        }
      } else if (char === ',' && !quoted) {
        currentRow.push(cell.trim())
        cell = ''
      } else if (
        (char === '\n' || char === '\r') &&
        !quoted
      ) {
        if (char === '\r' && content[i + 1] === '\n') i++

        currentRow.push(cell.trim())

        if (currentRow.some(value => value !== '')) {
          result.push(currentRow)
        }

        currentRow = []
        cell = ''
      } else {
        cell += char
      }
    }

    if (quoted) {
      throw new Error('Invalid CSV: unclosed quotation mark.')
    }

    currentRow.push(cell.trim())

    if (currentRow.some(value => value !== '')) {
      result.push(currentRow)
    }

    return result
  }

  const parseDate = (value: string): string | null => {
    const input = value.trim()
    let year: number
    let month: number
    let day: number

    const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(input)
    const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(input)

    if (iso) {
      year = Number(iso[1])
      month = Number(iso[2])
      day = Number(iso[3])
    } else if (us) {
      month = Number(us[1])
      day = Number(us[2])
      year = Number(us[3])
    } else {
      return null
    }

    const date = new Date(Date.UTC(year, month - 1, day))

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() + 1 !== month ||
      date.getUTCDate() !== day
    ) {
      return null
    }

    return [
      String(year).padStart(4, '0'),
      String(month).padStart(2, '0'),
      String(day).padStart(2, '0'),
    ].join('-')
  }

  const minutesOfDay = (value?: string): number | null => {
    if (!value?.trim()) return null

    const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i
      .exec(value.trim())

    if (!match) return null

    let hour = Number(match[1])
    const minute = Number(match[2])
    const period = match[4]?.toUpperCase()

    if (minute > 59 || (period ? hour < 1 || hour > 12 : hour > 23)) {
      return null
    }

    if (period) {
      hour = hour % 12 + (period === 'PM' ? 12 : 0)
    }

    return hour * 60 + minute
  }

  const formatTime = (value?: string): string | undefined => {
    const minutes = minutesOfDay(value)
    if (minutes === null) return undefined

    const hour24 = Math.floor(minutes / 60)
    const minute = minutes % 60

    return `${hour24 % 12 || 12}:${String(minute).padStart(2, '0')} ${hour24 >= 12 ? 'PM' : 'AM'}`
  }

  const lookupEmployee = (employeeNumber: string) => {
    return employees.value.find(
      employee =>
        normalize(employee.employeeNumber) === normalize(employeeNumber),
    )
  }

  const validateRows = (parsed: string[][]) => {
    if (!parsed.length) {
      throw new Error('The CSV file is empty.')
    }

    const headers = parsed[0]!.map(normalize)

    const indexOf = (...names: string[]) =>
      headers.findIndex(header => names.some(name => normalize(name) === header))

    const employeeIndex = indexOf(
      'Employee ID', 'Employee Number', 'Employee No', 'Employee Code',
    )
    const dateIndex = indexOf('Date', 'Attendance Date')
    const inIndex = indexOf('Time In', 'In', 'Check In')
    const outIndex = indexOf('Time Out', 'Out', 'Check Out')
    const breakOutIndex = indexOf('Break Out', 'Lunch Out')
    const breakInIndex = indexOf('Break In', 'Lunch In')

    if (
      employeeIndex < 0 ||
      dateIndex < 0 ||
      inIndex < 0 ||
      outIndex < 0
    ) {
      throw new Error(
        'Required CSV columns: Employee ID, Date, Time In, Time Out.',
      )
    }

    const seen = new Set<string>()

    const existing = new Set(
      timeLogs.value.map(log => `${log.employeeId}|${log.date}`),
    )

    rows.value = parsed.slice(1).map((record, index) => {
      const get = (column: number) =>
        column < 0 ? '' : (record[column] ?? '').trim()

      const employeeNumber = get(employeeIndex)
      const date = parseDate(get(dateIndex))
      const employee = lookupEmployee(employeeNumber)

      const rawIn = get(inIndex)
      const rawOut = get(outIndex)
      const rawBreakOut = get(breakOutIndex)
      const rawBreakIn = get(breakInIndex)

      const invalidTime = [rawIn, rawOut, rawBreakOut, rawBreakIn]
        .some(value => value !== '' && minutesOfDay(value) === null)

      const key = employee && date
        ? `${employee.id}|${date}`
        : ''

      let status: AttendanceImportRow['status'] = 'Valid'
      let message = 'Ready to import'

      if (!employeeNumber) {
        status = 'Invalid'
        message = 'Missing employee ID'
      } else if (!employee) {
        status = 'Invalid'
        message = 'Employee ID not found'
      } else if (!date) {
        status = 'Invalid'
        message = 'Invalid date'
      } else if (invalidTime) {
        status = 'Invalid'
        message = 'Invalid time format'
      } else if (!rawIn && !rawOut) {
        status = 'Invalid'
        message = 'No biometric punches'
      } else if (
        rawIn &&
        rawOut &&
        minutesOfDay(rawOut)! < minutesOfDay(rawIn)!
      ) {
        status = 'Invalid'
        message = 'Overnight shift requires manual review'
      } else if (
        rawBreakOut &&
        rawBreakIn &&
        minutesOfDay(rawBreakIn)! < minutesOfDay(rawBreakOut)!
      ) {
        status = 'Invalid'
        message = 'Invalid break order'
      } else if (existing.has(key) || seen.has(key)) {
        status = 'Duplicate'
        message = 'Attendance already exists for this date'
      }

      if (key) seen.add(key)

      return {
        rowNumber: index + 2,
        employeeNumber,
        employeeId: employee?.id,
        employeeName: employee
          ? [employee.firstName, employee.middleName, employee.lastName]
              .filter(Boolean).join(' ')
          : undefined,
        date: date ?? get(dateIndex),
        timeIn: formatTime(rawIn),
        timeOut: formatTime(rawOut),
        breakOut: formatTime(rawBreakOut),
        breakIn: formatTime(rawBreakIn),
        status,
        message,
      }
    })
  }

  const summary = computed(() => ({
    total: rows.value.length,
    valid: rows.value.filter(row => row.status === 'Valid').length,
    duplicates: rows.value.filter(row => row.status === 'Duplicate').length,
    invalid: rows.value.filter(row => row.status === 'Invalid').length,
  }))

  const selectFile = async (file: File) => {
    error.value = ''
    rows.value = []
    fileName.value = ''
    busy.value = true

    try {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        throw new Error('Please select a CSV file.')
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Maximum file size is 5 MB.')
      }

      const text = await file.text()
      const parsed = parseCSV(text)

      if (parsed.length > 10001) {
        throw new Error('Maximum of 10,000 attendance rows per import.')
      }

      validateRows(parsed)
      fileName.value = file.name
    } catch (cause) {
      error.value = cause instanceof Error
        ? cause.message
        : 'Unable to read the attendance file.'
    } finally {
      busy.value = false
    }
  }

  const calculateHours = (row: AttendanceImportRow) => {
    const start = minutesOfDay(row.timeIn)
    const end = minutesOfDay(row.timeOut)

    if (start === null || end === null || end < start) {
      return undefined
    }

    const breakStart = minutesOfDay(row.breakOut)
    const breakEnd = minutesOfDay(row.breakIn)

    // Default: one-hour unpaid break if break punches are absent.
    // This is a temporary preview assumption, not payroll-ready calculation.
    const breakMinutes = breakStart !== null &&
      breakEnd !== null &&
      breakEnd >= breakStart
      ? breakEnd - breakStart
      : 60

    return Math.round(Math.max(0, end - start - breakMinutes) / 60 * 100) / 100
  }

  const commitImport = (): AttendanceImportSummary => {
    const validRows = rows.value.filter(
      row => row.status === 'Valid' && row.employeeId !== undefined,
    )

    const existing = new Set(
      timeLogs.value.map(log => `${log.employeeId}|${log.date}`),
    )

    let nextId = Math.max(0, ...timeLogs.value.map(log => log.id)) + 1
    const importedDates: string[] = []
    const newLogs: TimeLogRecord[] = []

    for (const row of validRows) {
      const key = `${row.employeeId}|${row.date}`
      if (existing.has(key)) continue

      const employee = lookupEmployee(row.employeeNumber)
      if (!employee) continue

      newLogs.push({
        id: nextId++,
        employeeId: employee.id,
        employeeNumber: employee.employeeNumber,
        employeeName: row.employeeName ?? '',
        department: employee.department,
        position: employee.position,
        date: row.date,
        schedule: employee.workSchedule || '8:00 AM - 5:00 PM',
        timeIn: row.timeIn,
        timeOut: row.timeOut,
        breakOut: row.breakOut,
        breakIn: row.breakIn,
        lateMinutes: 0,
        undertimeMinutes: 0,
        hoursWorked: calculateHours(row),
        status: row.timeIn && row.timeOut ? 'Complete' : 'Incomplete',
        attendanceSource: 'Imported Attendance',
      })

      existing.add(key)
      importedDates.push(row.date)
    }

    timeLogs.value.push(...newLogs)

    return {
      total: rows.value.length,
      imported: newLogs.length,
      duplicates: summary.value.duplicates,
      invalid: summary.value.invalid,
      earliestDate: importedDates.length
        ? [...importedDates].sort()[0]
        : undefined,
      latestDate: importedDates.length
        ? [...importedDates].sort().at(-1)
        : undefined,
    }
  }

  const reset = () => {
    rows.value = []
    fileName.value = ''
    error.value = ''
  }

  return {
    rows,
    fileName,
    error,
    busy,
    summary,
    selectFile,
    commitImport,
    reset,
  }
}
