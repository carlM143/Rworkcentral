// Shared helpers for approval export behaviour:
// when at least one filter is active the export contains only the filtered
// records, otherwise it contains every record loaded for the page.

export const hasActiveFilter = (values: Array<string | number | null | undefined>): boolean => {
  return values.some(value => String(value ?? '').trim() !== '')
}

export const resolveExportRecords = <T>(
  allRecords: T[],
  filteredRecords: T[],
  filterActive: boolean,
): T[] => (filterActive ? filteredRecords : allRecords)
