
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import {
  CalendarDays,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-vue-next'

import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import type { LeavePolicy } from '~/types/leavePolicy'

const props = withDefaults(
  defineProps<{
    policies: LeavePolicy[]
    busy?: boolean
  }>(),
  {
    busy: false,
  },
)

const router = useRouter()

const handleView = () => {
  if (!selectedPolicy.value) return

  const id = selectedPolicy.value.id

  closeActions()

  router.push(
    `/admin/leave-management/leave-policies/${id}/show`
  )
}

const emit = defineEmits<{
  edit: [policy: LeavePolicy]
  delete: [policy: LeavePolicy]
}>()

// FORMAT DATE
const formatDate = (value?: string | null): string => {
  if (!value) return '—'

  const date = new Date(`${value.slice(0, 10)}T00:00:00`)

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

// FORMAT NUMBERS
const formatNumber = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value)

// ACTION MENU
const selectedPolicy = ref<LeavePolicy | null>(null)
const hoveredAction = ref('')

const menuPosition = ref({
  top: 0,
  left: 0,
})

const closeActions = () => {
  selectedPolicy.value = null
  hoveredAction.value = ''
}

const toggleActions = (
  policy: LeavePolicy,
  event: MouseEvent,
) => {
  if (props.busy) return

  if (selectedPolicy.value?.id === policy.id) {
    closeActions()
    return
  }

  const button = event.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()

  const menuWidth = 210
  const menuHeight = 150
  const gap = 6

  menuPosition.value = {
    left: Math.max(
      8,
      Math.min(
        rect.right - menuWidth,
        window.innerWidth - menuWidth - 8,
      ),
    ),
    top:
      rect.bottom + menuHeight + gap <= window.innerHeight
        ? rect.bottom + gap
        : Math.max(8, rect.top - menuHeight - gap),
  }

  selectedPolicy.value = policy
}

// EDIT
const handleEdit = () => {
  if (props.busy || !selectedPolicy.value) return

  const policy = selectedPolicy.value

  closeActions()
  emit('edit', policy)
}

// DELETE
const handleDelete = () => {
  if (props.busy || !selectedPolicy.value) return

  const policy = selectedPolicy.value

  closeActions()
  emit('delete', policy)
}

// CLOSE ON OUTSIDE CLICK
const handleOutsideClick = (event: PointerEvent) => {
  const target = event.target

  if (!(target instanceof Element)) return

  if (
    target.closest('.policy-more-btn') ||
    target.closest('.policy-action-menu')
  ) {
    return
  }

  closeActions()
}

// CLOSE ON ESCAPE
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeActions()
  }
}

// CLOSE WHEN BUSY
watch(
  () => props.busy,
  busy => {
    if (busy) closeActions()
  },
)

// EVENT LISTENERS
onMounted(() => {
  document.addEventListener('pointerdown', handleOutsideClick)
  document.addEventListener('keydown', handleEscape)
  window.addEventListener('resize', closeActions)
  window.addEventListener('scroll', closeActions, true)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', handleOutsideClick)
  document.removeEventListener('keydown', handleEscape)
  window.removeEventListener('resize', closeActions)
  window.removeEventListener('scroll', closeActions, true)
})

// REUSABLE INLINE STYLES
const menuStyle = {
  position: 'fixed' as const,
  zIndex: 2147483647,
  width: '210px',
  padding: '6px',
  border: '1px solid var(--border, #29364d)',
  borderRadius: '10px',
  backgroundColor: 'var(--bg-card, #131e30)',
  boxShadow: '0 14px 35px rgba(0,0,0,0.35)',
}

const actionStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  width: '100%',
  minHeight: '40px',
  padding: '8px 12px',
  border: '0',
  borderRadius: '7px',
  background: 'transparent',
  fontSize: '12px',
  fontWeight: '400',
  textAlign: 'left' as const,
  cursor: 'pointer',
}

const triggerStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '34px',
  height: '34px',
  padding: '0',
  border: '1px solid var(--border, #29364d)',
  borderRadius: '8px',
  background: 'transparent',
  color: 'var(--text-secondary, #a2b0c6)',
  cursor: 'pointer',
}

const noteStyle = {
  display: 'block',
  marginTop: '4px',
  fontSize: '11px',
  fontWeight: '400',
  color: 'var(--text-muted)',
}

const badgeStyle = (
  type: 'positive' | 'negative' | 'neutral' | 'pending',
) => {
  const colors = {
    positive: {
      background: 'var(--green-soft, rgba(34,197,94,.12))',
      color: 'var(--green, #22c55e)',
    },
    negative: {
      background: 'var(--red-soft, rgba(239,68,68,.12))',
      color: 'var(--red, #ef4444)',
    },
    neutral: {
      background: 'var(--bg-card-soft, #182438)',
      color: 'var(--text-secondary, #a2b0c6)',
    },
    pending: {
      background: 'var(--orange-soft, rgba(245,158,11,.12))',
      color: 'var(--orange, #f59e0b)',
    },
  }

  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '500',
    lineHeight: '1.4',
    whiteSpace: 'nowrap' as const,
    ...colors[type],
  }
}
</script>

<template>
  <BaseDataTable
    title="Leave Policies"
    description="Manage employee leave eligibility, credits, carry-over, approvals and validity."
    :has-rows="policies.length > 0"
    min-width="1330px"
    empty-title="No leave policies found"
    empty-description="Create a leave policy or adjust your filters."
  >
    <!-- HEADERS -->
    <template #headers>
      <th>Leave Type</th>
      <th>Employment Type</th>
      <th>Annual Credits</th>
      <th>Eligible</th>
      <th>Pay</th>
      <th>Min. Service</th>
      <th>Effective Dates</th>
      <th>Status</th>
      <th style="text-align: right">Actions</th>
    </template>

    <!-- TABLE ROWS -->
    <template #rows>
      <tr
        v-for="policy in policies"
        :key="policy.id"
      >
        <!-- LEAVE TYPE -->
        <td>
          <div
            style="display:flex;align-items:center;gap:10px;min-width:170px"
          >
            <div>
              <strong
                style="display:block;font-weight:600;color:var(--text-primary)"
              >
                {{ policy.leaveTypeName }}
              </strong>

            </div>
          </div>
        </td>

        <!-- EMPLOYMENT TYPE -->
        <td>
          {{ policy.employmentTypeName }}
        </td>

        <!-- ANNUAL CREDITS -->
        <td>
          {{ formatNumber(policy.annualCredits) }}

          <span :style="noteStyle">
            days
          </span>
        </td>

        <!-- ELIGIBILITY -->
        <td>
          <span
            :style="badgeStyle(
              policy.isEligible ? 'positive' : 'negative'
            )"
          >
            {{ policy.isEligible ? 'Eligible' : 'Not Eligible' }}
          </span>
        </td>

        <!-- PAYMENT -->
        <td>
          <span
            :style="badgeStyle(
              policy.isPaid ? 'positive' : 'neutral'
            )"
          >
            {{ policy.isPaid ? 'Paid' : 'Unpaid' }}
          </span>
        </td>

        <!-- MINIMUM SERVICE -->
        <td>
          {{ policy.minServiceMonths }}

          <span :style="noteStyle">
            months
          </span>
        </td>


        <!-- EFFECTIVE DATES -->
        <td>
          <div
            style="display:flex;align-items:flex-start;gap:8px"
          >
            <CalendarDays
              :size="15"
              style="flex-shrink:0;margin-top:3px;color:var(--text-muted)"
            />

            <div>
              <span
                style="display:block;white-space:nowrap"
              >
                {{ formatDate(policy.effectiveFrom) }}
              </span>

              <span
                :style="{
                  ...noteStyle,
                  whiteSpace: 'nowrap',
                }"
              >
                To: {{ formatDate(policy.effectiveTo) }}
              </span>
            </div>
          </div>
        </td>

        <!-- POLICY STATUS -->
        <td>
          <span
            :style="badgeStyle(
              policy.status === 'approved'
                ? 'positive'
                : 'pending'
            )"
          >
            <span
              style="width:6px;height:6px;border-radius:50%;background:currentColor"
            />

            {{
              policy.status === 'approved'
                ? 'Approved'
                : 'Pending'
            }}
          </span>
        </td>

        <!-- ACTIONS -->
        <td style="text-align:right">
          <button
            type="button"
            class="policy-more-btn"
            :style="{
              ...triggerStyle,
              borderColor:
                selectedPolicy?.id === policy.id
                  ? 'var(--primary, #327bff)'
                  : 'var(--border, #29364d)',
              color:
                selectedPolicy?.id === policy.id
                  ? 'var(--primary, #327bff)'
                  : 'var(--text-secondary, #a2b0c6)',
            }"
            :aria-label="`More actions for ${policy.leaveTypeName} policy`"
            aria-haspopup="menu"
            :aria-expanded="selectedPolicy?.id === policy.id"
            :disabled="busy"
            @click.stop="toggleActions(policy, $event)"
          >
            <MoreHorizontal :size="18" />
          </button>
        </td>
      </tr>
    </template>
  </BaseDataTable>

  <!-- ACTION DROPDOWN -->
  <Teleport to="body">
    <div
      v-if="selectedPolicy"
      class="policy-action-menu"
      role="menu"
      :aria-label="`Actions for ${selectedPolicy.leaveTypeName} policy`"
      :style="{
        ...menuStyle,
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
      }"
    >
      <!-- VIEW -->
      <button
        type="button"
        role="menuitem"
        :disabled="busy"
        :style="{
          ...actionStyle,
          color: 'var(--text-primary, #f8fafc)',
          background:
            hoveredAction === 'view'
              ? 'var(--bg-card-soft, #182438)'
              : 'transparent',
        }"
        @mouseenter="hoveredAction = 'view'"
        @mouseleave="hoveredAction = ''"
        @click="handleView"
      >
        <Eye :size="15" />
        <span>View Policy</span>
      </button>

      <!-- EDIT -->
      <button
        type="button"
        role="menuitem"
        :disabled="busy"
        :style="{
          ...actionStyle,
          color: 'var(--text-primary, #f8fafc)',
          background:
            hoveredAction === 'edit'
              ? 'var(--bg-card-soft, #182438)'
              : 'transparent',
        }"
        @mouseenter="hoveredAction = 'edit'"
        @mouseleave="hoveredAction = ''"
        @click="handleEdit"
      >
        <Pencil :size="15" />
        <span>Edit Policy</span>
      </button>

      <!-- DIVIDER -->
      <div
        style="height:1px;margin:5px 0;background:var(--border-soft,#253247)"
      />

      <!-- DELETE -->
      <button
        type="button"
        role="menuitem"
        :disabled="busy"
        :style="{
          ...actionStyle,
          color: 'var(--red, #ef4444)',
          background:
            hoveredAction === 'delete'
              ? 'var(--red-soft, rgba(239,68,68,0.09))'
              : 'transparent',
        }"
        @mouseenter="hoveredAction = 'delete'"
        @mouseleave="hoveredAction = ''"
        @click="handleDelete"
      >
        <Trash2 :size="15" />
        <span>Delete Policy</span>
      </button>
    </div>
  </Teleport>
</template>
