
<script setup lang="ts">
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  History,
  UserRound,
  X,
} from 'lucide-vue-next'

import type {
  LifecycleHistoryRecord,
} from '~/types/lifecycleHistory'

type ModalMode = 'details' | 'timeline'

const props = defineProps<{
  open: boolean
  mode: ModalMode
  records: LifecycleHistoryRecord[]
  selectedRecord: LifecycleHistoryRecord | null
  employeeId: number | null
}>()

const emit = defineEmits<{
  close: []
  'update:employeeId': [id: number | null]
}>()

/* =========================================
   EMPLOYEE LIST
========================================= */

const employees = computed(() => {
  const unique = new Map<number, {
    id: number
    name: string
    number: string
    department: string
  }>()

  props.records.forEach(record => {
    if (!unique.has(record.employeeId)) {
      unique.set(record.employeeId, {
        id: record.employeeId,
        name: record.employeeName,
        number: record.employeeNumber,
        department: record.department,
      })
    }
  })

  return [...unique.values()].sort(
    (a, b) => a.name.localeCompare(b.name),
  )
})

const selectedEmployee = computed(() => {
  return employees.value.find(
    employee => employee.id === props.employeeId,
  ) ?? null
})

/* =========================================
   TIMELINE
========================================= */

const timelineRecords = computed(() => {
  if (props.employeeId === null) return []

  return props.records
    .filter(record => record.employeeId === props.employeeId)
    .sort((a, b) => {
      const dateCompare = b.effectiveDate.localeCompare(a.effectiveDate)

      if (dateCompare !== 0) return dateCompare

      return b.createdAt.localeCompare(a.createdAt)
    })
})

const completedEvents = computed(() => {
  return timelineRecords.value.filter(
    item => item.status === 'Completed' || item.status === 'Effective',
  ).length
})

/* =========================================
   HELPERS
========================================= */

const formatDate = (value?: string) => {
  if (!value) return '—'

  const date = new Date(
    value.includes('T') ? value : `${value}T00:00:00`,
  )

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const eventClass = (type: string) => {
  return type.toLowerCase().replace(/\s+/g, '-')
}

const changeEmployee = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value

  emit(
    'update:employeeId',
    value ? Number(value) : null,
  )
}

const closeModal = () => {
  emit('close')
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.open) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="lifecycle-modal-overlay"
      @click.self="closeModal"
    >
      <section
        class="lifecycle-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="
          mode === 'timeline'
            ? 'Employee Lifecycle Timeline'
            : 'Lifecycle Event Details'
        "
      >
        <!-- HEADER -->

        <header class="modal-header">
          <div class="modal-heading">
            <div class="modal-icon">
              <History :size="18" />
            </div>

            <div>
              <h2>
                {{
                  mode === 'timeline'
                    ? 'Employee Lifecycle Timeline'
                    : 'Lifecycle Event Details'
                }}
              </h2>

              <p>
                Employee Lifecycle · Historical Records
              </p>
            </div>
          </div>

          <button
            type="button"
            class="close-button"
            aria-label="Close"
            @click="closeModal"
          >
            <X :size="17" />
          </button>
        </header>

        <!-- DETAILS -->

        <div
          v-if="mode === 'details' && selectedRecord"
          class="modal-body"
        >
          <div class="summary-banner">
            <div>
              <small>REFERENCE NUMBER</small>
              <strong>{{ selectedRecord.referenceNumber }}</strong>
            </div>

            <span class="status-chip">
              {{ selectedRecord.status }}
            </span>
          </div>

          <div class="section-heading">
            Employee Information
          </div>

          <div class="details-grid">
            <div class="detail-box">
              <small>Employee Name</small>
              <strong>{{ selectedRecord.employeeName }}</strong>
            </div>

            <div class="detail-box">
              <small>Employee Number</small>
              <strong>{{ selectedRecord.employeeNumber }}</strong>
            </div>

            <div class="detail-box">
              <small>Department</small>
              <strong>{{ selectedRecord.department }}</strong>
            </div>

            <div class="detail-box">
              <small>Position</small>
              <strong>{{ selectedRecord.position }}</strong>
            </div>
          </div>

          <div class="section-heading">
            Lifecycle Event
          </div>

          <div class="details-grid">
            <div class="detail-box">
              <small>Event Type</small>
              <strong>{{ selectedRecord.eventType }}</strong>
            </div>

            <div class="detail-box">
              <small>Event Title</small>
              <strong>{{ selectedRecord.eventTitle }}</strong>
            </div>

            <div class="detail-box">
              <small>Effective Date</small>
              <strong>
                {{ formatDate(selectedRecord.effectiveDate) }}
              </strong>
            </div>

            <div class="detail-box">
              <small>Recorded Date</small>
              <strong>
                {{ formatDate(selectedRecord.createdAt) }}
              </strong>
            </div>

            <div class="detail-box">
              <small>Processed By</small>
              <strong>{{ selectedRecord.processedBy }}</strong>
            </div>

            <div class="detail-box">
              <small>Approved By</small>
              <strong>
                {{ selectedRecord.approvedBy || 'Not yet approved' }}
              </strong>
            </div>
          </div>

          <template
            v-if="
              selectedRecord.previousValue ||
              selectedRecord.newValue
            "
          >
            <div class="section-heading">
              Change Information
            </div>

            <div class="change-row">
              <div class="change-box">
                <small>PREVIOUS</small>
                <strong>
                  {{ selectedRecord.previousValue || '—' }}
                </strong>
              </div>

              <span class="change-arrow">
                <ArrowRight :size="17" />
              </span>

              <div class="change-box new">
                <small>NEW</small>
                <strong>
                  {{ selectedRecord.newValue || '—' }}
                </strong>
              </div>
            </div>
          </template>

          <div class="section-heading">
            Additional Information
          </div>

          <div class="detail-box multiline">
            <small>Description</small>
            <strong>{{ selectedRecord.description }}</strong>
          </div>

          <div class="detail-box multiline">
            <small>Remarks</small>
            <strong>
              {{ selectedRecord.remarks || 'No remarks provided.' }}
            </strong>
          </div>

          <div class="modal-note">
            This is a read-only historical record.
            Changes must be processed through the relevant
            Employee Lifecycle module.
          </div>
        </div>

        <!-- TIMELINE -->

        <div
          v-else-if="mode === 'timeline'"
          class="modal-body"
        >
          <label class="employee-selector">
            <span>Select Employee</span>

            <select
              :value="employeeId ?? ''"
              @change="changeEmployee"
            >
              <option value="">
                Select an employee
              </option>

              <option
                v-for="employee in employees"
                :key="employee.id"
                :value="employee.id"
              >
                {{ employee.name }} ({{ employee.number }})
              </option>
            </select>
          </label>

          <template v-if="selectedEmployee">
            <div class="employee-summary">
              <div class="employee-avatar">
                <UserRound :size="21" />
              </div>

              <div>
                <strong>{{ selectedEmployee.name }}</strong>
                <span>
                  {{ selectedEmployee.number }} ·
                  {{ selectedEmployee.department }}
                </span>
              </div>
            </div>

            <div class="timeline-stats">
              <div>
                <small>Total Events</small>
                <strong>{{ timelineRecords.length }}</strong>
              </div>

              <div>
                <small>Completed / Effective</small>
                <strong>{{ completedEvents }}</strong>
              </div>
            </div>

            <div
              v-if="timelineRecords.length"
              class="timeline-list"
            >
              <article
                v-for="item in timelineRecords"
                :key="item.id"
                class="timeline-item"
              >
                <div
                  class="timeline-marker"
                  :class="eventClass(item.eventType)"
                >
                  <CheckCircle2 :size="14" />
                </div>

                <div class="timeline-content">
                  <div class="timeline-top">
                    <span
                      class="event-tag"
                      :class="eventClass(item.eventType)"
                    >
                      {{ item.eventType }}
                    </span>

                    <small>
                      <CalendarDays :size="12" />
                      {{ formatDate(item.effectiveDate) }}
                    </small>
                  </div>

                  <h3>{{ item.eventTitle }}</h3>

                  <span class="timeline-reference">
                    {{ item.referenceNumber }}
                  </span>

                  <p>{{ item.description }}</p>

                  <div
                    v-if="item.previousValue || item.newValue"
                    class="timeline-change"
                  >
                    <span>{{ item.previousValue || '—' }}</span>
                    <ArrowRight :size="13" />
                    <strong>{{ item.newValue || '—' }}</strong>
                  </div>

                  <div class="timeline-footer">
                    <span>{{ item.status }}</span>
                    <span>By {{ item.processedBy }}</span>
                  </div>
                </div>
              </article>
            </div>

            <div v-else class="empty-state">
              No lifecycle events recorded for this employee.
            </div>
          </template>

          <div v-else class="empty-state">
            <History :size="26" />
            <strong>Select an employee</strong>
            <span>
              Choose an employee to review their lifecycle history.
            </span>
          </div>
        </div>

        <!-- FOOTER -->

        <footer class="modal-footer">
          <button
            type="button"
            class="secondary-button"
            @click="closeModal"
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.lifecycle-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10040;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(2, 9, 22, 0.76);
  backdrop-filter: blur(5px);
}

.lifecycle-modal {
  display: flex;
  width: 100%;
  max-width: 670px;
  max-height: 90vh;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
}

.modal-header,
.modal-footer {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 17px;
}

.modal-header {
  border-bottom: 1px solid var(--border);
}

.modal-footer {
  justify-content: flex-end;
  border-top: 1px solid var(--border);
}

.modal-heading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-icon {
  display: flex;
  width: 37px;
  height: 37px;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: var(--primary-soft);
  color: var(--primary);
}

.modal-heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 13px;
}

.modal-heading p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.close-button {
  display: flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.modal-body {
  min-height: 0;
  overflow-y: auto;
  padding: 17px;
}

.summary-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.summary-banner small,
.summary-banner strong {
  display: block;
}

.summary-banner small {
  color: var(--text-muted);
  font-size: 9px;
}

.summary-banner strong {
  margin-top: 5px;
  color: var(--primary);
  font-size: 12px;
}

.status-chip {
  padding: 6px 10px;
  border-radius: 20px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 10px;
  font-weight: 650;
}

.section-heading {
  margin: 18px 0 11px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-soft);
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 700;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.detail-box {
  min-width: 0;
  padding: 11px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.detail-box small,
.detail-box strong {
  display: block;
}

.detail-box small {
  color: var(--text-muted);
  font-size: 9px;
}

.detail-box strong {
  margin-top: 6px;
  color: var(--text-primary);
  font-size: 11px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.detail-box.multiline {
  margin-bottom: 10px;
}

.change-row {
  display: flex;
  align-items: center;
  gap: 9px;
}

.change-box {
  flex: 1;
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.change-box.new {
  border-color: var(--green);
  background: var(--green-soft);
}

.change-box small,
.change-box strong {
  display: block;
}

.change-box small {
  color: var(--text-muted);
  font-size: 9px;
}

.change-box strong {
  margin-top: 6px;
  color: var(--text-primary);
  font-size: 11px;
  overflow-wrap: anywhere;
}

.change-arrow {
  color: var(--primary);
}

.modal-note {
  margin-top: 14px;
  padding: 11px;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.6;
}

.secondary-button {
  min-height: 35px;
  padding: 0 15px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-primary);
  font-size: 11px;
  cursor: pointer;
}

/* TIMELINE */

.employee-selector {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 14px;
}

.employee-selector span {
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 650;
}

.employee-selector select {
  width: 100%;
  height: 39px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  outline: none;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-size: 11px;
}

.employee-summary {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 12px;
  padding: 13px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.employee-avatar {
  display: flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: var(--primary-soft);
  color: var(--primary);
}

.employee-summary strong,
.employee-summary span {
  display: block;
}

.employee-summary strong {
  color: var(--text-primary);
  font-size: 12px;
}

.employee-summary span {
  margin-top: 5px;
  color: var(--text-muted);
  font-size: 10px;
}

.timeline-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.timeline-stats > div {
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
}

.timeline-stats small {
  display: block;
  color: var(--text-muted);
  font-size: 9px;
}

.timeline-stats strong {
  display: block;
  margin-top: 6px;
  color: var(--text-primary);
  font-size: 17px;
}

.timeline-list {
  padding-left: 9px;
}

.timeline-item {
  position: relative;
  display: flex;
  gap: 14px;
  padding-bottom: 20px;
}

.timeline-item:not(:last-child)::before {
  position: absolute;
  top: 28px;
  bottom: 0;
  left: 13px;
  width: 1px;
  background: var(--border);
  content: '';
}

.timeline-marker {
  z-index: 1;
  display: flex;
  width: 27px;
  height: 27px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--primary-soft);
  color: var(--primary);
}

.timeline-marker.regularization {
  background: var(--green-soft);
  color: var(--green);
}

.timeline-marker.transfer {
  background: var(--purple-soft);
  color: var(--purple);
}

.timeline-marker.promotion {
  background: var(--orange-soft);
  color: var(--orange);
}

.timeline-marker.offboarding {
  background: var(--red-soft);
  color: var(--red);
}

.timeline-content {
  flex: 1;
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
}

.timeline-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.event-tag {
  padding: 5px 8px;
  border-radius: 20px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 9px;
  font-weight: 650;
}

.timeline-top small {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-muted);
  font-size: 9px;
}

.timeline-content h3 {
  margin: 12px 0 4px;
  color: var(--text-primary);
  font-size: 12px;
}

.timeline-reference {
  color: var(--primary);
  font-size: 9px;
}

.timeline-content p {
  margin: 10px 0;
  color: var(--text-secondary);
  font-size: 10px;
  line-height: 1.6;
}

.timeline-change {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
  padding: 9px;
  border-radius: 7px;
  background: var(--bg-card-soft);
  font-size: 10px;
}

.timeline-change span {
  color: var(--text-muted);
}

.timeline-change svg {
  color: var(--primary);
}

.timeline-change strong {
  color: var(--green);
}

.timeline-footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 12px;
  padding-top: 9px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-muted);
  font-size: 9px;
}

.empty-state {
  display: flex;
  min-height: 170px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 10px;
  text-align: center;
}

.empty-state strong {
  color: var(--text-primary);
  font-size: 12px;
}

@media (max-width: 550px) {
  .details-grid,
  .timeline-stats {
    grid-template-columns: 1fr;
  }

  .timeline-top {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
