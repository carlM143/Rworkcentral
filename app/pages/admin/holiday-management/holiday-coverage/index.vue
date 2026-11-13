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
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
  UserMinus,
  Users,
  X,
} from 'lucide-vue-next'

interface Location {
  id: number
  location_name: string
  city?: string
}

interface HolidayType {
  id: number
  type_name: string
  type_code?: string
}

interface HolidayDateEntry {
  id: number
  holiday_id: number
  holiday_date: string
}

interface Holiday {
  id: number
  holiday_name: string
  holiday_date: string
  applies_to: 'all_locations' | 'specific_locations' | string
  is_working_day?: boolean
  locations: Location[]
  holiday_type?: HolidayType
  employee_coverage: 'all' | 'except' | 'only'
  covered_employees: { id: number }[]
  holiday_dates?: HolidayDateEntry[]
}

interface Employee {
  id: number
  emp_id: number
  name: string
  department: string | null
  location_id: number | null
  location: string | null
  status: boolean
}

const { $api } = useNuxtApp()
const { success } = useToast()

const currentYear = new Date().getFullYear()
const year = ref(currentYear)
const holidays = ref<Holiday[]>([])
const holidayId = ref<number | null>(null)
const holiday = ref<Holiday | null>(null)
const employees = ref<Employee[]>([])

const mode = ref<'all' | 'except' | 'only'>('all')
const selected = ref<number[]>([])

const search = ref('')
const filterDepartment = ref('all')
const filterStatus = ref('all')
const filterLocation = ref('all')

const loading = ref(false)
const saving = ref(false)
const error = ref('')

const page = ref(1)
const perPage = 8

let listVersion = 0
let detailVersion = 0

// =====================================================
// API CALLS
// =====================================================

const loadHolidays = async () => {
  const current = ++listVersion
  loading.value = true
  error.value = ''
  holiday.value = null
  holidayId.value = null

  try {
    const response = await $api<{ data: { holidays: Holiday[] } }>(
      `/admin/work-calendar/holidays?year=${year.value}`,
    )
    if (current === listVersion) {
      holidays.value = response.data.holidays ?? []
      if (holidays.value.length > 0 && holidays.value[0]) {
        holidayId.value = holidays.value[0].id
      }
    }
  } catch (problem: any) {
    if (current === listVersion) {
      holidays.value = []
      error.value = problem?.data?.message || 'Unable to load holidays.'
    }
  } finally {
    if (current === listVersion) {
      loading.value = false
    }
  }
}

const loadCoverage = async () => {
  const current = ++detailVersion
  holiday.value = null
  employees.value = []
  if (!holidayId.value) return

  loading.value = true
  error.value = ''

  try {
    const response = await $api<{ data: { holiday: Holiday; employees: Employee[] } }>(
      `/admin/work-calendar/holidays/${holidayId.value}/coverage`,
    )
    if (current !== detailVersion) return

    holiday.value = response.data.holiday
    employees.value = response.data.employees ?? []
    mode.value = response.data.holiday.employee_coverage || 'all'
    selected.value = (response.data.holiday.covered_employees ?? []).map(emp => emp.id)
  } catch (problem: any) {
    if (current === detailVersion) {
      error.value = problem?.data?.message || 'Unable to load holiday coverage.'
    }
  } finally {
    if (current === detailVersion) {
      loading.value = false
    }
  }
}

watch(year, loadHolidays)
watch(holidayId, () => {
  page.value = 1
  loadCoverage()
})
onMounted(loadHolidays)

// =====================================================
// HELPER LOGIC & LABELS
// =====================================================

const matchesLocation = (employee: Employee) => {
  if (!holiday.value) return true
  if (holiday.value.applies_to === 'all_locations') return true
  return holiday.value.locations.some(loc => loc.id === employee.location_id)
}

const isEmployeeCovered = (employee: Employee): boolean => {
  const inLoc = matchesLocation(employee)
  if (!inLoc) return false

  const isSelected = selected.value.includes(employee.id)

  if (mode.value === 'all') return true
  if (mode.value === 'except') return !isSelected
  if (mode.value === 'only') return isSelected
  return false
}

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return dateStr.slice(0, 10)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatHolidayDates = (item?: Holiday | null) => {
  if (!item) return '—'
  const dates = item.holiday_dates?.length
    ? item.holiday_dates.map(d => d.holiday_date.slice(0, 10)).sort()
    : [item.holiday_date.slice(0, 10)]
  if (dates.length > 1) {
    return `${formatDate(dates[0])} – ${formatDate(dates[dates.length - 1])} (${dates.length} days)`
  }
  return formatDate(dates[0])
}

// Available filter options
const departmentOptions = computed(() => {
  const set = new Set<string>()
  employees.value.forEach((emp) => {
    if (emp.department) set.add(emp.department)
  })
  return Array.from(set).sort()
})

const locationOptions = computed(() => {
  const set = new Set<string>()
  employees.value.forEach((emp) => {
    if (emp.location) set.add(emp.location)
  })
  return Array.from(set).sort()
})

// Covered / non-covered counts
const totalEmployeesCount = computed(() => employees.value.length)

const coveredEmployeesCount = computed(() => {
  return employees.value.filter(isEmployeeCovered).length
})

const excludedEmployeesCount = computed(() => {
  return totalEmployeesCount.value - coveredEmployeesCount.value
})

// Filtered employee directory
const filteredEmployees = computed(() => {
  const term = search.value.trim().toLowerCase()

  return employees.value.filter((emp) => {
    if (filterDepartment.value !== 'all' && (emp.department || 'No department') !== filterDepartment.value) {
      return false
    }

    if (filterLocation.value !== 'all' && (emp.location || 'No location') !== filterLocation.value) {
      return false
    }

    if (filterStatus.value === 'active' && !emp.status) return false
    if (filterStatus.value === 'inactive' && emp.status) return false
    if (filterStatus.value === 'covered' && !isEmployeeCovered(emp)) return false
    if (filterStatus.value === 'excluded' && isEmployeeCovered(emp)) return false

    if (!term) return true

    const name = String(emp.name ?? '').toLowerCase()
    const id = String(emp.emp_id ?? '')
    const dept = String(emp.department ?? '').toLowerCase()
    const loc = String(emp.location ?? '').toLowerCase()

    return name.includes(term) || id.includes(term) || dept.includes(term) || loc.includes(term)
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

const paginationEnd = computed(() =>
  Math.min(page.value * perPage, filteredEmployees.value.length),
)

watch([search, filterDepartment, filterStatus, filterLocation], () => {
  page.value = 1
})

// =====================================================
// SELECTION ACTIONS
// =====================================================

const isAllVisibleSelected = computed(() => {
  if (visibleEmployees.value.length === 0) return false
  return visibleEmployees.value.every(emp => selected.value.includes(emp.id))
})

const toggleSelectAllVisible = () => {
  if (isAllVisibleSelected.value) {
    const visibleIds = new Set(visibleEmployees.value.map(e => e.id))
    selected.value = selected.value.filter(id => !visibleIds.has(id))
  } else {
    const next = new Set(selected.value)
    visibleEmployees.value.forEach(e => next.add(e.id))
    selected.value = Array.from(next)
  }
}

const selectAllFiltered = () => {
  const next = new Set(selected.value)
  filteredEmployees.value.forEach(e => next.add(e.id))
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
  if (mode.value === 'only' && !selected.value.length) {
    error.value = 'Please select at least one employee for the "Selected Employees Only" option.'
    return
  }

  saving.value = true
  error.value = ''

  try {
    await $api(`/admin/work-calendar/holidays/${holiday.value.id}/coverage`, {
      method: 'PUT',
      body: {
        employee_coverage: mode.value,
        employee_ids: mode.value === 'all' ? [] : selected.value,
      },
    })
    success('Coverage Saved', `Holiday coverage for "${holiday.value.holiday_name}" was successfully updated.`)
    await loadCoverage()
  } catch (problem: any) {
    error.value = String(
      Object.values(problem?.data?.errors ?? {}).flat()[0] ||
      problem?.data?.message ||
      'Unable to save coverage.',
    )
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="cw">
    <div v-if="error" class="cw-error-banner" role="alert">
      {{ error }}
    </div>

    <!-- =================================================
         PAGE HEADER
    ================================================== -->
    <div class="cw-header">
      <div class="cw-header-info">
        <div class="cw-eyebrow">
          <CalendarDays :size="14" />
          <span>WORK CALENDAR / HOLIDAYS</span>
        </div>
        <h1>Holiday Coverage</h1>
        <p>Choose which employees are covered by each holiday across company work locations.</p>
      </div>

      <div class="cw-header-actions">
        <NuxtLink to="/admin/work-calendar" class="cw-btn cw-outline">
          <CalendarDays :size="16" />
          <span>View Holiday Calendar</span>
        </NuxtLink>

        <button
          type="button"
          class="cw-btn cw-primary"
          :disabled="!holiday || saving || loading"
          @click="save"
        >
          <Sparkles :size="16" />
          <span>{{ saving ? 'Saving Changes…' : 'Save Coverage' }}</span>
        </button>
      </div>
    </div>

    <!-- =================================================
         HOLIDAY SELECTOR BANNER
    ================================================== -->
    <div class="cw-selector-bar">
      <div class="cw-selector-group">
        <div class="cw-field-item">
          <label for="cov-year">
            <span>Year</span>
          </label>
          <div class="cw-input-shell">
            <input
              id="cov-year"
              v-model.number.lazy="year"
              type="number"
              min="1900"
              max="9999"
              :disabled="saving"
            />
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
              :disabled="saving || loading"
            >
              <option :value="null" disabled>Select holiday...</option>
              <option
                v-for="item in holidays"
                :key="item.id"
                :value="item.id"
              >
                {{ formatHolidayDates(item) }} — {{ item.holiday_name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Active Holiday Meta -->
      <div v-if="holiday" class="cw-holiday-meta">
        <div class="cw-meta-cell">
          <span class="cw-meta-label">Holiday Date</span>
          <strong class="cw-meta-val">{{ formatHolidayDates(holiday) }}</strong>
        </div>

        <div class="cw-meta-cell">
          <span class="cw-meta-label">Classification</span>
          <strong class="cw-meta-val">{{ holiday.holiday_type?.type_name || 'Standard Holiday' }}</strong>
        </div>

        <div class="cw-meta-cell">
          <span class="cw-meta-label">Work Status</span>
          <span
            class="cw-pill"
            :class="holiday.is_working_day ? 'cw-working' : 'cw-non-working'"
          >
            <span class="cw-status-dot"></span>
            {{ holiday.is_working_day ? 'Working Day' : 'Non-Working' }}
          </span>
        </div>

        <div class="cw-meta-cell cw-meta-locs">
          <span class="cw-meta-label">Work Locations</span>
          <div class="cw-loc-tags">
            <span
              v-if="holiday.applies_to === 'all_locations'"
              class="cw-loc-badge is-all"
            >
              <MapPin :size="12" /> All Locations
            </span>
            <span
              v-for="loc in holiday.locations"
              v-else
              :key="loc.id"
              class="cw-loc-badge"
            >
              <MapPin :size="12" /> {{ loc.location_name }}
            </span>
            <span v-if="holiday.applies_to !== 'all_locations' && !holiday.locations.length" class="cw-empty-txt">
              No location assigned
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- =================================================
         SUMMARY STATS
    ================================================== -->
    <div class="cw-stats">
      <div class="cw-stat">
        <span>Total Employees</span>
        <strong>{{ totalEmployeesCount }}</strong>
        <small>Company employees in database</small>
      </div>

      <div class="cw-stat">
        <span>Covered by Holiday</span>
        <strong class="cw-green-text">{{ coveredEmployeesCount }}</strong>
        <small class="cw-green">
          <CheckCircle2 :size="13" />
          Eligible based on location &amp; rule
        </small>
      </div>

      <div class="cw-stat">
        <span>Excluded / Not Covered</span>
        <strong>{{ excludedEmployeesCount }}</strong>
        <small>Outside location or excluded list</small>
      </div>
    </div>

    <!-- =================================================
         COVERAGE RULES PANEL
    ================================================== -->
    <div class="cw-panel cw-rules-panel">
      <div class="cw-panel-head">
        <div>
          <h2>Employee Coverage Policy</h2>
          <p>
            Choose how this holiday applies to staff. Location rules always apply first — employees outside the holiday's locations are never covered.
          </p>
        </div>
      </div>

      <div class="cw-coverage-modes">
        <label
          class="cw-mode-card"
          :class="{ 'is-selected': mode === 'all' }"
        >
          <input
            v-model="mode"
            type="radio"
            name="coverage_mode"
            value="all"
            :disabled="saving"
          />
          <div class="cw-mode-content">
            <div class="cw-mode-icon">
              <Users :size="18" />
            </div>
            <div>
              <strong>All Employees in Selected Locations</strong>
              <p>Automatically applies holiday coverage to every staff member assigned to the covered locations.</p>
            </div>
          </div>
        </label>

        <label
          class="cw-mode-card"
          :class="{ 'is-selected': mode === 'except' }"
        >
          <input
            v-model="mode"
            type="radio"
            name="coverage_mode"
            value="except"
            :disabled="saving"
          />
          <div class="cw-mode-content">
            <div class="cw-mode-icon is-except">
              <UserMinus :size="18" />
            </div>
            <div>
              <strong>All Employees EXCEPT Selected</strong>
              <p>Applies to everyone in covered locations except the specific employees you check below.</p>
            </div>
          </div>
        </label>

        <label
          class="cw-mode-card"
          :class="{ 'is-selected': mode === 'only' }"
        >
          <input
            v-model="mode"
            type="radio"
            name="coverage_mode"
            value="only"
            :disabled="saving"
          />
          <div class="cw-mode-content">
            <div class="cw-mode-icon is-only">
              <UserCheck :size="18" />
            </div>
            <div>
              <strong>ONLY Selected Employees</strong>
              <p>Restricts holiday coverage exclusively to the specific employees you choose below.</p>
            </div>
          </div>
        </label>
      </div>
    </div>

    <!-- =================================================
         EMPLOYEES DIRECTORY PANEL
    ================================================== -->
    <div class="cw-panel">
      <div class="cw-panel-head">
        <div>
          <h2>Employee Directory &amp; Selection</h2>
          <p>
            <span v-if="mode === 'all'">
              Showing all staff in the company. <strong>{{ coveredEmployeesCount }}</strong> are eligible under the location filter.
            </span>
            <span v-else-if="mode === 'except'">
              Check employees you wish to <strong>exclude</strong> from this holiday.
              <strong>{{ selected.length }}</strong> currently excluded.
            </span>
            <span v-else>
              Check employees you wish to <strong>include exclusively</strong> for this holiday.
              <strong>{{ selected.length }}</strong> currently included.
            </span>
          </p>
        </div>

        <!-- Quick selection helper buttons when mode !== 'all' -->
        <div v-if="mode !== 'all'" class="cw-batch-actions">
          <button
            type="button"
            class="cw-btn-sm cw-outline"
            @click="selectAllFiltered"
          >
            Select All Filtered ({{ filteredEmployees.length }})
          </button>
          <button
            v-if="selected.length > 0"
            type="button"
            class="cw-btn-sm cw-outline"
            @click="clearSelection"
          >
            Clear Selected ({{ selected.length }})
          </button>
        </div>
      </div>

      <!-- SEARCH AND FILTER TOOLBAR -->
      <div class="cw-toolbar">
        <div class="cw-search">
          <Search :size="17" />
          <input
            v-model="search"
            type="text"
            placeholder="Search employee by name, ID, department..."
            aria-label="Search employees"
          />
        </div>

        <div class="cw-filters-group">
          <!-- Department Filter -->
          <div class="cw-filter">
            <Filter :size="15" />
            <select
              v-model="filterDepartment"
              aria-label="Filter by department"
            >
              <option value="all">All Departments</option>
              <option
                v-for="dept in departmentOptions"
                :key="dept"
                :value="dept"
              >
                {{ dept }}
              </option>
            </select>
          </div>

          <!-- Location Filter -->
          <div class="cw-filter">
            <MapPin :size="15" />
            <select
              v-model="filterLocation"
              aria-label="Filter by work location"
            >
              <option value="all">All Locations</option>
              <option
                v-for="loc in locationOptions"
                :key="loc"
                :value="loc"
              >
                {{ loc }}
              </option>
            </select>
          </div>

          <!-- Status / Coverage Filter -->
          <div class="cw-filter">
            <SlidersHorizontal :size="15" />
            <select
              v-model="filterStatus"
              aria-label="Filter by status"
            >
              <option value="all">All Employee Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="covered">Currently Covered</option>
              <option value="excluded">Currently Excluded</option>
            </select>
          </div>
        </div>
      </div>

      <!-- TABLE -->
      <div class="cw-overflow">
        <table class="cw-table">
          <thead>
            <tr>
              <th v-if="mode !== 'all'" scope="col" class="cw-check-col">
                <input
                  type="checkbox"
                  :checked="isAllVisibleSelected"
                  :aria-label="isAllVisibleSelected ? 'Deselect visible employees' : 'Select all visible employees'"
                  @change="toggleSelectAllVisible"
                />
              </th>
              <th scope="col">Employee ID</th>
              <th scope="col">Employee Name</th>
              <th scope="col">Department</th>
              <th scope="col">Work Location</th>
              <th scope="col">Status</th>
              <th scope="col">Coverage Result</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="emp in visibleEmployees"
              :key="emp.id"
              :class="{
                'cw-row-selected': selected.includes(emp.id),
                'cw-row-inactive': !emp.status,
              }"
            >
              <!-- Checkbox (when in except or only mode) -->
              <td v-if="mode !== 'all'" class="cw-check-col">
                <input
                  v-model="selected"
                  type="checkbox"
                  :value="emp.id"
                  :aria-label="`Select ${emp.name}`"
                />
              </td>

              <!-- Employee ID -->
              <td class="cw-id-cell">
                <span class="cw-id-badge">#{{ emp.emp_id }}</span>
              </td>

              <!-- Name -->
              <td class="cw-name-cell">
                <div class="cw-emp-info">
                  <div class="cw-emp-avatar">
                    {{ emp.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <strong class="cw-emp-name">{{ emp.name }}</strong>
                  </div>
                </div>
              </td>

              <!-- Department -->
              <td>
                <span class="cw-cell-value">
                  {{ emp.department || '—' }}
                </span>
              </td>

              <!-- Location -->
              <td>
                <span
                  class="cw-loc-tag"
                  :class="{ 'is-outside': !matchesLocation(emp) }"
                >
                  <MapPin :size="12" />
                  {{ emp.location || 'No Location' }}
                </span>
              </td>

              <!-- Status -->
              <td>
                <span
                  class="cw-pill"
                  :class="emp.status ? 'cw-active' : 'cw-inactive'"
                >
                  <span class="cw-status-dot"></span>
                  {{ emp.status ? 'Active' : 'Inactive' }}
                </span>
              </td>

              <!-- Coverage Status Badge -->
              <td>
                <span
                  v-if="isEmployeeCovered(emp)"
                  class="cw-coverage-badge is-covered"
                >
                  <CheckCircle2 :size="13" />
                  Covered
                </span>
                <span
                  v-else-if="!matchesLocation(emp)"
                  class="cw-coverage-badge is-out-loc"
                  title="Employee location does not match holiday locations"
                >
                  Outside Location
                </span>
                <span
                  v-else-if="mode === 'except' && selected.includes(emp.id)"
                  class="cw-coverage-badge is-excluded"
                >
                  Excluded by Rule
                </span>
                <span
                  v-else
                  class="cw-coverage-badge is-not-selected"
                >
                  Not Included
                </span>
              </td>
            </tr>

            <!-- EMPTY STATE -->
            <tr v-if="visibleEmployees.length === 0">
              <td
                :colspan="mode !== 'all' ? 7 : 6"
                class="cw-empty"
              >
                <div class="cw-empty-box">
                  <Info :size="20" />
                  <p>No employees match your current search or filter criteria.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- =================================================
         NUMBERED PAGINATION
    ================================================== -->
    <div class="cw-pagination">
      <div class="cw-pagination-info">
        Showing
        <strong>{{ paginationStart }}–{{ paginationEnd }}</strong>
        of
        <strong>{{ filteredEmployees.length }}</strong>
        employees
      </div>

      <div class="cw-pagination-controls">
        <button
          type="button"
          class="cw-page-arrow"
          aria-label="Previous page"
          :disabled="page === 1"
          @click="page--"
        >
          <ChevronLeft :size="16" />
        </button>

        <span class="cw-page-indicator">
          Page <strong>{{ page }}</strong> of <strong>{{ totalPages }}</strong>
        </span>

        <button
          type="button"
          class="cw-page-arrow"
          aria-label="Next page"
          :disabled="page === totalPages"
          @click="page++"
        >
          <ChevronRight :size="16" />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* =====================================================
   CONTAINER & HEADER
===================================================== */
.cw {
  width: 100%;
  max-width: 1700px;
  margin: 0 auto;
  color: var(--text-primary, #f1f5f9);
}

.cw-error-banner {
  padding: 12px 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  font-size: 12px;
  font-weight: 550;
}

.cw-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 18px;
  margin-bottom: 22px;
}

.cw-eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 8px;
  color: var(--primary, #246bfd);
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.cw h1 {
  margin: 0 0 6px;
  font-size: 26px;
  font-weight: 750;
  line-height: 1.25;
  color: var(--text-primary, #f8fafc);
}

.cw p {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary, #94a3b8);
}

.cw-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cw-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cw-primary {
  background: var(--primary, #246bfd);
  color: #ffffff;
}

.cw-primary:hover:not(:disabled) {
  background: #1d58d8;
}

.cw-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.cw-outline {
  border-color: var(--border, #1e293b);
  background: var(--bg-card, #0f172a);
  color: var(--text-primary, #f1f5f9);
}

.cw-outline:hover {
  background: var(--bg-card-soft, #1e293b);
}

.cw-btn-sm {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

/* =====================================================
   SELECTOR BAR
===================================================== */
.cw-selector-bar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px 20px;
  margin-bottom: 20px;
  background: var(--bg-card, #0f172a);
  border: 1px solid var(--border, #1e293b);
  border-radius: 12px;
}

.cw-selector-group {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 16px;
}

.cw-field-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cw-field-item label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 650;
  color: var(--text-secondary, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cw-input-shell input,
.cw-input-shell select {
  padding: 10px 14px;
  border: 1px solid var(--border, #1e293b);
  border-radius: 8px;
  background: var(--bg-card-soft, #1e293b);
  color: var(--text-primary, #f1f5f9);
  font-size: 13px;
  outline: none;
  font-family: inherit;
}

.cw-input-shell input:focus,
.cw-input-shell select:focus {
  border-color: var(--primary, #246bfd);
}

.cw-holiday-select {
  flex: 1;
  min-width: 280px;
}

.cw-holiday-select select {
  width: 100%;
}

.cw-holiday-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
  padding-top: 14px;
  border-top: 1px solid var(--border, #1e293b);
}

.cw-meta-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cw-meta-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-secondary, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cw-meta-val {
  font-size: 13px;
  color: var(--text-primary, #f1f5f9);
}

.cw-loc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cw-loc-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 5px;
  font-size: 11px;
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.25);
}

.cw-loc-badge.is-all {
  background: rgba(16, 185, 129, 0.12);
  color: #34d178;
  border-color: rgba(16, 185, 129, 0.25);
}

.cw-empty-txt {
  font-size: 11px;
  color: var(--text-secondary, #94a3b8);
}

/* =====================================================
   SUMMARY CARDS
===================================================== */
.cw-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.cw-stat {
  padding: 18px 20px;
  border: 1px solid var(--border, #1e293b);
  border-radius: 12px;
  background: var(--bg-card, #0f172a);
}

.cw-stat > span {
  display: block;
  color: var(--text-secondary, #94a3b8);
  font-size: 12px;
  font-weight: 550;
}

.cw-stat strong {
  display: block;
  margin: 8px 0 3px;
  font-size: 28px;
  line-height: 1.2;
  font-weight: 750;
  color: var(--text-primary, #f8fafc);
}

.cw-green-text {
  color: #34d399 !important;
}

.cw-stat small {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--text-secondary, #94a3b8);
}

.cw-green {
  color: #34d399;
}

/* =====================================================
   RULES PANEL & CARDS
===================================================== */
.cw-panel {
  border: 1px solid var(--border, #1e293b);
  border-radius: 12px;
  background: var(--bg-card, #0f172a);
  margin-bottom: 20px;
  overflow: hidden;
}

.cw-rules-panel {
  padding: 20px;
}

.cw-coverage-modes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 14px;
}

.cw-mode-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border: 1px solid var(--border, #1e293b);
  border-radius: 10px;
  background: var(--bg-card-soft, #1e293b);
  cursor: pointer;
  transition: all 0.2s ease;
}

.cw-mode-card input[type="radio"] {
  position: absolute;
  top: 16px;
  right: 16px;
  accent-color: var(--primary, #246bfd);
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.cw-mode-card:hover {
  border-color: rgba(36, 107, 253, 0.4);
}

.cw-mode-card.is-selected {
  border-color: var(--primary, #246bfd);
  background: rgba(36, 107, 253, 0.08);
}

.cw-mode-content {
  display: flex;
  gap: 12px;
  padding-right: 28px;
}

.cw-mode-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(36, 107, 253, 0.15);
  color: #60a5fa;
  flex-shrink: 0;
}

.cw-mode-icon.is-except {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.cw-mode-icon.is-only {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

.cw-mode-content strong {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary, #f1f5f9);
  margin-bottom: 4px;
}

.cw-mode-content p {
  font-size: 11px;
  line-height: 1.45;
  color: var(--text-secondary, #94a3b8);
}

/* =====================================================
   PANEL HEADER & TOOLBAR
===================================================== */
.cw-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border, #1e293b);
}

.cw-panel-head h2 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary, #f8fafc);
}

.cw-batch-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cw-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border, #1e293b);
  background: rgba(15, 23, 42, 0.4);
}

.cw-search {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 240px;
}

.cw-search svg {
  position: absolute;
  left: 12px;
  color: var(--text-secondary, #94a3b8);
}

.cw-search input {
  width: 100%;
  padding: 9px 12px 9px 36px;
  border: 1px solid var(--border, #1e293b);
  border-radius: 8px;
  background: var(--bg-card-soft, #1e293b);
  color: var(--text-primary, #f1f5f9);
  font-size: 12px;
  outline: none;
}

.cw-search input:focus {
  border-color: var(--primary, #246bfd);
}

.cw-filters-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.cw-filter {
  position: relative;
  display: flex;
  align-items: center;
}

.cw-filter svg {
  position: absolute;
  left: 10px;
  color: var(--text-secondary, #94a3b8);
  pointer-events: none;
}

.cw-filter select {
  padding: 8px 12px 8px 30px;
  border: 1px solid var(--border, #1e293b);
  border-radius: 8px;
  background: var(--bg-card-soft, #1e293b);
  color: var(--text-primary, #f1f5f9);
  font-size: 12px;
  outline: none;
  cursor: pointer;
}

.cw-filter select:focus {
  border-color: var(--primary, #246bfd);
}

/* =====================================================
   DIRECTORY TABLE
===================================================== */
.cw-overflow {
  width: 100%;
  overflow-x: auto;
}

.cw-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 12px;
}

.cw-table thead tr {
  background: var(--bg-card-soft, #1e293b);
  border-bottom: 1px solid var(--border, #1e293b);
}

.cw-table th {
  padding: 12px 16px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.cw-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border, #1e293b);
  vertical-align: middle;
}

.cw-table tbody tr:hover {
  background: rgba(30, 41, 59, 0.45);
}

.cw-check-col {
  width: 44px;
  text-align: center;
  padding-left: 14px !important;
  padding-right: 8px !important;
}

.cw-check-col input[type="checkbox"] {
  accent-color: var(--primary, #246bfd);
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.cw-id-badge {
  display: inline-block;
  padding: 3px 7px;
  border-radius: 5px;
  font-family: monospace;
  font-size: 11px;
  background: rgba(148, 163, 184, 0.1);
  color: var(--text-secondary, #cbd5e1);
}

.cw-emp-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cw-emp-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(36, 107, 253, 0.2);
  color: #60a5fa;
  font-weight: 700;
  font-size: 11px;
}

.cw-emp-name {
  font-size: 13px;
  color: var(--text-primary, #f8fafc);
}

.cw-loc-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--text-secondary, #cbd5e1);
}

.cw-loc-tag.is-outside {
  color: #94a3b8;
  opacity: 0.7;
}

/* =====================================================
   PILLS & BADGES
===================================================== */
.cw-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 9px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.cw-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.cw-active {
  background: rgba(16, 185, 129, 0.14);
  color: #34d399;
}
.cw-active .cw-status-dot {
  background: #10b981;
}

.cw-inactive {
  background: rgba(148, 163, 184, 0.12);
  color: #94a3b8;
}
.cw-inactive .cw-status-dot {
  background: #64748b;
}

.cw-working {
  background: rgba(245, 158, 11, 0.14);
  color: #fbbf24;
}
.cw-working .cw-status-dot {
  background: #f59e0b;
}

.cw-non-working {
  background: rgba(59, 130, 246, 0.14);
  color: #60a5fa;
}
.cw-non-working .cw-status-dot {
  background: #3b82f6;
}

/* Coverage result pills */
.cw-coverage-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 650;
}

.cw-coverage-badge.is-covered {
  background: rgba(16, 185, 129, 0.14);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.28);
}

.cw-coverage-badge.is-out-loc {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.cw-coverage-badge.is-excluded {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.cw-coverage-badge.is-not-selected {
  background: rgba(148, 163, 184, 0.1);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

/* Row states */
.cw-row-selected {
  background: rgba(36, 107, 253, 0.04);
}

.cw-row-inactive {
  opacity: 0.75;
}

/* Empty state */
.cw-empty {
  padding: 40px !important;
  text-align: center;
}

.cw-empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary, #94a3b8);
}

/* =====================================================
   PAGINATION
===================================================== */
.cw-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  padding: 14px 20px;
  border: 1px solid var(--border, #1e293b);
  border-radius: 12px;
  background: var(--bg-card, #0f172a);
}

.cw-pagination-info {
  font-size: 12px;
  color: var(--text-secondary, #94a3b8);
}

.cw-pagination-info strong {
  color: var(--text-primary, #f1f5f9);
}

.cw-pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cw-page-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border, #1e293b);
  border-radius: 7px;
  background: var(--bg-card-soft, #1e293b);
  color: var(--text-primary, #f1f5f9);
  cursor: pointer;
}

.cw-page-arrow:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cw-page-indicator {
  font-size: 12px;
  color: var(--text-secondary, #94a3b8);
  margin: 0 4px;
}

.cw-page-indicator strong {
  color: var(--text-primary, #f1f5f9);
}

@media (max-width: 960px) {
  .cw-coverage-modes {
    grid-template-columns: 1fr;
  }
  .cw-stats {
    grid-template-columns: 1fr;
  }
}
</style>
