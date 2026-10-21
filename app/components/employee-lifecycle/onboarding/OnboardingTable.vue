
<script setup lang="ts">
import {
  CalendarDays,
  ClipboardList,
  UserRound,
  Mail,
  MoreHorizontal,
  Eye,
  Pencil,
  RefreshCw,
  CheckCircle2,
} from 'lucide-vue-next'

import type {
  OnboardingEmployee,
  OnboardingStatus,
} from '~/types/onboarding'

const props = defineProps<{
  records: OnboardingEmployee[]
}>()

const emit = defineEmits<{
  view: [record: OnboardingEmployee]
  edit: [record: OnboardingEmployee]
  status: [record: OnboardingEmployee]
  complete: [record: OnboardingEmployee]
}>()

const openId = ref<number | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

const menuStyle = ref({
  top: '0px',
  left: '0px',
})

const formatDate = (value: string) => {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

const statusClass = (status: OnboardingStatus) => {
  return status.toLowerCase().replace(/\s+/g, '-')
}

const closeMenu = () => {
  openId.value = null
}

const toggleMenu = async (
  recordId: number,
  event: MouseEvent,
) => {
  if (openId.value === recordId) {
    closeMenu()
    return
  }

  triggerRef.value = event.currentTarget as HTMLElement
  openId.value = recordId

  await nextTick()

  if (!triggerRef.value) return

  const rect = triggerRef.value.getBoundingClientRect()
  const width = menuRef.value?.offsetWidth ?? 195
  const height = menuRef.value?.offsetHeight ?? 160
  const gap = 6
  const padding = 8

  const top =
    rect.bottom + height + gap < window.innerHeight
      ? rect.bottom + gap
      : rect.top - height - gap

  const left = Math.max(
    padding,
    Math.min(
      rect.right - width,
      window.innerWidth - width - padding,
    ),
  )

  menuStyle.value = {
    top: `${Math.max(padding, top)}px`,
    left: `${left}px`,
  }
}

type ActionName = 'view' | 'edit' | 'status' | 'complete'

const handleAction = (action: ActionName) => {
  const record = props.records.find(
    item => item.id === openId.value,
  )

  closeMenu()

  if (!record) return

  if (
    record.status === 'Completed' &&
    action !== 'view'
  ) {
    return
  }

  switch (action) {
    case 'view':
      emit('view', record)
      break
    case 'edit':
      emit('edit', record)
      break
    case 'status':
      emit('status', record)
      break
    case 'complete':
      emit('complete', record)
      break
  }
}

const handleOutsideClick = (event: MouseEvent) => {
  const target = event.target as Node

  if (
    triggerRef.value?.contains(target) ||
    menuRef.value?.contains(target)
  ) {
    return
  }

  closeMenu()
}

onMounted(() => {
  document.addEventListener('mousedown', handleOutsideClick)
  window.addEventListener('scroll', closeMenu, true)
  window.addEventListener('resize', closeMenu)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutsideClick)
  window.removeEventListener('scroll', closeMenu, true)
  window.removeEventListener('resize', closeMenu)
})
</script>

<template>
  <article class="table-card">
    <div class="table-heading">
      <h3>Employee Onboarding</h3>
      <p>
        Manage employee onboarding records, dates,
        employment details and status.
      </p>
    </div>

    <div v-if="records.length" class="table-scroll">
      <table class="onboarding-table">
        <thead>
          <tr>
            <th>Onboarding No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Employment</th>
            <th>Date Hired</th>
            <th>Target Completion</th>
            <th>Status</th>
            <th>Remarks</th>
            <th class="action-column">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in records"
            :key="item.id"
          >
            <td>
              <strong class="onboarding-number">
                {{ item.onboardingNumber }}
              </strong>
            </td>

            <td>
              <div class="employee-cell">
                <div class="employee-avatar">
                  <UserRound :size="16" />
                </div>

                <div class="employee-info">
                  <strong>{{ item.employeeName }}</strong>
                  <span>
                    {{ item.employeeNumber }} · {{ item.position }}
                  </span>

                  <span v-if="item.email" class="employee-email">
                    <Mail :size="11" />
                    {{ item.email }}
                  </span>
                </div>
              </div>
            </td>

            <td>
              <strong class="department-name">
                {{ item.department }}
              </strong>
            </td>

            <td>
              <span class="employment-badge">
                {{ item.employmentType }}
              </span>
            </td>

            <td>
              <div class="date-cell">
                <CalendarDays :size="13" />
                {{ formatDate(item.dateHired) }}
              </div>
            </td>

            <td>
              <div class="date-cell target-date">
                <CalendarDays :size="13" />
                <strong>
                  {{ formatDate(item.targetCompletionDate) }}
                </strong>
              </div>
            </td>

            <td>
              <span
                class="status-badge"
                :class="statusClass(item.status)"
              >
                <span class="status-dot" />
                {{ item.status }}
              </span>
            </td>

            <td>
              <p
                class="remarks"
                :title="item.remarks || 'No remarks'"
              >
                {{ item.remarks || 'No remarks' }}
              </p>
            </td>

            <td class="action-column">
              <button
                type="button"
                class="action-button"
                :aria-expanded="openId === item.id"
                aria-label="Onboarding actions"
                @click.stop="toggleMenu(item.id, $event)"
              >
                <MoreHorizontal :size="18" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <ClipboardList :size="30" />
      <strong>No onboarding records found</strong>
      <span>
        Try changing the filters or start a new onboarding.
      </span>
    </div>

    <Teleport to="body">
      <div
        v-if="openId !== null"
        ref="menuRef"
        class="onboarding-action-menu"
        :style="menuStyle"
      >
        <button
          type="button"
          @click="handleAction('view')"
        >
          <Eye :size="15" />
          View Onboarding
        </button>

        <template
          v-if="
            records.find(item => item.id === openId)?.status !==
            'Completed'
          "
        >
          <button
            type="button"
            @click="handleAction('edit')"
          >
            <Pencil :size="15" />
            Edit Onboarding
          </button>

          <button
            type="button"
            @click="handleAction('status')"
          >
            <RefreshCw :size="15" />
            Update Status
          </button>

          <div class="menu-divider" />

          <button
            type="button"
            class="complete-action"
            @click="handleAction('complete')"
          >
            <CheckCircle2 :size="15" />
            Complete Onboarding
          </button>
        </template>
      </div>
    </Teleport>
  </article>
</template>

<style scoped>
.table-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.table-heading {
  padding: 15px 17px;
  border-bottom: 1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
}

.table-heading p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

.onboarding-table {
  width: 100%;
  min-width: 1120px;
  border-collapse: collapse;
}

.onboarding-table th {
  padding: 12px 13px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 9px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

.onboarding-table td {
  padding: 12px 13px;
  border-bottom: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 10px;
  vertical-align: middle;
}

.onboarding-table tbody tr:last-child td {
  border-bottom: 0;
}

.onboarding-table tbody tr:hover {
  background: var(--bg-card-soft);
}

.onboarding-number {
  color: var(--primary);
  font-size: 10px;
  white-space: nowrap;
}

.employee-cell {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 200px;
}

.employee-avatar {
  display: flex;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--primary-soft);
  color: var(--primary);
}

.employee-info {
  min-width: 0;
}

.employee-info strong,
.employee-info span {
  display: block;
}

.employee-info strong {
  color: var(--text-primary);
  font-size: 10px;
}

.employee-info span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 9px;
}

.employee-email {
  display: flex !important;
  align-items: center;
  gap: 4px;
}

.department-name {
  color: var(--text-primary);
  white-space: nowrap;
}

.employment-badge {
  display: inline-flex;
  padding: 5px 9px;
  border-radius: 20px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 9px;
  font-weight: 650;
  white-space: nowrap;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.date-cell svg {
  color: var(--text-muted);
}

.target-date svg {
  color: var(--orange);
}

.target-date strong {
  color: var(--text-primary);
  font-weight: 650;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 9px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 650;
  white-space: nowrap;
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.status-badge.completed {
  background: var(--green-soft);
  color: var(--green);
}

.status-badge.for-completion {
  background: var(--purple-soft);
  color: var(--purple);
}

.status-badge.in-progress {
  background: var(--primary-soft);
  color: var(--primary);
}

.status-badge.on-hold {
  background: var(--red-soft);
  color: var(--red);
}

.status-badge.not-started {
  background: var(--orange-soft);
  color: var(--orange);
}

.remarks {
  max-width: 190px;
  margin: 0;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 10px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.action-column {
  width: 70px;
  text-align: center !important;
}

.action-button {
  display: inline-flex;
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

.action-button:hover {
  background: var(--primary-soft);
  color: var(--primary);
}

.empty-state {
  display: flex;
  min-height: 230px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 20px;
  color: var(--text-muted);
}

.empty-state strong {
  color: var(--text-primary);
  font-size: 12px;
}

.empty-state span {
  font-size: 10px;
}
</style>

<style>
.onboarding-action-menu {
  position: fixed;
  z-index: 10020;
  width: 195px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
}

.onboarding-action-menu button {
  display: flex;
  width: 100%;
  min-height: 36px;
  align-items: center;
  gap: 9px;
  padding: 0 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 11px;
  text-align: left;
  cursor: pointer;
}

.onboarding-action-menu button:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.onboarding-action-menu .complete-action {
  color: var(--green);
}

.onboarding-action-menu .menu-divider {
  margin: 5px 4px;
  border-top: 1px solid var(--border-soft);
}
</style>
