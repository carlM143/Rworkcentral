<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Clock, Eye, MoreHorizontal, RotateCcw, Timer } from 'lucide-vue-next'
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import type { OvertimeApproval } from '~/types/overtimeApproval'

const props = defineProps<{
  requests: OvertimeApproval[]
  approvingId?: number | null
}>()
const emit = defineEmits<{
  review: [request: OvertimeApproval]
  revert: [request: OvertimeApproval]
}>()

const openMenuId = ref<number | null>(null)
const menuStyle = ref<Record<string, string>>({})
const menuRef = ref<HTMLElement | null>(null)
let triggerElement: HTMLElement | null = null

const openRequest = computed(() => props.requests.find(item => item.id === openMenuId.value) ?? null)
const canShowUndo = computed(() => openRequest.value?.status === 'Approved' || openRequest.value?.status === 'Rejected')

const positionMenu = () => {
  if (!triggerElement || !openRequest.value || !import.meta.client) return
  const rect = triggerElement.getBoundingClientRect()
  const width = 220
  const height = canShowUndo.value ? 94 : 48
  const top = window.innerHeight - rect.bottom >= height + 12 ? rect.bottom + 6 : rect.top - height - 6
  const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8))
  menuStyle.value = { position: 'fixed', left: `${left}px`, top: `${Math.max(8, top)}px`, width: `${width}px`, zIndex: '10000' }
}
const closeMenu = () => { openMenuId.value = null; triggerElement = null }
const toggleMenu = async (item: OvertimeApproval, event: MouseEvent) => {
  if (props.approvingId !== null && props.approvingId !== undefined) return
  if (openMenuId.value === item.id) { closeMenu(); return }
  triggerElement = event.currentTarget as HTMLElement
  openMenuId.value = item.id
  await nextTick()
  positionMenu()
}
const openDetails = (item: OvertimeApproval | null) => { if (item) { closeMenu(); emit('review', item) } }
const revertRequest = (item: OvertimeApproval | null) => { if (item) { closeMenu(); emit('revert', item) } }
const onPointerDown = (event: PointerEvent) => {
  const target = event.target as Node | null
  if (target && (menuRef.value?.contains(target) || triggerElement?.contains(target))) return
  closeMenu()
}
const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') closeMenu() }
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

const formatDate = (value: string) => {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}
const formatTime = (value?: string) => {
  if (!value) return '—'
  const match = value.match(/(?:T|\s|^)(\d{1,2}):(\d{2})(?::\d{2})?/)
  if (!match) return value
  const hour = Number(match[1])
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return value
  return `${hour % 12 || 12}:${match[2]} ${hour >= 12 ? 'PM' : 'AM'}`
}
</script>

<template>
  <BaseDataTable
    title="Overtime Approval Requests"
    description="Review requested overtime hours, schedules and approval status."
    :has-rows="requests.length > 0"
    min-width="1150px"
  >
    <template #headers>
      <th>OT No.</th><th>Employee</th><th>Position</th><th>Department</th><th>OT Schedule</th><th>Hours</th><th>Reason</th><th>Status</th><th class="actions-header">Actions</th>
    </template>
    <template #rows>
      <tr v-for="item in requests" :key="item.id">
        <td><span class="request-number">{{ item.requestNumber }}</span></td>
        <td><strong class="table-emphasis">{{ item.employeeName }}</strong></td>
        <td>{{ item.position || '—' }}</td>
        <td>{{ item.department || '—' }}</td>
        <td><div class="schedule-cell"><strong>{{ formatDate(item.overtimeDate) }}</strong><span><Clock :size="13" />{{ formatTime(item.startTime) }} – {{ formatTime(item.endTime) }}</span></div></td>
        <td><span class="hours-badge"><Timer :size="13" />{{ item.approvedHours ?? item.requestedHours }} hrs</span></td>
        <td><p class="reason" :title="item.reason || ''">{{ item.reason || '—' }}</p></td>
        <td><span class="status-badge" :class="item.status.toLowerCase().replace(/\s+/g, '-')"><span class="status-dot" />{{ item.status }}</span></td>
        <td class="actions-cell"><button type="button" class="table-action-button" :disabled="approvingId !== null && approvingId !== undefined" :aria-label="`Actions for ${item.requestNumber}`" :aria-expanded="openMenuId === item.id" aria-haspopup="menu" @click="toggleMenu(item, $event)"><MoreHorizontal :size="17" /></button></td>
      </tr>
    </template>
    <template #empty><div class="empty-content"><Timer :size="30" /><strong>No Overtime Requests Found</strong><span>No overtime records match the selected filters.</span></div></template>
  </BaseDataTable>

  <Teleport to="body">
    <div v-if="openRequest" ref="menuRef" class="overtime-actions-menu" :style="menuStyle" role="menu" :aria-label="`Actions for ${openRequest.requestNumber}`">
      <button type="button" role="menuitem" @click="openDetails(openRequest)"><Eye :size="15" /> View Details</button>
      <button v-if="canShowUndo" type="button" role="menuitem" :disabled="approvingId === openRequest.id" @click="revertRequest(openRequest)"><RotateCcw :size="15" /> Undo / Revert</button>
    </div>
  </Teleport>
</template>

<style scoped>
.request-number{font-size:13px;font-weight:600;white-space:nowrap}.table-emphasis{color:var(--text-primary);font-size:13px;font-weight:650}.schedule-cell{min-width:190px}.schedule-cell strong,.schedule-cell span{display:block}.schedule-cell span{display:inline-flex;align-items:center;gap:5px;margin-top:4px;color:var(--text-muted);font-size:12px}.hours-badge,.status-badge{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}.hours-badge{padding:5px 9px;border-radius:7px;background:var(--orange-soft);color:var(--orange);font-size:12px;font-weight:650}.status-badge{padding:5px 9px;border-radius:999px;font-size:12px;font-weight:650}.status-badge.approved{background:var(--green-soft);color:var(--green)}.status-badge.pending,.status-badge.for-review{background:var(--orange-soft);color:var(--orange)}.status-badge.rejected,.status-badge.cancelled{background:var(--red-soft);color:var(--red)}.status-dot{width:6px;height:6px;flex:0 0 6px;border-radius:50%;background:currentColor}.reason{max-width:230px;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.actions-cell,.actions-header{text-align:right!important}.actions-cell .table-action-button{display:inline-grid}.empty-content{display:flex;flex-direction:column;align-items:center;gap:9px}.empty-content strong{font-size:14px}.empty-content span{font-size:12px}.overtime-actions-menu{padding:6px;border:1px solid var(--border,#29364d);border-radius:10px;background:var(--bg-card,#131e30);box-shadow:0 14px 32px rgb(0 0 0 / 25%)}.overtime-actions-menu button{display:flex;width:100%;min-height:40px;align-items:center;gap:10px;padding:9px 10px;border:0;border-radius:7px;background:transparent;color:var(--text-primary,#f8fafc);font:inherit;font-size:12px;text-align:left;cursor:pointer}.overtime-actions-menu button:hover:not(:disabled){background:var(--bg-card-soft,#182438);color:var(--primary)}.overtime-actions-menu button:disabled{opacity:.55;cursor:not-allowed}
</style>
