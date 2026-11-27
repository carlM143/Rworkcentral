<script setup lang="ts">
import { computed } from 'vue'
import { ShieldCheck, Info } from 'lucide-vue-next'
import type { LeaveApproval } from '~/types/leaveApproval'
import DepartmentOverrideDialog from './DepartmentOverrideDialog.vue'

const props = defineProps<{
  approvals?: LeaveApproval['department_approvals']
  departmentStatus?: string | null
  status: string
  reviewedBy?: string | null
  reviewedAt?: string | null
  requestType?: 'leave' | 'overtime' | 'undertime'
  requestId?: number
}>()
const emit = defineEmits<{ overridden: [] }>()
const { can } = useAuth()
const overrideOpen = ref(false)
const showOverride = computed(() => props.requestType && props.requestId && props.status.toLowerCase() === 'pending'
  && props.departmentStatus === 'pending' && can('approvals', 'department_override.approve')
  && can('approvals', `${props.requestType === 'leave' ? 'leaves' : props.requestType}.approve`))

const hrStatus = computed(() => {
  const s = props.status?.toLowerCase() || ''
  if (s === 'pending') {
    return props.departmentStatus === 'pending'
      ? { label: 'Waiting for department', badge: 'neutral' }
      : { label: 'Pending HR approval', badge: 'pending' }
  }
  if (s === 'approved') return { label: 'Approved', badge: 'approved' }
  if (s === 'rejected') {
    return props.reviewedBy
      ? { label: 'Rejected', badge: 'rejected' }
      : { label: 'Not required', badge: 'neutral' }
  }
  return { label: props.status || 'Pending', badge: 'neutral' }
})

const badgeClass = (st?: string | null) => {
  const s = st?.toLowerCase() || ''
  if (s === 'approved') return 'badge-approved'
  if (s === 'rejected') return 'badge-rejected'
  if (s === 'pending') return 'badge-pending'
  return 'badge-neutral'
}

const formatDate = (val?: string | null) => {
  if (!val) return ''
  const parsed = new Date(val.includes('T') || val.includes(' ') ? val.replace(' ', 'T') : `${val}T12:00:00`)
  return Number.isNaN(parsed.getTime())
    ? val
    : new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        ...(val.includes(':') ? { hour: 'numeric', minute: '2-digit' } : {}),
      }).format(parsed)
}
</script>

<template>
  <article class="approval-card">
    <div class="card-header">
      <div class="header-icon">
        <ShieldCheck :size="18" />
      </div>
      <div>
        <h3 class="card-title">Approval Progress</h3>
        <p class="card-subtitle">All assigned department approvers, followed by HR final approval.</p>
      </div>
    </div>

    <div class="card-body">
      <!-- Department Approvers list -->
      <div v-if="approvals && approvals.length" class="approvers-list">
        <div v-for="(approver, index) in approvals" :key="index" class="approver-item">
          <div class="approver-info">
            <span class="approver-name">{{ approver.approver_name }}</span>
            <span class="approver-position">{{ approver.approver_position || 'No position recorded' }}</span>
            <p v-if="approver.remarks" class="approver-remarks">“{{ approver.remarks }}”</p>
          </div>
          <div class="approver-meta">
            <span class="badge" :class="badgeClass(approver.status)">
              <span class="badge-dot" />
              {{ approver.status }}
            </span>
            <span v-if="approver.acted_at" class="meta-date">{{ formatDate(approver.acted_at) }}</span>
          </div>
        </div>
      </div>

      <!-- No individual approvers notice -->
      <div v-else class="empty-notice">
        <Info :size="15" />
        <span>{{ departmentStatus === 'skipped' ? 'Department approval skipped; routed directly to HR.' : 'No individual department approval records available.' }}</span>
      </div>

      <!-- HR Override Alert -->
      <div v-if="departmentStatus === 'overridden'" class="override-alert">
        <Info :size="15" />
        <span>Department approval was skipped.</span>
      </div>
      <div v-if="showOverride" class="override-action">
        <button type="button" @click="overrideOpen = true">Skip department approval</button>
      </div>
      <DepartmentOverrideDialog v-if="requestType && requestId" :open="overrideOpen" :type="requestType" :id="requestId" @close="overrideOpen = false" @saved="emit('overridden')" />

      <!-- HR Final Approval Row -->
      <div class="approver-item hr-item">
        <div class="approver-info">
          <span class="approver-name">HR — Final Approval</span>
          <span v-if="reviewedBy" class="approver-position">Reviewed by {{ reviewedBy }}</span>
          <span v-else class="approver-position">Human Resources Department</span>
        </div>
        <div class="approver-meta">
          <span class="badge" :class="`badge-${hrStatus.badge}`">
            <span class="badge-dot" />
            {{ hrStatus.label }}
          </span>
          <span v-if="reviewedAt" class="meta-date">{{ formatDate(reviewedAt) }}</span>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.override-action { margin-top: 12px; }
.override-action button { padding: 8px 12px; border: 1px solid var(--orange); border-radius: 8px; color: var(--orange); background: transparent; cursor: pointer; font: inherit; font-size: 12px; }
.override-action p { color: var(--red); font-size: 12px; }
.approval-card {
  margin-bottom: 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-soft);
  background: var(--bg-card-soft, transparent);
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--primary-soft, rgba(37, 99, 235, 0.1));
  color: var(--primary, #2563eb);
  flex-shrink: 0;
}

.card-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.25;
}

.card-subtitle {
  margin: 3px 0 0;
  font-size: 12px;
  color: var(--text-secondary);
}

.card-body {
  padding: 6px 18px 12px;
}

.approvers-list {
  display: flex;
  flex-direction: column;
}

.approver-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-soft);
}

.approver-item.hr-item {
  border-bottom: none;
  padding-top: 14px;
}

.approver-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.approver-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.35;
}

.approver-position {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.approver-remarks {
  margin: 4px 0 0;
  font-size: 11px;
  color: var(--text-muted);
  font-style: italic;
  overflow-wrap: anywhere;
}

.approver-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  text-transform: capitalize;
  white-space: nowrap;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}

.badge-approved {
  background: var(--green-soft, rgba(16, 185, 129, 0.12));
  color: var(--green, #10b981);
}

.badge-pending {
  background: var(--orange-soft, rgba(245, 158, 11, 0.12));
  color: var(--orange, #f59e0b);
}

.badge-rejected {
  background: var(--red-soft, rgba(239, 68, 68, 0.12));
  color: var(--red, #ef4444);
}

.badge-neutral {
  background: var(--bg-card-soft, rgba(148, 163, 184, 0.1));
  color: var(--text-secondary, #94a3b8);
  border: 1px solid var(--border-soft, transparent);
}

.meta-date {
  font-size: 11px;
  color: var(--text-muted);
}

.override-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin: 10px 0;
  border-radius: 8px;
  background: var(--orange-soft, rgba(245, 158, 11, 0.1));
  color: var(--orange, #f59e0b);
  font-size: 12px;
  font-weight: 500;
}

.override-alert svg {
  flex-shrink: 0;
}

.empty-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  color: var(--text-muted);
  font-size: 12px;
  border-bottom: 1px solid var(--border-soft);
}

@media (max-width: 580px) {
  .approver-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .approver-meta {
    align-items: flex-start;
  }
}
</style>
