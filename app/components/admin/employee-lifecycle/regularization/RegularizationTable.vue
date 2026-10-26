
<script setup lang="ts">
import {
  UserRound,
  CalendarDays,
  ClipboardCheck,
} from 'lucide-vue-next'

import LifecycleActionMenu from '~/components/admin/employee-lifecycle/LifecycleActionMenu.vue'

type RegularizationRow = Record<string, any>

defineProps<{
  records: RegularizationRow[]
}>()

const emit = defineEmits<{
  view: [record: RegularizationRow]
  details: [record: RegularizationRow]
  history: [record: RegularizationRow]
}>()

const get = (
  item: RegularizationRow,
  ...keys: string[]
): string => {
  for (const key of keys) {
    const value = item[key]

    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'object') {
        if ('name' in value) return String(value.name)
        if ('label' in value) return String(value.label)
        continue
      }

      return String(value)
    }
  }

  return ''
}

const employeeName = (item: RegularizationRow) =>
  get(item, 'employeeName', 'employee_name', 'name') ||
  (item.employee?.firstname
    ? `${item.employee.firstname} ${item.employee.lastname ?? ''}`.trim()
    : 'Unknown Employee')

const employeeNumber = (item: RegularizationRow) =>
  get(item, 'employeeNumber', 'employee_number', 'employeeId', 'emp_id') ||
  '—'

const recordNumber = (item: RegularizationRow) =>
  get(
    item,
    'regularizationNumber',
    'regularization_number',
    'reference',
    'referenceNumber',
    'reference_no'
  ) || `REG-${item.id ?? 'N/A'}`

const departmentName = (item: RegularizationRow) =>
  get(item, 'department', 'departmentName', 'department_name') || '—'

const positionName = (item: RegularizationRow) =>
  get(item, 'position', 'positionName', 'position_name') || '—'

const targetDate = (item: RegularizationRow) =>
  get(
    item,
    'targetRegularizationDate',
    'target_regularization_date',
    'targetDate',
    'target_date'
  )

const evaluationLabel = (item: RegularizationRow) =>
  get(item, 'evaluationStatus', 'evaluation_status') || 'Pending'

const recommendationLabel = (item: RegularizationRow) =>
  get(item, 'recommendation', 'hrRecommendation', 'hr_recommendation') || 'Pending'

const regularizationStatus = (item: RegularizationRow) =>
  get(item, 'status', 'regularizationStatus', 'regularization_status') ||
  'Pending'

const effectiveDate = (item: RegularizationRow) =>
  get(item, 'effectiveDate', 'effective_date')

const formatDate = (value: string) => {
  if (!value) return '—'

  const date = new Date(
    value.includes('T') ? value : `${value}T00:00:00`
  )

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const statusClass = (value: string) => {
  const text = value.toLowerCase()

  if (
    text.includes('regularized') ||
    text.includes('completed') ||
    text.includes('approved')
  ) return 'success'

  if (text.includes('recommended')) return 'purple'

  if (text.includes('progress') || text.includes('review')) return 'blue'

  if (text.includes('extend')) return 'orange'

  if (text.includes('reject') || text.includes('cancel')) return 'danger'

  return 'warning'
}

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
</script>

<template>
  <article class="regularization-table-card">

    <!-- HEADER -->
    <div class="table-heading">
      <div>
        <h3>Employee Regularization</h3>

        <p>
          Track employee regularization dates,
          recommendations and status.
        </p>
      </div>

      <span class="record-count">
        {{ records.length }}
        {{ records.length === 1 ? 'Record' : 'Records' }}
      </span>
    </div>

    <!-- TABLE -->
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Regularization No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Position</th>
            <th>Target Regularization</th>
            <th>Evaluation</th>
            <th>Recommendation</th>
            <th>Effective Date</th>
            <th>Status</th>
            <th>Remarks</th>
            <th class="action-heading">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in records"
            :key="item.id ?? recordNumber(item)"
          >
            <!-- REGULARIZATION NUMBER -->
            <td>
              <strong class="reference-number">
                {{ recordNumber(item) }}
              </strong>
            </td>

            <!-- EMPLOYEE -->
            <td>
              <div class="employee-cell">
                <span class="employee-avatar">
                  {{ initials(employeeName(item)) || 'EM' }}
                </span>

                <div class="employee-info">
                  <strong>{{ employeeName(item) }}</strong>

                  <span>
                    {{ employeeNumber(item) }}
                  </span>
                </div>
              </div>
            </td>

            <!-- DEPARTMENT -->
            <td>
              <span class="department-text">
                {{ departmentName(item) }}
              </span>
            </td>

            <!-- POSITION -->
            <td>
              <span class="position-text">
                {{ positionName(item) }}
              </span>
            </td>

            <!-- TARGET DATE -->
            <td>
              <div class="date-cell">
                <CalendarDays :size="14" />
                <strong>{{ formatDate(targetDate(item)) }}</strong>
              </div>
            </td>

            <!-- EVALUATION -->
            <td>
              <span
                class="status-badge"
                :class="statusClass(evaluationLabel(item))"
              >
                <span class="status-dot" />
                {{ evaluationLabel(item) }}
              </span>
            </td>

            <!-- RECOMMENDATION -->
            <td>
              <span
                class="status-badge"
                :class="statusClass(recommendationLabel(item))"
              >
                <span class="status-dot" />
                {{ recommendationLabel(item) }}
              </span>
            </td>

            <!-- EFFECTIVE DATE -->
            <td>
              <div class="date-cell">
                <CalendarDays :size="14" />
                <span>{{ formatDate(effectiveDate(item)) }}</span>
              </div>
            </td>

            <!-- STATUS -->
            <td>
              <span
                class="status-badge"
                :class="statusClass(regularizationStatus(item))"
              >
                <span class="status-dot" />
                {{ regularizationStatus(item) }}
              </span>
            </td>

            <!-- REMARKS -->
            <td>
              <p
                class="remarks-text"
                :title="get(item, 'remarks') || 'No remarks'"
              >
                {{ get(item, 'remarks') || 'No remarks' }}
              </p>
            </td>

            <!-- THREE DOTS -->
            <td class="action-cell">
              <LifecycleActionMenu
                detail-label="View Regularization Status"
                :show-history="true"
                @view="emit('view', item)"
                @details="emit('details', item)"
                @history="emit('history', item)"
              />
            </td>
          </tr>

          <tr v-if="records.length === 0">
            <td colspan="11">
              <div class="empty-state">
                <span class="empty-icon">
                  <ClipboardCheck :size="25" />
                </span>

                <strong>No regularization records found</strong>

                <p>
                  Try changing the search keyword or filters.
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </article>
</template>

<style scoped>
.regularization-table-card {
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.table-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 17px;
  border-bottom: 1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 700;
}

.table-heading p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.record-count {
  flex-shrink: 0;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 600;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1470px;
  border-collapse: collapse;
}

thead {
  background: var(--bg-card-soft);
}

th {
  padding: 13px 14px;
  color: var(--text-secondary);
  font-size: 9px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

td {
  padding: 13px 14px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 10px;
  vertical-align: middle;
}

tbody tr {
  transition: background .15s ease;
}

tbody tr:hover {
  background: var(--bg-card-soft);
}

/* REFERENCE */
.reference-number {
  color: var(--primary);
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

/* EMPLOYEE */
.employee-cell {
  display: flex;
  min-width: 170px;
  align-items: center;
  gap: 10px;
}

.employee-avatar {
  display: flex;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 11px;
  font-weight: 700;
}

.employee-info {
  min-width: 0;
}

.employee-info strong {
  display: block;
  color: var(--text-primary);
  font-size: 10.5px;
  font-weight: 700;
  white-space: nowrap;
}

.employee-info span {
  display: block;
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 9px;
}

.department-text,
.position-text {
  color: var(--text-primary);
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}

/* DATE */
.date-cell {
  display: flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
}

.date-cell svg {
  flex-shrink: 0;
  color: var(--text-muted);
}

.date-cell strong {
  color: var(--text-primary);
  font-size: 10px;
  font-weight: 650;
}

/* STATUS */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 9px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
}

.status-dot {
  width: 5px;
  height: 5px;
  flex-shrink: 0;
  border-radius: 50%;
  background: currentColor;
}

.status-badge.success {
  background: var(--green-soft);
  color: var(--green);
}

.status-badge.purple {
  background: var(--purple-soft);
  color: var(--purple);
}

.status-badge.blue {
  background: var(--primary-soft);
  color: var(--primary);
}

.status-badge.orange,
.status-badge.warning {
  background: var(--orange-soft);
  color: var(--orange);
}

.status-badge.danger {
  background: var(--red-soft);
  color: var(--red);
}

/* REMARKS */
.remarks-text {
  max-width: 200px;
  margin: 0;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ACTIONS */
.action-heading,
.action-cell {
  width: 75px;
  text-align: center;
}

/* EMPTY STATE */
.empty-state {
  display: flex;
  min-height: 210px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 30px;
  text-align: center;
}

.empty-icon {
  display: flex;
  width: 51px;
  height: 51px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--primary-soft);
  color: var(--primary);
}

.empty-state strong {
  color: var(--text-primary);
  font-size: 12px;
}

.empty-state p {
  margin: 0;
  color: var(--text-muted);
  font-size: 10px;
}

@media (max-width: 768px) {
  table {
    min-width: 1400px;
  }

  .table-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
