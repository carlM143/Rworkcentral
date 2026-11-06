
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  ArrowRight, ArrowLeftRight, Building2, CalendarDays,
  MoreHorizontal, Eye, Pencil, CheckCircle2, XCircle,
  PlayCircle, Ban, Trash2,
} from 'lucide-vue-next'
import type { EmployeeTransfer } from '~/types/employeeTransfer'

type ActionName =
  | 'view' | 'edit' | 'approve' | 'reject'
  | 'apply' | 'cancel' | 'delete'

interface ActionItem {
  type: ActionName
  label: string
  icon: any
  danger?: boolean
}

defineProps<{ transfers: EmployeeTransfer[] }>()

const emit = defineEmits<{
  action: [payload: { type: ActionName; transfer: EmployeeTransfer }]
}>()

const menu = ref<{
  transfer: EmployeeTransfer
  top: number
  left: number
} | null>(null)

const today = () => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const value = (type: string) =>
    parts.find(part => part.type === type)?.value || ''

  return `${value('year')}-${value('month')}-${value('day')}`
}

const isDue = (item: EmployeeTransfer) =>
  item.effective_date.slice(0, 10) <= today()

const getActions = (item: EmployeeTransfer): ActionItem[] => {
  const actions: ActionItem[] = [
    { type: 'view', label: 'View Transfer', icon: Eye },
  ]

  if (['pending', 'scheduled'].includes(item.status)) {
    actions.push({ type: 'edit', label: 'Edit Transfer', icon: Pencil })
  }

  if (item.status === 'pending') {
    actions.push(
      { type: 'approve', label: 'Approve Request', icon: CheckCircle2 },
      { type: 'reject', label: 'Reject Request', icon: XCircle, danger: true },
    )
  }

  if (['approved', 'scheduled'].includes(item.status) && isDue(item)) {
    actions.push({
      type: 'apply', label: 'Apply Department Transfer', icon: PlayCircle,
    })
  }

  if (['pending', 'approved', 'scheduled'].includes(item.status)) {
    actions.push({ type: 'cancel', label: 'Cancel Transfer', icon: Ban, danger: true })
  }

  if (['pending', 'scheduled'].includes(item.status)) {
    actions.push({ type: 'delete', label: 'Delete Transfer', icon: Trash2, danger: true })
  }

  return actions
}

const openMenu = (item: EmployeeTransfer, event: MouseEvent) => {
  if (menu.value?.transfer.id === item.id) {
    menu.value = null
    return
  }

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const width = 235
  const height = getActions(item).length * 40 + 12

  menu.value = {
    transfer: item,
    left: Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8)),
    top: rect.bottom + height + 8 > window.innerHeight
      ? Math.max(8, rect.top - height - 6)
      : rect.bottom + 6,
  }
}

const selectAction = (type: ActionName) => {
  if (!menu.value) return
  const transfer = menu.value.transfer
  menu.value = null
  emit('action', { type, transfer })
}

const closeMenu = () => { menu.value = null }

const onOutsideClick = (event: MouseEvent) => {
  const target = event.target
  if (!(target instanceof Element)) return
  if (target.closest('.transfer-more-btn, .transfer-popup-menu')) return
  closeMenu()
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeMenu()
}

onMounted(() => {
  document.addEventListener('click', onOutsideClick)
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('scroll', closeMenu, true)
  window.addEventListener('resize', closeMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', onOutsideClick)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('scroll', closeMenu, true)
  window.removeEventListener('resize', closeMenu)
})

const departmentName = (item: EmployeeTransfer, type: 'from' | 'to') => {
  const department = type === 'from'
    ? item.from_department
    : item.to_department

  const id = type === 'from'
    ? item.from_department_id
    : item.to_department_id

  return department?.department_name ||
    department?.name ||
    `Department #${id}`
}

const employeeName = (item: EmployeeTransfer) =>
  [item.employee?.firstname, item.employee?.lastname]
    .filter(Boolean).join(' ') || `Employee #${item.employee_id}`

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en-PH', {
        month: 'short', day: 'numeric', year: 'numeric',
      }).format(date)
}

const statusLabel = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1)
</script>

<template>
  <article class="transfer-card">
    <header class="transfer-heading">
      <div>
        <h3>Employee Department Transfers</h3>
        <p>Review department movements and manage transfer approvals.</p>
      </div>
      <span class="record-count">{{ transfers.length }} on this page</span>
    </header>

    <div v-if="transfers.length" class="table-scroll">
      <table class="transfer-table">
        <thead>
          <tr>
            <th>Transfer / Employee</th>
            <th>From Department</th>
            <th>To Department</th>
            <th>Effective Date</th>
            <th>Status</th>
            <th>Created By</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in transfers" :key="item.id">
            <td>
              <div class="employee-cell">
                <strong>{{ employeeName(item) }}</strong>
                <span>EMP {{ item.employee?.emp_id ?? item.employee_id }}</span>
                <small>TRF-{{ String(item.id).padStart(5, '0') }}</small>
              </div>
            </td>

            <td>
              <div class="department-chip">
                <Building2 :size="14" />
                {{ departmentName(item, 'from') }}
              </div>
            </td>

            <td>
              <div class="department-chip destination">
                <ArrowRight :size="14" />
                {{ departmentName(item, 'to') }}
              </div>
            </td>

            <td>
              <div class="date-cell">
                <CalendarDays :size="14" />
                {{ formatDate(item.effective_date) }}
              </div>
            </td>

            <td>
              <div class="status-cell">
                <span class="status-pill" :class="item.status">
                  <span class="dot" />
                  {{ statusLabel(item.status) }}
                </span>
                <small v-if="item.status === 'approved'">Awaiting application</small>
                <small v-else-if="item.status === 'scheduled'">Future direct transfer</small>
                <small v-else-if="item.status === 'applied'">Department updated</small>
              </div>
            </td>

            <td class="person-cell">
              {{ item.creator?.name || `User #${item.created_by}` }}
            </td>

            <td>
              <button
                class="transfer-more-btn"
                type="button"
                :aria-label="`Actions for transfer ${item.id}`"
                :aria-expanded="menu?.transfer.id === item.id"
                aria-haspopup="menu"
                @click.stop="openMenu(item, $event)"
              >
                <MoreHorizontal :size="19" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <ArrowLeftRight :size="30" />
      <strong>No employee transfers found</strong>
      <span>Try adjusting your filters or create a new department transfer.</span>
    </div>

    <Teleport to="body">
      <div
        v-if="menu"
        class="transfer-popup-menu"
        role="menu"
        :style="{ top: `${menu.top}px`, left: `${menu.left}px` }"
      >
        <button
          v-for="item in getActions(menu.transfer)"
          :key="item.type"
          type="button"
          role="menuitem"
          :class="{ danger: item.danger }"
          @click="selectAction(item.type)"
        >
          <component :is="item.icon" :size="15" />
          {{ item.label }}
        </button>
      </div>
    </Teleport>
  </article>
</template>

<style scoped>
.transfer-card{overflow:hidden;border:1px solid var(--border);border-radius:11px;background:var(--bg-card);box-shadow:var(--shadow)}
.transfer-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 17px;border-bottom:1px solid var(--border-soft)}
.transfer-heading h3{margin:0;color:var(--text-primary);font-size:15px}
.transfer-heading p{margin:5px 0 0;color:var(--text-muted);font-size:11px}
.record-count{color:var(--text-muted);font-size:10px;white-space:nowrap}
.table-scroll{overflow-x:auto}
.transfer-table{width:100%;min-width:1050px;border-collapse:collapse}
.transfer-table th{padding:13px 14px;text-align:left;background:var(--bg-card-soft);color:var(--text-secondary);font-size:10px;text-transform:uppercase;white-space:nowrap}
.transfer-table td{padding:16px 14px;border-top:1px solid var(--border-soft);color:var(--text-secondary);font-size:12px;vertical-align:middle}
.transfer-table tbody tr:hover{background:var(--bg-card-soft)}
.employee-cell{display:flex;min-width:145px;flex-direction:column;gap:5px}
.employee-cell strong{color:var(--text-primary);font-size:12px}
.employee-cell span,.employee-cell small{color:var(--text-muted);font-size:10px}
.employee-cell small{color:var(--primary)}
.department-chip{display:inline-flex;align-items:center;gap:8px;min-width:140px;padding:9px;border:1px solid var(--border);border-radius:7px;background:var(--bg-card-soft);color:var(--text-primary);font-size:11px}
.department-chip svg{flex-shrink:0;color:var(--text-muted)}
.department-chip.destination{background:var(--primary-soft);color:var(--primary)}
.date-cell{display:flex;align-items:center;gap:7px;white-space:nowrap}
.status-cell{display:flex;flex-direction:column;align-items:flex-start;gap:6px}
.status-cell small{color:var(--text-muted);font-size:10px;white-space:nowrap}
.status-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:7px;font-size:10px;font-weight:700;text-transform:capitalize}
.dot{width:6px;height:6px;border-radius:50%;background:currentColor}
.status-pill.pending{background:var(--orange-soft,#fef3c7);color:var(--orange,#b45309)}
.status-pill.approved,.status-pill.scheduled{background:var(--primary-soft);color:var(--primary)}
.status-pill.applied{background:var(--green-soft,#dcfce7);color:var(--green,#15803d)}
.status-pill.rejected{background:var(--red-soft,#fee2e2);color:var(--red,#dc2626)}
.status-pill.cancelled{background:var(--bg-card-soft);color:var(--text-muted)}
.person-cell{white-space:nowrap}
.transfer-more-btn{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid var(--border);border-radius:8px;background:var(--bg-card);color:var(--text-secondary);cursor:pointer}
.transfer-more-btn:hover{background:var(--bg-card-soft);color:var(--primary)}
.empty-state{display:flex;min-height:240px;flex-direction:column;align-items:center;justify-content:center;gap:9px;color:var(--text-muted);text-align:center}
.empty-state strong{color:var(--text-primary);font-size:13px}
.empty-state span{font-size:11px}
</style>

<style>
.transfer-popup-menu{position:fixed;z-index:99999;width:235px;padding:6px;border:1px solid var(--border);border-radius:10px;background:var(--bg-card);box-shadow:0 18px 50px rgba(0,0,0,.28)}
.transfer-popup-menu button{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;border:0;border-radius:7px;background:transparent;color:var(--text-primary);font-family:inherit;font-size:11px;text-align:left;cursor:pointer}
.transfer-popup-menu button:hover{background:var(--bg-card-soft);color:var(--primary)}
.transfer-popup-menu button.danger{color:var(--red,#dc2626)}
</style>
