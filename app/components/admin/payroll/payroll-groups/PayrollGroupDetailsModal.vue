<script setup lang="ts">
import { X, Users, CalendarDays, ReceiptText } from 'lucide-vue-next'

import type {
  PayrollGroup,
} from '~/types/payroll/payroll-groups/payrollGroup'

defineProps<{
  open: boolean
  group: PayrollGroup | null
}>()

const emit = defineEmits<{
  close: []
  employees: [group: PayrollGroup]
}>()

const frequencyLabel = (value: string) => {
  const labels: Record<string, string> = {
    weekly: 'Weekly',
    bi_weekly: 'Bi-weekly',
    semi_monthly: 'Semi-monthly',
    monthly: 'Monthly',
  }

  return labels[value] || value
}

const formatDate = (value?: string) => {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && group"
      class="details-overlay"
      @click.self="emit('close')"
    >
      <section class="details-card">
        <header class="details-header">
          <div>
            <h3>Payroll Group Details</h3>
            <p>Group information and payroll statistics.</p>
          </div>

          <button @click="emit('close')">
            <X :size="18" />
          </button>
        </header>

        <div class="details-body">
          <div class="group-identity">
            <div class="identity-icon">
              <Users :size="24" />
            </div>

            <div>
              <h2>{{ group.group_name }}</h2>
              <span>#{{ group.id }}</span>
            </div>

            <span
              class="status"
              :class="group.is_active ? 'active' : 'inactive'"
            >
              {{ group.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <CalendarDays :size="17" />
              <span>Pay Frequency</span>
              <strong>{{ frequencyLabel(group.frequency) }}</strong>
            </div>

            <div class="info-item">
              <Users :size="17" />
              <span>Current Employees</span>
              <strong>{{ group.current_employee_count ?? 0 }}</strong>
            </div>

            <div class="info-item">
              <ReceiptText :size="17" />
              <span>Payroll Records</span>
              <strong>{{ group.payrolls_count ?? 0 }}</strong>
            </div>
          </div>

          <div class="description">
            <label>Description</label>
            <p>{{ group.description || 'No description provided.' }}</p>
          </div>

          <div class="dates">
            <div>
              <span>Created</span>
              <strong>{{ formatDate(group.created_at) }}</strong>
            </div>

            <div>
              <span>Last Updated</span>
              <strong>{{ formatDate(group.updated_at) }}</strong>
            </div>
          </div>
        </div>

        <footer>
          <AppButton
            variant="secondary"
            @click="emit('close')"
          >
            Close
          </AppButton>

          <AppButton
            :icon="Users"
            @click="emit('employees', group)"
          >
            Manage Employees
          </AppButton>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.details-overlay {
  position: fixed;
  z-index: 100000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(0, 0, 0, .55);
}

.details-card {
  width: min(540px, 100%);
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
}

.details-header,
.details-card footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 16px 19px;
  border-bottom: 1px solid var(--border-soft);
}

.details-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 14px;
}

.details-header p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.details-header button {
  border: 0;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.details-body {
  display: grid;
  gap: 20px;
  padding: 20px;
}

.group-identity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.identity-icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 10px;
  background: var(--primary-soft);
  color: var(--primary);
}

.group-identity h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
}

.group-identity span {
  color: var(--text-muted);
  font-size: 10px;
}

.status {
  margin-left: auto;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 10px !important;
}

.active {
  background: rgb(34 197 94 / 12%);
  color: #22c55e;
}

.inactive {
  background: rgb(248 113 113 / 12%);
  color: #f87171;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
}

.info-item {
  display: grid;
  gap: 7px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--primary);
}

.info-item span,
.dates span {
  color: var(--text-muted);
  font-size: 10px;
}

.info-item strong,
.dates strong {
  color: var(--text-primary);
  font-size: 12px;
}

.description label {
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 600;
}

.description p {
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.dates {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.dates div {
  display: grid;
  gap: 5px;
}

.details-card footer {
  justify-content: flex-end;
  border-top: 1px solid var(--border-soft);
  border-bottom: 0;
}

@media (max-width: 480px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>