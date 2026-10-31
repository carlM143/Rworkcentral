<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ClipboardList, Eye, MoreHorizontal, RotateCcw } from 'lucide-vue-next'
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import type { LeaveApproval } from '~/types/leaveApproval'

const props = withDefaults(defineProps<{
  requests: LeaveApproval[]
  statusFilter?: string
  approving?: boolean
}>(), {
  statusFilter: '',
  approving: false,
})

const emit = defineEmits<{
  review: [request: LeaveApproval]
  revert: [request: LeaveApproval]
}>()

const openMenuId = ref<number | null>(null)
const menuStyle = ref<Record<string, string>>({})
const menuRef = ref<HTMLElement | null>(null)
let triggerElement: HTMLElement | null = null

const openRequest = computed(() =>
  props.requests.find(item => item.id === openMenuId.value) ?? null,
)

const canShowUndo = computed(() =>
  openRequest.value?.status === 'approved' || openRequest.value?.status === 'rejected',
)

// Position the menu outside the scrollable table so it is never clipped.
const positionMenu = () => {
  if (!triggerElement || !openRequest.value || !import.meta.client) return

  const rect = triggerElement.getBoundingClientRect()
  const width = 220
  const height = canShowUndo.value ? 94 : 48
  const spaceBelow = window.innerHeight - rect.bottom
  const top = spaceBelow >= height + 12
    ? rect.bottom + 6
    : rect.top - height - 6
  const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8))

  menuStyle.value = {
    position: 'fixed',
    left: `${left}px`,
    top: `${Math.max(8, top)}px`,
    width: `${width}px`,
    zIndex: '10000',
  }
}

const closeMenu = () => {
  openMenuId.value = null
  triggerElement = null
}

const toggleMenu = async (item: LeaveApproval, event: MouseEvent) => {
  if (props.approving) return
  if (openMenuId.value === item.id) {
    closeMenu()
    return
  }

  triggerElement = event.currentTarget as HTMLElement
  openMenuId.value = item.id
  await nextTick()
  positionMenu()
}

const openDetails = (item: LeaveApproval | null) => {
  if (!item) return
  closeMenu()
  emit('review', item)
}

const revertRequest = (item: LeaveApproval | null) => {
  if (!item) return
  closeMenu()
  emit('revert', item)
}

const onPointerDown = (event: PointerEvent) => {
  const target = event.target as Node | null
  if (target && (menuRef.value?.contains(target) || triggerElement?.contains(target))) return
  closeMenu()
}

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeMenu()
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', onKeyDown)
  window.addEventListener('resize', closeMenu)
  window.addEventListener('scroll', closeMenu, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('resize', closeMenu)
  window.removeEventListener('scroll', closeMenu, true)
})

watch(() => props.requests, closeMenu)

const formatDate = (value: string | null | undefined) => {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-PH', {
        month: 'short', day: 'numeric', year: 'numeric',
      }).format(date)
}

const formatRequestedPay = (value: string | null | undefined) => {
  if (value === 'paid') return 'Paid Leave'
  if (value === 'unpaid') return 'Unpaid Leave'
  if (value === 'mixed') return 'Mixed Leave'
  return 'Not specified'
}
</script>

<template>
  <BaseDataTable
    title="Leave Requests"
    description="Review employee leave requests and their requested payment treatment."
    :has-rows="requests.length > 0"
    min-width="1100px"
  >
    <template #headers>
      <th>Request No.</th>
      <th>Employee</th>
      <th>Employee ID</th>
      <th>Leave Type</th>
      <th>Request Date</th>
      <th>Requested Pay</th>
      <th>Status</th>
      <th class="actions-header">Actions</th>
    </template>

    <template #rows>
      <tr v-for="item in requests" :key="item.id">
        <td><span class="request-number">{{ item.request_no }}</span></td>
        <td><strong class="table-emphasis">{{ item.employee?.name || 'Unknown Employee' }}</strong></td>
        <td>{{ item.employee?.emp_id ?? '—' }}</td>
        <td>{{ item.leave_type }}</td>
        <td>{{ formatDate(item.request_date) }}</td>
        <td>
          <span class="pay-badge" :class="item.requested_pay_type">
            {{ formatRequestedPay(item.requested_pay_type) }}
          </span>
        </td>
        <td>
          <span class="status-badge" :class="item.status">
            <span class="status-dot" />
            {{ item.status }}
          </span>
        </td>
        <td class="actions-cell">
          <button
            type="button"
            class="table-action-button"
            :disabled="approving"
            :aria-label="`Actions for ${item.request_no}`"
            :aria-expanded="openMenuId === item.id"
            aria-haspopup="menu"
            @click="toggleMenu(item, $event)"
          >
            <MoreHorizontal :size="17" />
          </button>
        </td>
      </tr>
    </template>

    <template #empty>
      <div class="empty-content">
        <ClipboardList :size="30" />
        <strong>No Leave Requests Found</strong>
        <span>
          {{ statusFilter === 'pending'
            ? 'There are no pending leave requests.'
            : 'No records match your selected filters.' }}
        </span>
      </div>
    </template>
  </BaseDataTable>

  <!-- Teleport keeps the actions menu visible even on the bottom table row. -->
  <Teleport to="body">
    <div
      v-if="openRequest"
      ref="menuRef"
      class="leave-actions-menu"
      :style="menuStyle"
      role="menu"
      :aria-label="`Actions for ${openRequest.request_no}`"
    >
      <button type="button" role="menuitem" @click="openDetails(openRequest)">
        <Eye :size="15" />
        View Details
      </button>

      <button
        v-if="canShowUndo"
        type="button"
        role="menuitem"
        :disabled="approving"
        @click="revertRequest(openRequest)"
      >
        <RotateCcw :size="15" />
        Undo / Revert
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.request-number {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}
.table-emphasis { color: var(--text-primary); font-size: 13px; font-weight: 650; }
.pay-badge, .status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
  text-transform: capitalize;
}
.pay-badge.paid, .status-badge.approved { background: var(--green-soft, #0a3725); color: var(--green, #22c55e); }
.pay-badge.unpaid, .status-badge.cancelled { background: var(--bg-card-soft); color: var(--text-secondary); }
.pay-badge.mixed, .status-badge.pending { background: var(--orange-soft, #423019); color: var(--orange, #fbbf24); }
.status-badge.rejected { background: var(--red-soft, #3f2028); color: var(--red, #f87171); }
.status-dot { width: 6px; height: 6px; flex: 0 0 6px; border-radius: 50%; background: currentColor; }
.actions-cell, .actions-header { text-align: right !important; }
.actions-cell .table-action-button { display: inline-grid; }
.empty-content { display: flex; flex-direction: column; align-items: center; gap: 9px; }
.empty-content strong { font-size: 14px; }
.empty-content span { font-size: 12px; }
.leave-actions-menu {
  padding: 6px;
  border: 1px solid var(--border, #29364d);
  border-radius: 10px;
  background: var(--bg-card, #131e30);
  box-shadow: 0 14px 32px rgb(0 0 0 / 25%);
}
.leave-actions-menu button {
  display: flex;
  width: 100%;
  min-height: 40px;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--text-primary, #f8fafc);
  font: inherit;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
}
.leave-actions-menu button:hover:not(:disabled) { background: var(--bg-card-soft, #182438); color: var(--primary); }
.menu-disabled-item { border-top: 1px solid var(--border-soft, #253247); padding-top: 3px; margin-top: 3px; }
.menu-disabled-item button { color: var(--text-muted, #7c8da8); opacity: .6; cursor: not-allowed; }
</style>
