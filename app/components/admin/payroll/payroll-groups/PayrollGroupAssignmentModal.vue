<script setup lang="ts">
import {
  X,
  UserPlus,
  History,
  CalendarDays,
} from 'lucide-vue-next'

import type {
  PayrollGroup,
  PayrollEmployee,
  PayrollAssignment,
} from '~/types/payroll/payroll-groups/payrollGroup'

const props = defineProps<{
  open: boolean
  group: PayrollGroup | null
}>()

const emit = defineEmits<{
  close: []
  updated: []
}>()

const api = usePayrollGroup()

const employees = ref<PayrollEmployee[]>([])
const assignments = ref<PayrollAssignment[]>([])

const employeeId = ref('')
const effectiveFrom = ref(
  new Date().toLocaleDateString('en-CA'),
)

const employeeSearch = ref('')
const historyPage = ref(1)

const employeeLoading = ref(false)
const historyLoading = ref(false)
const submitting = ref(false)

const message = ref('')
const error = ref('')

const selectedTab = ref<'assign' | 'history'>('assign')

const activeAssignments = computed(() =>
  assignments.value.filter(item => !item.effective_to),
)

const employeeOptions = computed(() =>
  employees.value
    .filter(employee => {
      const isActive =
        employee.status === true ||
        employee.status === 1 ||
        employee.status === '1'

      const currentGroup =
        employee.payroll_group_assignments?.[0]?.payroll_group

      const search = employeeSearch.value.toLowerCase()

      const matches =
        `${employee.emp_id} ${employee.firstname} ${employee.lastname}`
          .toLowerCase()
          .includes(search)

      return (
        isActive &&
        !currentGroup &&
        matches
      )
    }),
)

const loadEmployees = async () => {
  employeeLoading.value = true

  try {
    const result = await api.fetchEmployees({
      search: employeeSearch.value,
      per_page: 100,
    })

    employees.value = result.data
  } catch (err) {
    error.value = api.getErrorMessage(err)
  } finally {
    employeeLoading.value = false
  }
}

const loadHistory = async () => {
  if (!props.group) return

  historyLoading.value = true

  try {
    const result = await api.fetchAssignments(
      props.group.id,
      historyPage.value,
      15,
    )

    assignments.value = result.data
  } catch (err) {
    error.value = api.getErrorMessage(err)
  } finally {
    historyLoading.value = false
  }
}

const assign = async () => {
  if (!props.group || !employeeId.value || !effectiveFrom.value) {
    error.value = 'Select an employee and effective date.'
    return
  }

  submitting.value = true
  error.value = ''
  message.value = ''

  try {
    const result = await api.assignEmployee(
      props.group.id,
      {
        employee_id: Number(employeeId.value),
        effective_from: effectiveFrom.value,
      },
    )

    message.value =
      result.message || 'Employee assigned successfully.'

    employeeId.value = ''

    await Promise.all([
      loadEmployees(),
      loadHistory(),
    ])

    emit('updated')
  } catch (err) {
    error.value = api.getErrorMessage(err)
  } finally {
    submitting.value = false
  }
}

const endAssignment = async (
  assignment: PayrollAssignment,
) => {
  if (!props.group) return

  const date = window.prompt(
    'Enter the effective end date (YYYY-MM-DD):',
    new Date().toLocaleDateString('en-CA'),
  )

  if (!date) return

  error.value = ''
  message.value = ''

  try {
    const result = await api.endAssignment(
      props.group.id,
      assignment.id,
      date,
    )

    message.value =
      result.message || 'Assignment ended successfully.'

    await Promise.all([
      loadHistory(),
      loadEmployees(),
    ])

    emit('updated')
  } catch (err) {
    error.value = api.getErrorMessage(err)
  }
}

const formatDate = (value: string | null) => {
  if (!value) return 'Present'

  const date = new Date(`${value.slice(0, 10)}T00:00:00`)

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

watch(
  () => [props.open, props.group?.id] as const,
  async ([open]) => {
    if (!open || !props.group) return

    error.value = ''
    message.value = ''
    selectedTab.value = 'assign'
    historyPage.value = 1

    await Promise.all([
      loadEmployees(),
      loadHistory(),
    ])
  },
)

watch(employeeSearch, () => {
  loadEmployees()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && group"
      class="assignment-overlay"
      @click.self="emit('close')"
    >
      <section class="assignment-modal">
        <header class="modal-header">
          <div>
            <h3>Manage Payroll Group Employees</h3>
            <p>{{ group.group_name }}</p>
          </div>

          <button @click="emit('close')">
            <X :size="18" />
          </button>
        </header>

        <div class="tabs">
          <button
            :class="{ selected: selectedTab === 'assign' }"
            @click="selectedTab = 'assign'"
          >
            <UserPlus :size="14" />
            Assign Employee
          </button>

          <button
            :class="{ selected: selectedTab === 'history' }"
            @click="selectedTab = 'history'"
          >
            <History :size="14" />
            Assignment History
          </button>
        </div>

        <div class="modal-body">
          <div
            v-if="error"
            class="alert error"
          >
            {{ error }}
          </div>

          <div
            v-if="message"
            class="alert success"
          >
            {{ message }}
          </div>

          <template v-if="selectedTab === 'assign'">
            <div class="summary">
              <div>
                <span>Current Employees</span>
                <strong>{{ group.current_employee_count ?? activeAssignments.length }}</strong>
              </div>

              <div>
                <span>Available Employees</span>
                <strong>{{ employeeOptions.length }}</strong>
              </div>
            </div>

            <div class="field">
              <label>Search Employees</label>

              <AppInput
                v-model="employeeSearch"
                searchable
                placeholder="Search employee ID or name..."
              />
            </div>

            <div class="field">
              <label>Select Employee <span>*</span></label>

              <select
                v-model="employeeId"
                class="form-control"
                :disabled="employeeLoading"
              >
                <option value="">
                  {{ employeeLoading ? 'Loading employees...' : 'Select employee' }}
                </option>

                <option
                  v-for="employee in employeeOptions"
                  :key="employee.id"
                  :value="String(employee.id)"
                >
                  {{ employee.emp_id }} —
                  {{ employee.firstname }} {{ employee.lastname }}
                </option>
              </select>

              <small
                v-if="!employeeLoading && !employeeOptions.length"
                class="muted"
              >
                No unassigned active employees found.
              </small>
            </div>

            <div class="field">
              <label>Effective Start Date <span>*</span></label>

              <div class="date-control">
                <CalendarDays :size="15" />

                <input
                  v-model="effectiveFrom"
                  type="date"
                >
              </div>
            </div>

            <p class="helper">
              Existing assignments are preserved. If the employee belongs
              to another group on the selected date, the backend will
              automatically close the previous assignment.
            </p>

            <AppButton
              block
              :icon="UserPlus"
              :loading="submitting"
              :disabled="submitting || !employeeId || !group.is_active"
              @click="assign"
            >
              Assign Employee
            </AppButton>

            <p
              v-if="!group.is_active"
              class="warning"
            >
              Activate this payroll group before assigning employees.
            </p>
          </template>

          <template v-else>
            <div class="summary">
              <div>
                <span>Assignment Records Loaded</span>
                <strong>{{ assignments.length }}</strong>
              </div>

              <div>
                <span>Currently Active</span>
                <strong>{{ activeAssignments.length }}</strong>
              </div>
            </div>

            <div
              v-if="historyLoading"
              class="history-state"
            >
              Loading assignment history...
            </div>

            <div
              v-else-if="!assignments.length"
              class="history-state"
            >
              No assignment history found.
            </div>

            <div v-else class="history-list">
              <article
                v-for="assignment in assignments"
                :key="assignment.id"
                class="history-item"
              >
                <div class="history-info">
                  <strong>
                    {{ assignment.employee?.firstname || 'Employee' }}
                    {{ assignment.employee?.lastname || '' }}
                  </strong>

                  <span>
                    {{ assignment.employee?.emp_id || '—' }}
                  </span>

                  <small>
                    {{ formatDate(assignment.effective_from) }}
                    –
                    {{ formatDate(assignment.effective_to) }}
                  </small>

                  <small>
                    Assigned by:
                    {{ assignment.assignedBy?.name || '—' }}
                  </small>
                </div>

                <div class="history-actions">
                  <span
                    class="history-status"
                    :class="assignment.effective_to ? 'ended' : 'current'"
                  >
                    {{ assignment.effective_to ? 'Ended' : 'Current' }}
                  </span>

                  <button
                    v-if="!assignment.effective_to"
                    class="end-button"
                    @click="endAssignment(assignment)"
                  >
                    End Assignment
                  </button>
                </div>
              </article>
            </div>

            <div class="history-pagination">
              <button
                :disabled="historyPage <= 1"
                @click="historyPage--; loadHistory()"
              >
                Previous
              </button>

              <span>Page {{ historyPage }}</span>

              <button
                :disabled="assignments.length < 15"
                @click="historyPage++; loadHistory()"
              >
                Next
              </button>
            </div>
          </template>
        </div>

        <footer class="modal-footer">
          <AppButton
            variant="secondary"
            @click="emit('close')"
          >
            Close
          </AppButton>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.assignment-overlay {
  position: fixed;
  z-index: 100000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 15px;
  background: rgba(0, 0, 0, .55);
}

.assignment-modal {
  display: flex;
  width: min(650px, 100%);
  max-height: 90vh;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
}

.modal-header,
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 18px;
  border-bottom: 1px solid var(--border-soft);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 14px;
}

.modal-header p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 11px;
}

.modal-header button {
  border: 0;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.tabs {
  display: flex;
  gap: 5px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-soft);
}

.tabs button {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 12px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}

.tabs button.selected {
  background: var(--primary-soft);
  color: var(--primary);
}

.modal-body {
  display: grid;
  gap: 15px;
  overflow-y: auto;
  padding: 17px;
}

.summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.summary div {
  display: grid;
  gap: 6px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
}

.summary span {
  color: var(--text-muted);
  font-size: 10px;
}

.summary strong {
  color: var(--text-primary);
  font-size: 17px;
}

.field {
  display: grid;
  gap: 7px;
}

.field label {
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 600;
}

.field label span {
  color: var(--red);
}

.form-control,
.date-control {
  width: 100%;
  min-height: 40px;
  padding: 9px 11px;
  border: 1px solid var(--border);
  border-radius: 7px;
  outline: none;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font: inherit;
  font-size: 12px;
}

.date-control {
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--text-muted);
}

.date-control input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text-primary);
  font: inherit;
}

.helper,
.muted {
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.6;
}

.warning {
  color: #e5a33b;
  font-size: 11px;
}

.alert {
  padding: 10px 12px;
  border-radius: 7px;
  font-size: 11px;
}

.alert.error {
  background: rgb(248 113 113 / 10%);
  color: var(--red);
}

.alert.success {
  background: rgb(34 197 94 / 10%);
  color: var(--green);
}

.history-state {
  padding: 35px 10px;
  color: var(--text-muted);
  text-align: center;
  font-size: 12px;
}

.history-list {
  display: grid;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
}

.history-info {
  display: grid;
  gap: 4px;
}

.history-info strong {
  color: var(--text-primary);
  font-size: 12px;
}

.history-info span,
.history-info small {
  color: var(--text-muted);
  font-size: 10px;
}

.history-actions {
  display: grid;
  justify-items: end;
  gap: 7px;
}

.history-status {
  font-size: 10px;
  font-weight: 600;
}

.history-status.current {
  color: var(--green);
}

.history-status.ended {
  color: var(--text-muted);
}

.end-button {
  padding: 6px 9px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--red);
  font-size: 10px;
  cursor: pointer;
}

.history-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text-muted);
  font-size: 10px;
}

.history-pagination button {
  padding: 7px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  cursor: pointer;
}

.history-pagination button:disabled {
  opacity: .4;
  cursor: not-allowed;
}

.modal-footer {
  justify-content: flex-end;
  border-top: 1px solid var(--border-soft);
  border-bottom: 0;
}

@media(max-width: 500px) {
  .history-item {
    align-items: flex-start;
    flex-direction: column;
  }

  .history-actions {
    justify-items: start;
  }
}
</style>