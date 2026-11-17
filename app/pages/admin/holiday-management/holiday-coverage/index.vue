<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Info,
  Layers,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
  Users,
  BriefcaseBusiness,
} from 'lucide-vue-next'

import type {
  CoverageEmployee,
  CoverageMode,
  LoadedCoverage,
} from '~/types/holiday-management/holiday-coverage/holidayCoverage'

const { success } = useToast()
const api = useHolidayCoverage()
const {
  holidays,
  holiday,
  employees,
  locations,
  loadingHolidays,
  loadingCoverage,
  saving,
} = api

const year = ref(new Date().getFullYear())
const holidayId = ref<number | null>(null)

// "all"  = every employee in the holiday's locations is paid
// "only" = only the employees ticked in the table are paid
const mode = ref<CoverageMode>('only')
const selected = ref<number[]>([])
const legacyExcept = ref(false)
const snapshot = ref('')

const search = ref('')
const filterDepartment = ref('all')
const filterStatus = ref('all')
const filterLocation = ref('all')
const filterEmploymentType = ref('all')

const selectedLocationId = ref('all')


// Start on the current month; arrows move to the previous / next month.
const selectedMonth = ref(String(new Date().getMonth() + 1))

const months = [
  { label: 'All Months', value: 'all' },
  { label: 'January', value: '1' },
  { label: 'February', value: '2' },
  { label: 'March', value: '3' },
  { label: 'April', value: '4' },
  { label: 'May', value: '5' },
  { label: 'June', value: '6' },
  { label: 'July', value: '7' },
  { label: 'August', value: '8' },
  { label: 'September', value: '9' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' },
]



const loading = computed(() => loadingHolidays.value || loadingCoverage.value)
const error = ref('')

const page = ref(1)
const perPage = 8

// =====================================================
// STATE HELPERS
// =====================================================



// The ticked employees are the source of truth for every holiday.
// A holiday saved as "all" loads with every in-location employee ticked
// (the API sets `selected` for them), so ticking/unticking must count as a
// change even in "all" mode — otherwise Save Coverage never enables.
const selectedPayableIds = () =>
  employees.value
    .filter(emp => emp.in_location && selected.value.includes(emp.id))
    .map(emp => emp.id)
    .sort((a, b) => a - b)

const currentState = () => JSON.stringify(selectedPayableIds())

// Put the saved coverage of the loaded holiday into the form
const applyCoverage = (data: LoadedCoverage) => {
  mode.value = data.holiday.coverage_mode === 'all' ? 'all' : 'only'

  // Only employees saved in the pivot are selected.
  selected.value = data.employees
    .filter(emp => emp.selected)
    .map(emp => emp.id)

  legacyExcept.value = false
  snapshot.value = currentState()
}

// =====================================================
// API CALLS (see composables/.../useHolidayCoverage.ts)
// =====================================================

const loadCoverage = async () => {
  if (!holidayId.value) {
    api.resetCoverage()
    return
  }

  error.value = ''

  try {
    const data = await api.fetchCoverage(holidayId.value, year.value)
    if (data) applyCoverage(data) // null = a newer request replaced this one
  } catch (problem) {
    error.value = api.getErrorMessage(problem, 'Unable to load holiday coverage.')
  }
}

// =====================================================
// MONTH FILTER
// The API returns every holiday of the year (it ignores `month`),
// so the month is filtered here from each holiday's date.
// =====================================================

const monthOf = (date?: string | null) => Number(String(date ?? '').slice(5, 7))

const monthHolidays = computed(() =>
  selectedMonth.value === 'all'
    ? holidays.value
    : holidays.value.filter(item => monthOf(item.date) === Number(selectedMonth.value)),
)

const selectedMonthLabel = computed(() =>
  months.find(m => m.value === selectedMonth.value)?.label ?? '',
)

const todayKey = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

// Keep the current holiday if it is still listed; otherwise the next
// upcoming one in the list, otherwise the first.
const pickHoliday = () => {
  const list = monthHolidays.value

  if (holidayId.value && list.some(item => item.id === holidayId.value)) return

  const today = todayKey()
  const next = list.find(item => item.date >= today) ?? list[0]
  holidayId.value = next?.id ?? null
}

// Previous / next month; crosses into the previous / next year.
const shiftMonth = (delta: number) => {
  const current = selectedMonth.value === 'all'
    ? new Date().getMonth() + 1
    : Number(selectedMonth.value)

  let month = current + delta
  let nextYear = year.value

  if (month < 1) {
    month = 12
    nextYear--
  } else if (month > 12) {
    month = 1
    nextYear++
  }

  selectedMonth.value = String(month)
  year.value = nextYear
}

const loadHolidays = async () => {
  error.value = ''

  try {
    const list = await api.fetchHolidays(
      year.value,
      selectedLocationId.value,
      selectedMonth.value
    )
    if (!list) return

    const previousId = holidayId.value
    pickHoliday()

    // Same holiday still selected: the holidayId watcher won't fire, so refresh it here.
    if (holidayId.value && holidayId.value === previousId) await loadCoverage()
  } catch (problem) {
    holidayId.value = null
    error.value = api.getErrorMessage(
      problem,
      'Unable to load holidays.'
    )
  }
}

// Year / location change the list from the API; a month change only filters it.
// (shiftMonth can change month and year together, so both are watched as one.)
watch(
  [year, selectedLocationId, selectedMonth],
  ([newYear, newLocation], [oldYear, oldLocation]) => {
    page.value = 1

    if (newYear !== oldYear || newLocation !== oldLocation) {
      holidayId.value = null
      void loadHolidays()
      return
    }

    pickHoliday()
  }
)

watch(holidayId, () => {
  page.value = 1
  void loadCoverage()
})
onMounted(loadHolidays)

// =====================================================
// HELPER LOGIC & LABELS
// =====================================================

const selectedSet = computed(() => new Set(selected.value))

// Payable = inside the holiday's locations AND ticked in the table
// (for an "all" holiday every in-location employee starts ticked)
const isPayable = (employee: CoverageEmployee): boolean =>
  employee.in_location && selectedSet.value.has(employee.id)

const isDirty = computed(() => !!holiday.value && currentState() !== snapshot.value)

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value.slice(0, 10)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const departmentOptions = computed(() =>
  Array.from(new Set(employees.value.map(emp => emp.department).filter(Boolean) as string[])).sort(),
)

const locationOptions = computed(() =>
  Array.from(new Set(employees.value.map(emp => emp.location).filter(Boolean) as string[])).sort(),
)

const employmentTypeOptions = computed(() => {
  return [
    ...new Set(
      employees.value
        .map(emp => emp.employment_type?.trim())
        .filter((type): type is string => Boolean(type))
    ),
  ].sort((a, b) => a.localeCompare(b))
})

const totalEmployeesCount = computed(() => employees.value.length)
const payableCount = computed(() => employees.value.filter(isPayable).length)
const notPayableCount = computed(() => totalEmployeesCount.value - payableCount.value)

const filteredEmployees = computed(() => {
  const term = search.value.trim().toLowerCase()

  return employees.value.filter((emp) => {
    if (filterDepartment.value !== 'all' && emp.department !== filterDepartment.value) return false
    if (filterLocation.value !== 'all' && emp.location !== filterLocation.value) return false
    if (
  filterEmploymentType.value !== 'all' && emp.employment_type !== filterEmploymentType.value) {return false}

    if (filterStatus.value === 'active' && !emp.status) return false
    if (filterStatus.value === 'inactive' && emp.status) return false
    if (filterStatus.value === 'payable' && !isPayable(emp)) return false
    if (filterStatus.value === 'not_payable' && isPayable(emp)) return false

    if (!term) return true

    return `${emp.name ?? ''} ${emp.emp_id ?? ''} ${emp.department ?? ''} ${emp.location ?? ''}`
      .toLowerCase()
      .includes(term)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredEmployees.value.length / perPage)))

const visibleEmployees = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredEmployees.value.slice(start, start + perPage)
})

const paginationStart = computed(() =>
  filteredEmployees.value.length === 0 ? 0 : (page.value - 1) * perPage + 1,
)

const paginationEnd = computed(() => Math.min(page.value * perPage, filteredEmployees.value.length))

watch(
  [
    search,
    filterDepartment,
    filterStatus,
    filterLocation,
    filterEmploymentType,
  ],
  () => {
    page.value = 1
  }
)

// =====================================================
// SELECTION ACTIONS
// =====================================================

// Employees outside the holiday's locations are never payable, so they can't be ticked.
const selectableVisible = computed(() => visibleEmployees.value.filter(emp => emp.in_location))
const selectableFiltered = computed(() => filteredEmployees.value.filter(emp => emp.in_location))

const isAllVisibleSelected = computed(() =>
  selectableVisible.value.length > 0
  && selectableVisible.value.every(emp => selectedSet.value.has(emp.id)),
)

const toggleSelectAllVisible = () => {
  if (isAllVisibleSelected.value) {
    const visibleIds = new Set(selectableVisible.value.map(e => e.id))
    selected.value = selected.value.filter(id => !visibleIds.has(id))
  } else {
    const next = new Set(selected.value)
    selectableVisible.value.forEach(e => next.add(e.id))
    selected.value = Array.from(next)
  }
}

const selectAllFiltered = () => {
  const next = new Set(selected.value)
  selectableFiltered.value.forEach(e => next.add(e.id))
  selected.value = Array.from(next)
}

const clearSelection = () => {
  selected.value = []
}

// =====================================================
// SAVE COVERAGE
// =====================================================

const save = async () => {
  if (!holiday.value) return

  // Only employees inside the holiday's locations can be paid
  const ids = selectedPayableIds()

  if (!ids.length) {
    error.value = 'Select at least one employee to receive holiday pay.'
    return
  }

  // Keep "all" only if the holiday was "all" and every in-location employee
  // is still ticked; any other selection is saved as an explicit list.
  const inLocationCount = employees.value.filter(emp => emp.in_location).length
  const coverage: CoverageMode = mode.value === 'all' && ids.length === inLocationCount ? 'all' : 'only'

  const target = holiday.value
  error.value = ''

  try {
    const response = await api.saveCoverage(target.id, year.value, {
      employee_coverage: coverage,
      employee_ids: coverage === 'all' ? [] : ids,
    })

    // The server returns the saved coverage, so no second request is needed
    holiday.value = response.data.holiday
    employees.value = response.data.employees ?? []
    applyCoverage(response.data)

    success('Coverage Saved', `Holiday coverage for "${target.holiday_name}" was successfully updated.`)
  } catch (problem) {
    error.value = api.getErrorMessage(problem, 'Unable to save coverage.')
  }
}
</script>

<template>
  <section class="cw">
    <div v-if="error" class="cw-error-banner" role="alert">
      {{ error }}
    </div>

    <!-- PAGE HEADER -->
    <div class="cw-header">
      <div class="cw-header-info">
        <div class="cw-eyebrow">
          <CalendarDays :size="14" />
          <span>HOLIDAY MANAGEMENT / COVERAGE</span>
        </div>
        <h1>Holiday Coverage</h1>
        <p>Choose which employees are paid for each holiday across company work locations.</p>
      </div>

      <div class="cw-header-actions">
        <NuxtLink to="/admin/holiday-management/holiday" class="cw-btn cw-outline">
          <CalendarDays :size="16" />
          <span>View Holiday Calendar</span>
        </NuxtLink>

        <button
          type="button"
          class="cw-btn cw-primary"
          :disabled="!holiday || saving || loading || !isDirty"
          @click="save"
        >
          <Sparkles :size="16" />
          <span>{{ saving ? 'Saving Changes…' : 'Save Coverage' }}</span>
        </button>
      </div>
    </div>

    <!-- HOLIDAY SELECTOR -->
    <div class="cw-selector-bar">
      <!-- LOCATION FILTER -->
        <div class="cw-field-item">
          <label for="cov-location">
            <MapPin :size="13" />
            <span>Work Location</span>
          </label>

          <div class="cw-input-shell">
            <select
              id="cov-location"
              v-model="selectedLocationId"
              :disabled="saving || loadingHolidays"
            >
              <option value="all">All Locations</option>

              <option
                v-for="location in locations"
                :key="location.id"
                :value="String(location.id)"
              >
                {{ location.location_name }}
              </option>
            </select>
          </div>
        </div>
      

        <div class="cw-field-item">
          <label for="cov-year"><span>Year</span></label>
          <div class="cw-input-shell">
            <input
              id="cov-year"
              v-model.number.lazy="year"
              type="number"
              min="1900"
              max="9999"
              :disabled="saving"
            >
          </div>
        </div>

        <!-- MONTH FILTER -->
        <div class="cw-field-item cw-month-select">
          <label for="cov-month">
            <span>Month</span>
          </label>

          <div class="cw-month-nav">
            <button
              type="button"
              class="cw-month-arrow"
              aria-label="Previous month"
              :disabled="saving || loadingHolidays"
              @click="shiftMonth(-1)"
            >
              <ChevronLeft :size="16" />
            </button>

            <div class="cw-input-shell">
              <select
                id="cov-month"
                v-model="selectedMonth"
                :disabled="saving || loadingHolidays"
              >
                <option
                  v-for="month in months"
                  :key="month.value"
                  :value="month.value"
                >
                  {{ month.label }}
                </option>
              </select>
            </div>

            <button
              type="button"
              class="cw-month-arrow"
              aria-label="Next month"
              :disabled="saving || loadingHolidays"
              @click="shiftMonth(1)"
            >
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>

        <div class="cw-field-item cw-holiday-select">
          <label for="cov-holiday">
            <Layers :size="13" />
            <span>Select Holiday</span>
          </label>
          <div class="cw-input-shell">
            <select
              id="cov-holiday"
              v-model="holidayId"
              :disabled="saving || loadingHolidays || !monthHolidays.length"
            >
              <option :value="null" disabled>
                {{
                  loadingHolidays
                    ? 'Loading holidays…'
                    : monthHolidays.length
                      ? 'Select holiday...'
                      : `No holidays in ${selectedMonth === 'all' ? '' : `${selectedMonthLabel} `}${year}`
                }}
              </option>
              <option v-for="item in monthHolidays" :key="item.id" :value="item.id">
                {{ formatDate(item.date) }} — {{ item.holiday_name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Selected holiday details -->
      <div v-if="holiday" class="cw-holiday-meta">
        <div class="cw-meta-cell">
          <span class="cw-meta-label">Holiday Date</span>
          <strong class="cw-meta-val">{{ formatDate(holiday.date) }}</strong>
        </div>

        <div class="cw-meta-cell">
          <span class="cw-meta-label">Classification</span>
          <strong class="cw-meta-val">{{ holiday.type || '—' }}</strong>
        </div>

        <div class="cw-meta-cell cw-meta-locs">
          <span class="cw-meta-label">Work Locations</span>
          <div class="cw-loc-tags">
            <span v-if="!holiday.locations.length" class="cw-loc-badge is-all">
              <MapPin :size="12" /> All Locations
            </span>

            <span v-for="name in holiday.locations" v-else :key="name" class="cw-loc-badge">
              <MapPin :size="12" /> {{ name }}
            </span>
          </div>
        </div>
      </div>

      <p v-else-if="loadingCoverage" class="cw-empty-txt">
        Loading holiday coverage…
      </p>

    <!-- SUMMARY -->
    <div class="cw-stats">
      <div class="cw-stat">
        <span>Total Employees</span>
        <strong>{{ totalEmployeesCount }}</strong>
        <small>Company employees in database</small>
      </div>

      <div class="cw-stat">
        <span>Payable for This Holiday</span>
        <strong class="cw-green-text">{{ payableCount }}</strong>
        <small class="cw-green">
          <CheckCircle2 :size="13" />
          Inside the holiday's locations &amp; included
        </small>
      </div>

      <div class="cw-stat">
        <span>Not Payable</span>
        <strong>{{ notPayableCount }}</strong>
        <small>Outside location or not selected</small>
      </div>
    </div>

    <!-- COVERAGE MODE -->
    <div class="cw-panel cw-rules-panel">
      <div class="cw-panel-head">
        <div>
          <h2>Who Gets Holiday Pay</h2>
          <p>Location rules always apply first — employees outside the holiday's locations are never paid.</p>
        </div>
      </div>

      <div class="cw-coverage-modes">
        <div class="cw-mode-card is-selected">
          <div class="cw-mode-content">
            <div class="cw-mode-icon is-only">
              <UserCheck :size="18" />
            </div>

            <div>
              <strong>Manual Employee Selection</strong>
              <p>
                Only employees you select in the table below will be eligible
                for this holiday's pay. Employees are not selected automatically.
              </p>
            </div>
          </div>
        </div>
      </div>

      <p v-if="legacyExcept" class="cw-legacy-note">
        This holiday used the old "all employees except selected" setting. It is shown here as the same list of paid employees — click Save Coverage to keep it in the new format.
      </p>
    </div>

    <!-- EMPLOYEES -->
    <div class="cw-panel">
      <div class="cw-panel-head">
        <div>
          <h2>Employee Directory &amp; Selection</h2>
          <p>
            Tick the employees to include in holiday pay. <strong>{{ payableCount }}</strong> payable so far.
            <span v-if="mode === 'all' && !isDirty">(Currently everyone in the holiday's locations.)</span>
          </p>
        </div>

        <div class="cw-batch-actions">
          <button type="button" class="cw-btn-sm cw-outline" @click="selectAllFiltered">
            Select All Filtered ({{ selectableFiltered.length }})
          </button>
          <button v-if="selected.length > 0" type="button" class="cw-btn-sm cw-outline" @click="clearSelection">
            Clear Selected ({{ selected.length }})
          </button>
        </div>
      </div>

      <div class="cw-toolbar">
        <div class="cw-search">
          <Search :size="17" />
          <input
            v-model="search"
            type="text"
            placeholder="Search employee by name, ID, department..."
            aria-label="Search employees"
          >
        </div>

        <div class="cw-filters-group">
          <div class="cw-filter">
            <Filter :size="15" />
            <select v-model="filterDepartment" aria-label="Filter by department">
              <option value="all">All Departments</option>
              <option v-for="dept in departmentOptions" :key="dept" :value="dept">{{ dept }}</option>
            </select>
          </div>

          <div class="cw-filter">
            <BriefcaseBusiness :size="15" />

            <select
              v-model="filterEmploymentType"
              aria-label="Filter by employment type"
            >
              <option value="all">All Employment Types</option>

              <option
                v-for="type in employmentTypeOptions"
                :key="type"
                :value="type"
              >
                {{ type }}
              </option>
            </select>
          </div>

          <div class="cw-filter">
            <MapPin :size="15" />
            <select v-model="filterLocation" aria-label="Filter by work location">
              <option value="all">All Locations</option>
              <option v-for="loc in locationOptions" :key="loc" :value="loc">{{ loc }}</option>
            </select>
          </div>

          <div class="cw-filter">
            <SlidersHorizontal :size="15" />
            <select v-model="filterStatus" aria-label="Filter by status">
              <option value="all">All Employee Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="payable">Payable</option>
              <option value="not_payable">Not Payable</option>
            </select>
          </div>

        </div>
      </div>

      <div class="cw-overflow">
        <table class="cw-table">
          <thead>
            <tr>
              <th scope="col" class="cw-check-col">
                <input
                  type="checkbox"
                  :checked="isAllVisibleSelected"
                  :aria-label="isAllVisibleSelected ? 'Deselect visible employees' : 'Select all visible employees'"
                  @change="toggleSelectAllVisible"
                >
              </th>
              <th scope="col">Employee Name</th>
              <th scope="col">Department</th>
              <th scope="col">Employment Type</th>
              <th scope="col">Work Location</th>
              <th scope="col">Status</th>
              <th scope="col">Holiday Pay</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="emp in visibleEmployees"
              :key="emp.id"
              :class="{ 'cw-row-selected': selectedSet.has(emp.id), 'cw-row-inactive': !emp.status }"
            >
              <td class="cw-check-col">
                <input
                  v-model="selected"
                  type="checkbox"
                  :value="emp.id"
                  :disabled="!emp.in_location && !selectedSet.has(emp.id)"
                  :aria-label="`Select ${emp.name}`"
                >
              </td>


              <td>
                <div class="cw-emp-info">
                  <strong class="cw-emp-name">{{ emp.name }}</strong>
                </div>
              </td>

              <td>{{ emp.department || '—' }}</td>

              <td>{{ emp.employment_type || '—' }}</td>
              

              <td>
                <span class="cw-loc-tag" :class="{ 'is-outside': !emp.in_location }">
                  <MapPin :size="12" />
                  {{ emp.location || 'No Location' }}
                </span>
              </td>

              <td>
                <span class="cw-pill" :class="emp.status ? 'cw-active' : 'cw-inactive'">
                  <span class="cw-status-dot"></span>
                  {{ emp.status ? 'Active' : 'Inactive' }}
                </span>
              </td>

              <td>
                <span v-if="isPayable(emp)" class="cw-coverage-badge is-covered">
                  <CheckCircle2 :size="13" />
                  Payable
                </span>
                <span
                  v-else-if="!emp.in_location"
                  class="cw-coverage-badge is-out-loc"
                  title="Employee location does not match the holiday's locations"
                >
                  Outside Location
                </span>
                <span v-else class="cw-coverage-badge is-not-selected">Not Payable</span>
              </td>
            </tr>

            <tr v-if="visibleEmployees.length === 0">
              <td :colspan="mode !== 'all' ? 8 : 7" class="cw-empty">
                <div class="cw-empty-box">
                  <Info :size="20" />
                  <p v-if="loading">Loading employees…</p>
                  <p v-else-if="!holiday">Select a holiday to see its employees.</p>
                  <p v-else>No employees match your current search or filter criteria.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- PAGINATION -->
    <div class="cw-pagination">
      <div class="cw-pagination-info">
        Showing <strong>{{ paginationStart }}–{{ paginationEnd }}</strong> of
        <strong>{{ filteredEmployees.length }}</strong> employees
      </div>

      <div class="cw-pagination-controls">
        <button type="button" class="cw-page-arrow" aria-label="Previous page" :disabled="page === 1" @click="page--">
          <ChevronLeft :size="16" />
        </button>

        <span class="cw-page-indicator">
          Page <strong>{{ page }}</strong> of <strong>{{ totalPages }}</strong>
        </span>

        <button type="button" class="cw-page-arrow" aria-label="Next page" :disabled="page === totalPages" @click="page++">
          <ChevronRight :size="16" />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cw { width: 100%; max-width: 1700px; margin: 0 auto; color: var(--text-primary, #f1f5f9); }

.cw-error-banner { padding: 12px 16px; margin-bottom: 16px; border: 1px solid rgba(239, 68, 68, .4); border-radius: 8px; background: rgba(239, 68, 68, .12); color: #ef4444; font-size: 12px; font-weight: 550; }

.cw-header { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 18px; margin-bottom: 22px; }
.cw-eyebrow { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; color: var(--primary, #246bfd); font-size: 11px; font-weight: 750; letter-spacing: .8px; text-transform: uppercase; }
.cw h1 { margin: 0 0 6px; color: var(--text-primary, #f8fafc); font-size: 26px; font-weight: 750; line-height: 1.25; }
.cw p { margin: 0; color: var(--text-secondary, #94a3b8); font-size: 13px; }
.cw-header-actions { display: flex; align-items: center; gap: 10px; }

.cw-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 16px; border: 1px solid transparent; border-radius: 8px; font-size: 12px; font-weight: 650; white-space: nowrap; text-decoration: none; cursor: pointer; transition: all .15s ease; }
.cw-primary { background: var(--primary, #246bfd); color: #ffffff; }
.cw-primary:hover:not(:disabled) { background: #1d58d8; }
.cw-primary:disabled { opacity: .55; cursor: not-allowed; }
.cw-outline { border-color: var(--border, #1e293b); background: var(--bg-card, #0f172a); color: var(--text-primary, #f1f5f9); }
.cw-outline:hover { background: var(--bg-card-soft, #1e293b); }
.cw-btn-sm { padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; }

.cw-selector-bar {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: flex-end;
  gap: 16px;
  padding: 18px 20px;
  margin-bottom: 20px;
  border: 1px solid var(--border, #1e293b);
  border-radius: 12px;
  background: var(--bg-card, #0f172a);
}

.cw-field-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.cw-holiday-select {
  flex: 1;
  min-width: 280px;
}

.cw-holiday-select select {
  width: 100%;
}

.cw-selector-group { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px; }
.cw-field-item { display: flex; flex-direction: column; gap: 6px; }
.cw-field-item label { display: flex; align-items: center; gap: 6px; color: var(--text-secondary, #94a3b8); font-size: 11px; font-weight: 650; letter-spacing: .5px; text-transform: uppercase; }
.cw-input-shell input,
.cw-input-shell select { padding: 10px 14px; border: 1px solid var(--border, #1e293b); border-radius: 8px; outline: none; background: var(--bg-card-soft, #1e293b); color: var(--text-primary, #f1f5f9); font-family: inherit; font-size: 13px; color-scheme: light dark; }
.cw-input-shell select { cursor: pointer; }
.cw-input-shell select:disabled { opacity: .6; cursor: not-allowed; }
.cw-input-shell select option { background-color: var(--bg-card, #0f172a); color: var(--text-primary, #f1f5f9); }
.cw-input-shell input:focus,
.cw-input-shell select:focus { border-color: var(--primary, #246bfd); }
.cw-holiday-select { flex: 1; min-width: 280px; }
.cw-holiday-select select { width: 100%; }

.cw-holiday-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 28px; padding-top: 14px; border-top: 1px solid var(--border, #1e293b); }
.cw-meta-cell { display: flex; flex-direction: column; gap: 4px; }
.cw-meta-label { color: var(--text-secondary, #94a3b8); font-size: 10px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; }
.cw-meta-val { color: var(--text-primary, #f1f5f9); font-size: 13px; }
.cw-loc-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.cw-loc-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; border: 1px solid rgba(59, 130, 246, .25); border-radius: 5px; background: rgba(59, 130, 246, .12); color: #60a5fa; font-size: 11px; }
.cw-loc-badge.is-all { border-color: rgba(16, 185, 129, .25); background: rgba(16, 185, 129, .12); color: #34d178; }
.cw-empty-txt { color: var(--text-secondary, #94a3b8); font-size: 11px !important; }

.cw-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-bottom: 20px; }
.cw-stat { padding: 18px 20px; border: 1px solid var(--border, #1e293b); border-radius: 12px; background: var(--bg-card, #0f172a); }
.cw-stat > span { display: block; color: var(--text-secondary, #94a3b8); font-size: 12px; font-weight: 550; }
.cw-stat strong { display: block; margin: 8px 0 3px; color: var(--text-primary, #f8fafc); font-size: 28px; font-weight: 750; line-height: 1.2; }
.cw-green-text { color: #34d399 !important; }
.cw-stat small { display: flex; align-items: center; gap: 5px; color: var(--text-secondary, #94a3b8); font-size: 11px; }
.cw-green { color: #34d399 !important; }

.cw-panel { margin-bottom: 20px; overflow: hidden; border: 1px solid var(--border, #1e293b); border-radius: 12px; background: var(--bg-card, #0f172a); }
.cw-rules-panel { padding: 20px; }
.cw-coverage-modes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-top: 14px; }
.cw-mode-card { position: relative; display: flex; align-items: flex-start; padding: 16px; border: 1px solid var(--border, #1e293b); border-radius: 10px; background: var(--bg-card-soft, #1e293b); cursor: pointer; transition: all .2s ease; }
.cw-mode-card input[type="radio"] { position: absolute; top: 16px; right: 16px; width: 16px; height: 16px; accent-color: var(--primary, #246bfd); cursor: pointer; }
.cw-mode-card:hover { border-color: rgba(36, 107, 253, .4); }
.cw-mode-card.is-selected { border-color: var(--primary, #246bfd); background: rgba(36, 107, 253, .08); }
.cw-mode-content { display: flex; gap: 12px; padding-right: 28px; }
.cw-mode-icon { display: flex; width: 36px; height: 36px; flex-shrink: 0; align-items: center; justify-content: center; border-radius: 8px; background: rgba(36, 107, 253, .15); color: #60a5fa; }
.cw-mode-icon.is-only { background: rgba(16, 185, 129, .15); color: #34d399; }
.cw-mode-content strong { display: block; margin-bottom: 4px; color: var(--text-primary, #f1f5f9); font-size: 13px; font-weight: 700; }
.cw-mode-content p { color: var(--text-secondary, #94a3b8); font-size: 11px; line-height: 1.45; }
.cw-legacy-note { margin-top: 14px !important; padding: 10px 12px; border: 1px solid rgba(245, 158, 11, .3); border-radius: 8px; background: rgba(245, 158, 11, .1); color: #fbbf24 !important; font-size: 12px !important; line-height: 1.5; }

.cw-panel-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px; padding: 18px 20px; border-bottom: 1px solid var(--border, #1e293b); }
.cw-panel-head h2 { margin: 0 0 4px; color: var(--text-primary, #f8fafc); font-size: 16px; font-weight: 700; }
.cw-batch-actions { display: flex; align-items: center; gap: 8px; }

.cw-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 20px; border-bottom: 1px solid var(--border, #1e293b); }
.cw-search { position: relative; display: flex; flex: 1; align-items: center; min-width: 240px; }
.cw-search svg { position: absolute; left: 12px; color: var(--text-secondary, #94a3b8); }
.cw-search input { width: 100%; padding: 9px 12px 9px 36px; border: 1px solid var(--border, #1e293b); border-radius: 8px; outline: none; background: var(--bg-card-soft, #1e293b); color: var(--text-primary, #f1f5f9); font-size: 12px; }
.cw-search input:focus { border-color: var(--primary, #246bfd); }
.cw-filters-group { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.cw-filter { position: relative; display: flex; align-items: center; }
.cw-filter svg { position: absolute; left: 10px; color: var(--text-secondary, #94a3b8); pointer-events: none; }
.cw-filter select { padding: 8px 12px 8px 30px; border: 1px solid var(--border, #1e293b); border-radius: 8px; outline: none; background: var(--bg-card-soft, #1e293b); color: var(--text-primary, #f1f5f9); font-size: 12px; cursor: pointer; color-scheme: light dark; }
.cw-filter select option { background-color: var(--bg-card, #0f172a); color: var(--text-primary, #f1f5f9); }
.cw-filter select:focus { border-color: var(--primary, #246bfd); }

.cw-overflow { width: 100%; overflow-x: auto; }
.cw-table { width: 100%; border-collapse: collapse; font-size: 12px; text-align: left; }
.cw-table thead tr { border-bottom: 1px solid var(--border, #1e293b); background: var(--bg-card-soft, #1e293b); }
.cw-table th { padding: 12px 16px; color: var(--text-secondary, #94a3b8); font-size: 11px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; white-space: nowrap; }
.cw-table td { padding: 14px 16px; border-bottom: 1px solid var(--border, #1e293b); vertical-align: middle; }
.cw-table tbody tr:hover { background: rgba(30, 41, 59, .45); }
.cw-check-col { width: 44px; padding-right: 8px !important; padding-left: 14px !important; text-align: center; }
.cw-check-col input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--primary, #246bfd); cursor: pointer; }
.cw-check-col input[type="checkbox"]:disabled { opacity: .35; cursor: not-allowed; }

.cw-id-badge { display: inline-block; padding: 3px 7px; border-radius: 5px; background: rgba(148, 163, 184, .1); color: var(--text-secondary, #cbd5e1); font-family: monospace; font-size: 11px; }
.cw-emp-info { display: flex; align-items: center; gap: 10px; }
.cw-emp-avatar { display: flex; width: 28px; height: 28px; align-items: center; justify-content: center; border-radius: 50%; background: rgba(36, 107, 253, .2); color: #60a5fa; font-size: 11px; font-weight: 700; }
.cw-emp-name { color: var(--text-primary, #f8fafc); font-size: 13px; }
.cw-loc-tag { display: inline-flex; align-items: center; gap: 5px; color: var(--text-secondary, #cbd5e1); font-size: 12px; }
.cw-loc-tag.is-outside { color: #94a3b8; opacity: .7; }

.cw-pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 9px; border-radius: 6px; font-size: 11px; font-weight: 600; }
.cw-status-dot { width: 6px; height: 6px; border-radius: 50%; }
.cw-active { background: rgba(16, 185, 129, .14); color: #34d399; }
.cw-active .cw-status-dot { background: #10b981; }
.cw-inactive { background: rgba(148, 163, 184, .12); color: #94a3b8; }
.cw-inactive .cw-status-dot { background: #64748b; }

.cw-coverage-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 650; }
.cw-coverage-badge.is-covered { border: 1px solid rgba(16, 185, 129, .28); background: rgba(16, 185, 129, .14); color: #34d399; }
.cw-coverage-badge.is-out-loc { border: 1px solid rgba(239, 68, 68, .25); background: rgba(239, 68, 68, .12); color: #f87171; }
.cw-coverage-badge.is-not-selected { border: 1px solid rgba(148, 163, 184, .2); background: rgba(148, 163, 184, .1); color: #94a3b8; }

.cw-row-selected { background: rgba(36, 107, 253, .04); }
.cw-row-inactive { opacity: .75; }
.cw-empty { padding: 40px !important; text-align: center; }
.cw-empty-box { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--text-secondary, #94a3b8); }

.cw-pagination { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px; padding: 14px 20px; border: 1px solid var(--border, #1e293b); border-radius: 12px; background: var(--bg-card, #0f172a); }
.cw-pagination-info { color: var(--text-secondary, #94a3b8); font-size: 12px; }
.cw-pagination-info strong { color: var(--text-primary, #f1f5f9); }
.cw-pagination-controls { display: flex; align-items: center; gap: 8px; }
.cw-page-arrow { display: flex; width: 32px; height: 32px; align-items: center; justify-content: center; border: 1px solid var(--border, #1e293b); border-radius: 7px; background: var(--bg-card-soft, #1e293b); color: var(--text-primary, #f1f5f9); cursor: pointer; }
.cw-page-arrow:disabled { opacity: .4; cursor: not-allowed; }
.cw-page-indicator { margin: 0 4px; color: var(--text-secondary, #94a3b8); font-size: 12px; }
.cw-page-indicator strong { color: var(--text-primary, #f1f5f9); }


.cw-month-select {
  width: 215px;
  min-width: 215px;
  flex-shrink: 0;
}

.cw-month-nav {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cw-month-nav .cw-input-shell {
  flex: 1;
  min-width: 0;
}

.cw-month-select .cw-input-shell select {
  width: 100%;
}

.cw-month-arrow {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 34px;
  height: 40px;
  border: 1px solid var(--border, #1e293b);
  border-radius: 8px;
  background: var(--bg-card-soft, #1e293b);
  color: var(--text-secondary, #94a3b8);
  cursor: pointer;
}

.cw-month-arrow:hover:not(:disabled) {
  border-color: var(--primary, #2563eb);
  color: var(--primary, #2563eb);
}

.cw-month-arrow:disabled {
  opacity: .5;
  cursor: not-allowed;
}

@media (max-width: 960px) {
  .cw-coverage-modes,
  .cw-stats { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .cw-selector-bar {
    flex-wrap: wrap;
  }

  .cw-holiday-select {
    flex-basis: 100%;
  }
}
</style>