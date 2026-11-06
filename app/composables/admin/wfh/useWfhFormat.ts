import { computed, ref, watch, type Component } from 'vue'

/** One item in the three-dots row menu. */
export interface WfhMenuItem {
  key: string
  label: string
  icon?: Component
  danger?: boolean
  dividerBefore?: boolean
}

export const wfhDateText = (value?: string | null): string => {
  if (!value) return '—'
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const wfhDateTimeText = (value?: string | null): string => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })
}

export const wfhWeekday = (value: string): string =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' })

export const wfhPeriodText = (start: string, end: string): string =>
  start === end ? wfhDateText(start) : `${wfhDateText(start)} – ${wfhDateText(end)}`

/** Downloads rows as a UTF-8 CSV, guarding against spreadsheet formula injection. */
export const wfhDownloadCsv = (filename: string, rows: unknown[][]): void => {
  const escape = (value: unknown) => {
    const text = String(value ?? '')
    const safe = /^[\s]*[=+@-]/.test(text) ? `'${text}` : text
    return `"${safe.replace(/"/g, '""')}"`
  }
  const csv = rows.map(row => row.map(escape).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Client-side pagination that matches BaseTableFooter's props. */
export const useWfhPagination = <T>(source: () => T[], size = 8) => {
  const page = ref(1)
  const totalItems = computed(() => source().length)
  const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / size)))

  watch(totalPages, (pages) => {
    if (page.value > pages) page.value = pages
  })

  const showingFrom = computed(() => (totalItems.value ? (page.value - 1) * size + 1 : 0))
  const showingTo = computed(() => Math.min(page.value * size, totalItems.value))
  const pageRows = computed(() => source().slice((page.value - 1) * size, page.value * size))

  return { page, totalItems, totalPages, showingFrom, showingTo, pageRows }
}