<!-- app/pages/admin/payroll/payroll-group/assign-employee/create.vue -->
<script setup lang="ts">
import {
  ArrowLeft,
  Search,
  UserPlus,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X,
  Undo2,
} from 'lucide-vue-next'

import type {
  AssignableEmployee,
  FilterDepartment,
  FilterLocation,
  BulkAssignResult,
} from '~/composables/admin/payroll/payroll-group/usePayrollGroup'

const LIST_ROUTE = '/admin/payroll/payroll-group'

const route = useRoute()
const groupApi = usePayrollGroup()

const { groups, saving } = groupApi

const manilaToday = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date())

const groupId = ref<number | null>(
  route.query.group ? Number(route.query.group) : null,
)
const effectiveFrom = ref(manilaToday())

const departments = ref<FilterDepartment[]>([])
const locations = ref<FilterLocation[]>([])

const search = ref('')
const departmentId = ref<number | null>(null)
const locationId = ref<number | null>(null)

const employees = ref<AssignableEmployee[]>([])
const loadingEmployees = ref(false)

const selectedIds = ref<Set<number>>(new Set())

const errorMessage = ref('')
const resultMessage = ref('')
const result = ref<BulkAssignResult | null>(null)

const activeGroups = computed(() => groups.value.filter(g => g.is_active))

const selectedGroup = computed(() =>
  groups.value.find(g => g.id === groupId.value) ?? null,
)

const frequencyLabel = (value?: string) => ({
  weekly: 'Weekly',
  bi_weekly: 'Bi-weekly',
  semi_monthly: 'Semi-monthly',
  monthly: 'Monthly',
}[value ?? ''] ?? value ?? '')

const departmentLabel = (d?: FilterDepartment | null) =>
  d ? String(d.department_name ?? d.name ?? `Department #${d.id}`) : '—'

const currentAssignment = (e: AssignableEmployee) =>
  e.payroll_group_assignments?.[0] ?? null

const isInSelectedGroup = (e: AssignableEmployee) =>
  !!groupId.value && currentAssignment(e)?.payroll_group_id === groupId.value

const selectableEmployees = computed(() =>
  employees.value.filter(e => !isInSelectedGroup(e)),
)

const allVisibleSelected = computed(() =>
  selectableEmployees.value.length > 0
  && selectableEmployees.value.every(e => selectedIds.value.has(e.id)),
)

const someVisibleSelected = computed(() =>
  selectableEmployees.value.some(e => selectedIds.value.has(e.id)),
)

const toggleEmployee = (id: number) => {
  const next = new Set(selectedIds.value)
  next.has(id) ? next.delete(id) : next.add(id)
  selectedIds.value = next
}

const toggleAllVisible = () => {
  const next = new Set(selectedIds.value)

  if (allVisibleSelected.value) {
    selectableEmployees.value.forEach(e => next.delete(e.id))
  } else {
    selectableEmployees.value.forEach(e => next.add(e.id))
  }

  selectedIds.value = next
}

const clearSelection = () => {
  selectedIds.value = new Set()
}

const loadEmployees = async () => {
  loadingEmployees.value = true
  errorMessage.value = ''

  try {
    employees.value = await groupApi.fetchAssignableEmployees({
      search: search.value,
      department_id: departmentId.value,
      location_id: locationId.value,
      date: effectiveFrom.value || undefined,
    })
  } catch (err) {
    errorMessage.value = groupApi.getErrorMessage(err)
  } finally {
    loadingEmployees.value = false
  }
}

let searchTimer: ReturnType<typeof setTimeout> | undefined

watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(loadEmployees, 350)
})

watch([departmentId, locationId, effectiveFrom], loadEmployees)

watch(groupId, () => {
  const next = new Set(selectedIds.value)
  employees.value.filter(isInSelectedGroup).forEach(e => next.delete(e.id))
  selectedIds.value = next
})

const resetFilters = () => {
  search.value = ''
  departmentId.value = null
  locationId.value = null
}

/* =========================================================
   UNDO
   DELETE /admin/payroll-groups/{group}/assignments/{assignment}
   Backend only allows the employee's latest assignment and refuses
   if payroll was already generated under it.
========================================================= */

const undoingId = ref<number | null>(null) // employee id being undone
const undoingBatch = ref(false)
const undoBusy = computed(() => undoingId.value !== null || undoingBatch.value)

// The batch from the last bulk assign, so it can be undone in one click.
const lastBatch = ref<{ groupId: number, effectiveFrom: string, employeeIds: number[] } | null>(null)

// What the result panel is showing: a bulk assign or an undo.
const resultKind = ref<'assign' | 'undo'>('assign')

const fullName = (e: AssignableEmployee) => `${e.firstname} ${e.lastname}`.trim()

const undoEmployee = async (e: AssignableEmployee) => {
  const assignment = currentAssignment(e)
  if (!groupId.value || !assignment || undoBusy.value) return

  const confirmed = window.confirm(
    `Undo ${fullName(e)}'s assignment to ${selectedGroup.value?.group_name ?? 'this group'}?\n\n` +
    'The assignment will be deleted. If it replaced an earlier payroll group, the employee goes back to that group.',
  )
  if (!confirmed) return

  undoingId.value = e.id
  errorMessage.value = ''

  try {
    const res = await groupApi.undoAssignment(groupId.value, assignment.id)
    resultKind.value = 'undo'
    resultMessage.value = `${fullName(e)}: ${res.message}`
    result.value = { assigned: [], skipped: [] }
    if (lastBatch.value) {
      lastBatch.value.employeeIds = lastBatch.value.employeeIds.filter(id => id !== e.id)
    }
    await loadEmployees()
  } catch (err) {
    errorMessage.value = `${fullName(e)}: ${groupApi.getErrorMessage(err)}`
  } finally {
    undoingId.value = null
  }
}

const undoLastBatch = async () => {
  const batch = lastBatch.value
  if (!batch || !batch.employeeIds.length || undoBusy.value) return

  const count = batch.employeeIds.length
  const confirmed = window.confirm(
    `Undo the assignment of all ${count} employee${count === 1 ? '' : 's'} you just assigned?\n\n` +
    'Employees moved from another group go back to that group.',
  )
  if (!confirmed) return

  undoingBatch.value = true
  errorMessage.value = ''

  const undone: BulkAssignResult['assigned'] = []
  const failed: BulkAssignResult['skipped'] = []

  try {
    // Fresh, unfiltered list so every employee in the batch is found even if
    // the filters changed after assigning.
    const fresh = await groupApi.fetchAssignableEmployees({ date: batch.effectiveFrom })
    const byId = new Map(fresh.map(e => [e.id, e]))

    // One at a time: the backend locks each employee row.
    for (const employeeId of batch.employeeIds) {
      const employee = byId.get(employeeId)
      const assignment = employee ? currentAssignment(employee) : null
      const name = employee ? fullName(employee) : `Employee #${employeeId}`

      if (!assignment || assignment.payroll_group_id !== batch.groupId) {
        failed.push({ employee_id: employeeId, name, reason: 'No longer in this group.' })
        continue
      }

      try {
        await groupApi.undoAssignment(batch.groupId, assignment.id)
        undone.push({ employee_id: employeeId, name, moved_from_group_id: null })
      } catch (err) {
        failed.push({ employee_id: employeeId, name, reason: groupApi.getErrorMessage(err) })
      }
    }

    resultKind.value = 'undo'
    resultMessage.value = failed.length
      ? `Undid ${undone.length} of ${count} assignment(s).`
      : `Undid all ${undone.length} assignment(s).`
    result.value = { assigned: undone, skipped: failed }

    // Keep only the ones that failed so they can be retried.
    lastBatch.value = failed.length
      ? { ...batch, employeeIds: failed.map(item => item.employee_id) }
      : null
  } catch (err) {
    errorMessage.value = groupApi.getErrorMessage(err)
  } finally {
    undoingBatch.value = false
    await loadEmployees()
  }
}

const submit = async () => {
  errorMessage.value = ''
  resultMessage.value = ''
  result.value = null
  lastBatch.value = null

  if (!groupId.value) {
    errorMessage.value = 'Select a payroll group.'
    return
  }

  if (!effectiveFrom.value) {
    errorMessage.value = 'Select an effective start date.'
    return
  }

  if (selectedIds.value.size === 0) {
    errorMessage.value = 'Select at least one employee.'
    return
  }

  try {
    const res = await groupApi.bulkAssign(
      groupId.value,
      [...selectedIds.value],
      effectiveFrom.value,
    )

    resultKind.value = 'assign'
    result.value = res.data
    resultMessage.value = res.message
    lastBatch.value = res.data.assigned.length
      ? {
          groupId: groupId.value,
          effectiveFrom: effectiveFrom.value,
          employeeIds: res.data.assigned.map(item => item.employee_id),
        }
      : null
    clearSelection()
    await loadEmployees()
  } catch (err) {
    errorMessage.value = groupApi.getErrorMessage(err)
  }
}

onMounted(async () => {
  await loadEmployees()

  try {
    await groupApi.fetchGroups({ search: '', is_active: null })
  } catch (err) {
    errorMessage.value = groupApi.getErrorMessage(err)
  }

  try {
    const filters = await groupApi.fetchEmployeeFilters()
    departments.value = filters.departments
    locations.value = filters.locations
  } catch (err) {
    errorMessage.value = `Couldn't load department and location filters: ${groupApi.getErrorMessage(err)}`
  }
})

onBeforeUnmount(() => clearTimeout(searchTimer))
</script>

<template>
  <section class="assign-page">
    <PageHeader
      title="Assign Employees"
      description="Add employees to a payroll group in bulk. Filter by department or location, then select who to assign."
    >
      <AppButton
        :icon="ArrowLeft"
        variant="secondary"
        @click="navigateTo(LIST_ROUTE)"
      >
        Back to payroll groups
      </AppButton>
    </PageHeader>

    <div
      v-if="errorMessage"
      class="page-alert error-alert"
    >
      <span>{{ errorMessage }}</span>
      <button
        type="button"
        @click="errorMessage = ''"
      >
        ×
      </button>
    </div>

    <div
      v-if="result"
      class="result-panel"
    >
      <div class="result-head">
        <strong>{{ resultMessage }}</strong>
        <div class="result-actions">
          <button
            v-if="lastBatch?.employeeIds.length"
            type="button"
            class="undo-btn"
            :disabled="undoBusy"
            @click="undoLastBatch"
          >
            <Undo2 :size="13" />
            {{ undoingBatch ? 'Undoing…' : resultKind === 'undo' ? `Retry undo (${lastBatch.employeeIds.length})` : `Undo this assignment (${lastBatch.employeeIds.length})` }}
          </button>
          <button
            type="button"
            class="icon-btn"
            aria-label="Dismiss"
            @click="result = null"
          >
            <X :size="16" />
          </button>
        </div>
      </div>

      <div
        v-if="result.assigned.length"
        class="result-block"
      >
        <span class="result-title ok">
          <CheckCircle2 :size="14" /> {{ resultKind === 'undo' ? 'Undone' : 'Assigned' }} ({{ result.assigned.length }})
        </span>
        <ul>
          <li
            v-for="item in result.assigned"
            :key="item.employee_id"
          >
            {{ item.name }}
          </li>
        </ul>
      </div>

      <div
        v-if="result.skipped.length"
        class="result-block"
      >
        <span class="result-title warn">
          <AlertTriangle :size="14" /> {{ resultKind === 'undo' ? 'Could not undo' : 'Skipped' }} ({{ result.skipped.length }})
        </span>
        <ul>
          <li
            v-for="item in result.skipped"
            :key="item.employee_id"
          >
            {{ item.name ?? `Employee #${item.employee_id}` }}
            <span class="muted">— {{ item.reason }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="layout">
      <aside class="panel settings">
        <h2>Assignment</h2>

        <div class="field">
          <label for="group">Payroll group</label>
          <select
            id="group"
            v-model="groupId"
          >
            <option :value="null">
              Select payroll group
            </option>
            <option
              v-for="g in activeGroups"
              :key="g.id"
              :value="g.id"
            >
              {{ g.group_name }} ({{ frequencyLabel(g.frequency) }})
            </option>
          </select>
          <small
            v-if="selectedGroup"
            class="hint"
          >
            Paid {{ frequencyLabel(selectedGroup.frequency).toLowerCase() }}
          </small>
        </div>

        <div class="field">
          <label for="effective_from">Effective start date</label>
          <input
            id="effective_from"
            v-model="effectiveFrom"
            type="date"
          >
          <small class="hint">
            Employees already in another group are moved on this date. Their previous group ends the day before.
          </small>
        </div>

        <div class="summary">
          <div>
            <span class="summary-value">{{ selectedIds.size }}</span>
            <span class="summary-label">selected</span>
          </div>
          <button
            v-if="selectedIds.size"
            type="button"
            class="link-btn"
            @click="clearSelection"
          >
            Clear selection
          </button>
        </div>

        <AppButton
          :icon="UserPlus"
          :disabled="saving || !groupId || !selectedIds.size"
          class="submit-btn"
          @click="submit"
        >
          {{ saving ? 'Assigning…' : `Assign ${selectedIds.size || ''} employee${selectedIds.size === 1 ? '' : 's'}` }}
        </AppButton>
      </aside>

      <div class="panel employees">
        <div class="filters">
          <div class="search">
            <Search :size="15" />
            <input
              v-model="search"
              type="search"
              placeholder="Search employee ID or name"
            >
          </div>

          <select v-model="departmentId">
            <option :value="null">
              All departments
            </option>
            <option
              v-for="d in departments"
              :key="d.id"
              :value="d.id"
            >
              {{ departmentLabel(d) }}
            </option>
          </select>

          <select v-model="locationId">
            <option :value="null">
              All locations
            </option>
            <option
              v-for="l in locations"
              :key="l.id"
              :value="l.id"
            >
              {{ l.location_name }}
            </option>
          </select>

          <button
            type="button"
            class="icon-btn bordered"
            aria-label="Reset filters"
            @click="resetFilters"
          >
            <RotateCcw :size="15" />
          </button>
        </div>

        <div class="list-head">
          <label class="check">
            <input
              type="checkbox"
              :checked="allVisibleSelected"
              :indeterminate.prop="someVisibleSelected && !allVisibleSelected"
              :disabled="!selectableEmployees.length"
              @change="toggleAllVisible"
            >
            <span>
              Select all
              <template v-if="departmentId">in {{ departmentLabel(departments.find(d => d.id === departmentId)) }}</template>
              ({{ selectableEmployees.length }})
            </span>
          </label>
          <span class="muted">{{ employees.length }} employees shown</span>
        </div>

        <div
          v-if="loadingEmployees"
          class="empty"
        >
          Loading employees…
        </div>

        <div
          v-else-if="!employees.length"
          class="empty"
        >
          No active employees match these filters.
        </div>

        <ul
          v-else
          class="employee-list"
        >
          <li
            v-for="e in employees"
            :key="e.id"
            :class="{
              selected: selectedIds.has(e.id),
              disabled: isInSelectedGroup(e),
            }"
          >
            <label class="check row">
              <input
                type="checkbox"
                :checked="selectedIds.has(e.id)"
                :disabled="isInSelectedGroup(e)"
                @change="toggleEmployee(e.id)"
              >
              <span class="emp">
                <strong>{{ e.lastname }}, {{ e.firstname }}</strong>
                <span class="muted">
                  {{ e.emp_id }} · {{ departmentLabel(e.department) }}
                  <template v-if="e.latest_employment?.location">
                    · {{ e.latest_employment.location.location_name }}
                  </template>
                </span>
              </span>
              <template v-if="isInSelectedGroup(e)">
                <span class="badge same">
                  Already in this group
                </span>
                <button
                  type="button"
                  class="undo-btn"
                  :disabled="undoBusy"
                  :title="`Undo ${e.firstname}'s assignment to this group`"
                  @click.stop.prevent="undoEmployee(e)"
                >
                  <Undo2 :size="13" />
                  {{ undoingId === e.id ? 'Undoing…' : 'Undo' }}
                </button>
              </template>
              <span
                v-else-if="currentAssignment(e)?.payroll_group"
                class="badge move"
              >
                Currently: {{ currentAssignment(e)?.payroll_group?.group_name }}
              </span>
              <span
                v-else
                class="badge none"
              >
                No group
              </span>
            </label>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.assign-page {
  width: 100%;
  min-width: 0;
}

.layout {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  margin-top: 14px;
}

.panel {
  border: 1px solid var(--border, rgb(127 127 127 / 20%));
  border-radius: 10px;
  background: var(--surface, transparent);
}

.settings {
  position: sticky;
  top: 80px;
  display: grid;
  gap: 16px;
  padding: 18px;
}

.settings h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 14px;
}

.field {
  display: grid;
  gap: 6px;
}

.field label {
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 600;
}

select,
input[type='date'],
.search {
  width: 100%;
  padding: 9px 11px;
  border: 1px solid var(--border, rgb(127 127 127 / 30%));
  border-radius: 8px;
  background: var(--input-bg, transparent);
  color: var(--text-primary);
  font: inherit;
  font-size: 12px;
}

select:focus,
input[type='date']:focus,
.search:focus-within {
  border-color: var(--primary);
  outline: 2px solid var(--primary-soft);
}

.hint {
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.4;
}

.summary {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid var(--border, rgb(127 127 127 / 20%));
}

.summary-value {
  color: var(--text-primary);
  font-size: 28px;
  font-weight: 700;
}

.summary-label {
  margin-left: 6px;
  color: var(--text-muted);
  font-size: 12px;
}

.submit-btn {
  width: 100%;
  justify-content: center;
}

.link-btn {
  border: 0;
  background: transparent;
  color: var(--primary);
  font-size: 12px;
  cursor: pointer;
}

.employees {
  min-width: 0;
  overflow: hidden;
}

.filters {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 190px 190px auto;
  gap: 10px;
  padding: 14px;
  border-bottom: 1px solid var(--border, rgb(127 127 127 / 20%));
}

.search {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
}

.search input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  color: var(--text-primary);
  font: inherit;
  outline: none;
}

.icon-btn {
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.icon-btn.bordered {
  width: 38px;
  border: 1px solid var(--border, rgb(127 127 127 / 30%));
  border-radius: 8px;
}

.list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border, rgb(127 127 127 / 20%));
  font-size: 12px;
}

.check {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
  cursor: pointer;
}

.check input {
  width: 15px;
  height: 15px;
  accent-color: var(--primary);
}

.employee-list {
  max-height: 560px;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}

.employee-list li {
  border-bottom: 1px solid var(--border, rgb(127 127 127 / 12%));
}

.employee-list li.selected {
  background: var(--primary-soft);
}

/* Dim the content only, so the Undo button stays readable. */
.employee-list li.disabled .emp,
.employee-list li.disabled .badge,
.employee-list li.disabled input {
  opacity: 0.55;
}

.undo-btn {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border: 1px solid var(--border, rgb(127 127 127 / 30%));
  border-radius: 7px;
  background: var(--bg-card-soft, transparent);
  color: var(--text-secondary);
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.undo-btn:hover:not(:disabled) {
  border-color: #fb923c;
  color: #fb923c;
}

.undo-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.result-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.employee-list li.disabled .check {
  cursor: not-allowed;
}

.row {
  padding: 10px 14px;
}

.emp {
  display: grid;
  flex: 1;
  min-width: 0;
  gap: 2px;
}

.emp strong {
  font-size: 12px;
}

.muted {
  color: var(--text-muted);
  font-size: 11px;
}

.badge {
  flex-shrink: 0;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}

.badge.same {
  background: rgb(148 163 184 / 15%);
  color: var(--text-muted);
}

.badge.move {
  background: rgb(251 146 60 / 12%);
  color: #fb923c;
}

.badge.none {
  background: rgb(34 197 94 / 11%);
  color: #22c55e;
}

.empty {
  padding: 40px 14px;
  color: var(--text-muted);
  font-size: 12px;
  text-align: center;
}

.page-alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 12px 0;
  padding: 11px 14px;
  border-radius: 8px;
  font-size: 12px;
}

.page-alert button {
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 18px;
  cursor: pointer;
}

.error-alert {
  background: rgb(248 113 113 / 10%);
  color: var(--red);
}

.result-panel {
  margin: 12px 0;
  padding: 14px;
  border: 1px solid var(--border, rgb(127 127 127 / 20%));
  border-radius: 10px;
  font-size: 12px;
}

.result-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text-primary);
}

.result-block {
  margin-top: 10px;
}

.result-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.result-title.ok {
  color: #22c55e;
}

.result-title.warn {
  color: #fb923c;
}

.result-block ul {
  max-height: 160px;
  margin: 6px 0 0;
  padding-left: 20px;
  overflow-y: auto;
  color: var(--text-primary);
}

.result-block li {
  margin: 3px 0;
}

@media (max-width: 1000px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .settings {
    position: static;
  }
}

@media (max-width: 700px) {
  .filters {
    grid-template-columns: 1fr 1fr;
  }

  .search {
    grid-column: 1 / -1;
  }

  .badge {
    display: none;
  }
}
</style>