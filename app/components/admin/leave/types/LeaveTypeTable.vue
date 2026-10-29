
<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { CalendarDays, MoreHorizontal, Pencil, Trash2 } from 'lucide-vue-next'
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import type { LeaveType } from '~/types/leaveType'

const props = withDefaults(defineProps<{
  leaveTypes: LeaveType[]
  busy?: boolean
}>(), {
  busy: false,
})

const emit = defineEmits<{
  edit: [item: LeaveType]
  delete: [item: LeaveType]
}>()

const statusClass = (status: string) =>
  status.toLowerCase() === 'active' ? 'active' : 'inactive'

const formatStatus = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()

  
const openActionId = ref<number | null>(null)
const actionButtonRef = ref<HTMLElement | null>(null)

const menuPosition = ref({
  top: 0,
  left: 0,
})

const closeActions = () => {
  openActionId.value = null
  actionButtonRef.value = null
}

const toggleActions = async (id: number, event: MouseEvent) => {
  if (openActionId.value === id) {
    closeActions()
    return
  }

  actionButtonRef.value = event.currentTarget as HTMLElement
  openActionId.value = id

  await nextTick()

  if (!actionButtonRef.value) return

  const rect = actionButtonRef.value.getBoundingClientRect()
  const menuWidth = 200
  const menuHeight = 100
  const gap = 6

  menuPosition.value = {
    left: Math.max(
      8,
      Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8)
    ),
    top:
      rect.bottom + menuHeight + gap > window.innerHeight
        ? Math.max(8, rect.top - menuHeight - gap)
        : rect.bottom + gap,
  }
}

const handleEdit = () => {
  const item = props.leaveTypes.find(
    (item) => item.id === openActionId.value
  )

  closeActions()

  if (item) emit('edit', item)
}

const handleDelete = () => {
  const item = props.leaveTypes.find(
    (item) => item.id === openActionId.value
  )

  closeActions()

  if (item) emit('delete', item)
}

const handleOutsideClick = (event: MouseEvent) => {
  const target = event.target

  if (!(target instanceof Element)) return

  if (
    target.closest('.leave-more-btn') ||
    target.closest('.leave-action-menu')
  ) return

  closeActions()
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeActions()
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
  document.addEventListener('keydown', handleEscape)
  window.addEventListener('scroll', closeActions, true)
  window.addEventListener('resize', closeActions)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
  document.removeEventListener('keydown', handleEscape)
  window.removeEventListener('scroll', closeActions, true)
  window.removeEventListener('resize', closeActions)
})

</script>

<template>
  <BaseDataTable
    title="Leave Types"
    description="Manage available leave categories, codes, status and associated leave records."
    :has-rows="leaveTypes.length > 0"
    min-width="850px"
    empty-title="No leave types found"
    empty-description="Add a leave type or adjust your filters."
  >
    <template #headers>
      <th>Leave Type</th>
      <th>Leave Code</th>
      <th>Leave Policies</th>
      <th>Leave Requests</th>
      <th>Status</th>
      <th class="action-header">Actions</th>
    </template>

    <template #rows>
      <tr v-for="item in leaveTypes" :key="item.id">
        <!-- LEAVE TYPE -->
        <td>
          <div class="leave-type-cell">
            <div class="leave-icon">
              <CalendarDays :size="15" />
            </div>

            <div class="leave-info">
              <strong>{{ item.name }}</strong>
              <span>Leave Type ID: {{ item.id }}</span>
            </div>
          </div>
        </td>

        <!-- LEAVE CODE -->
        <td>
          <strong class="leave-code">
            {{ item.code }}
          </strong>
        </td>

        <!-- POLICIES -->
        <td>
          <span class="count-badge">
            {{ item.policiesCount }}
          </span>
        </td>

        <!-- REQUESTS -->
        <td>
          <span class="count-badge">
            {{ item.requestsCount }}
          </span>
        </td>

        <!-- STATUS -->
        <td>
          <span class="status-badge" :class="statusClass(item.status)">
            <span class="status-dot" />
            {{ formatStatus(item.status) }}
          </span>
        </td>

        <!-- ACTIONS -->
        <td class="leave-actions-cell">
          <button
            type="button"
            class="leave-more-btn"
            :aria-label="`More actions for ${item.name}`"
            aria-haspopup="menu"
            :aria-expanded="openActionId === item.id"
            :disabled="busy"
            @click.stop="toggleActions(item.id, $event)"
          >
            <MoreHorizontal :size="18" />
          </button>
        </td>
      </tr>
    </template>
  </BaseDataTable>

  
<Teleport to="body">
  <div
    v-if="openActionId !== null"
    class="leave-action-menu"
    role="menu"
    :style="{
      top: `${menuPosition.top}px`,
      left: `${menuPosition.left}px`,
    }"
  >
    <button
      type="button"
      role="menuitem"
      :disabled="busy"
      @click="handleEdit"
    >
      <Pencil :size="15" />
      <span>Edit Leave Type</span>
    </button>

    <button
      type="button"
      role="menuitem"
      class="leave-delete-action"
      :disabled="busy"
      @click="handleDelete"
    >
      <Trash2 :size="15" />
      <span>Delete Leave Type</span>
    </button>
  </div>
</Teleport>

</template>

<style scoped>
/* LEAVE TYPE */
.leave-type-cell {
  display: flex;
  min-width: 180px;
  align-items: center;
  gap: 9px;
}

.leave-icon {
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

.leave-info strong,
.leave-info span {
  display: block;
}

.leave-info strong {
  color: var(--text-primary);
  font-size: 10px;
  font-weight: 700;
}

.leave-info span {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 9px;
}

/* LEAVE CODE */
.leave-code {
  color: var(--primary);
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

/* COUNT */
.count-badge {
  display: inline-flex;
  min-width: 28px;
  align-items: center;
  justify-content: center;
  padding: 5px 8px;
  border-radius: 6px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-size: 10px;
  font-weight: 650;
}

/* STATUS */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
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

.status-badge.active {
  background: var(--green-soft);
  color: var(--green);
}

.status-badge.inactive {
  background: var(--red-soft);
  color: var(--red);
}


/* ACTIONS */

.action-header {
  text-align: right;
}

.leave-actions-cell {
  text-align: right;
  padding-right: 14px;
}

.leave-more-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.18s ease;
}

.leave-more-btn:hover,
.leave-more-btn[aria-expanded='true'] {
  border-color: var(--border);
  background: var(--bg-card-soft);
  color: var(--primary);
}

.leave-more-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}


.actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.action-button {
  display: flex;
  width: 31px;
  height: 31px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background .18s ease, color .18s ease;
}

.action-button:hover {
  background: var(--primary-soft);
  color: var(--primary);
}

.action-button.danger:hover {
  background: var(--red-soft);
  color: var(--red);
}

.action-button:disabled {
  opacity: .45;
  cursor: not-allowed;
}

.leave-action-menu {
  position: fixed;
  z-index: 99999;
  width: 200px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  box-shadow: 0 14px 35px rgba(0, 0, 0, 0.25);
}

.leave-action-menu button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 12px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--text-primary);
  font-size: 11px;
  text-align: left;
  cursor: pointer;
}

.leave-action-menu button:hover {
  background: var(--bg-card-soft);
}

.leave-action-menu .leave-delete-action {
  color: var(--red, #ef4444);
}

.leave-action-menu .leave-delete-action:hover {
  background: var(--red-soft, rgba(239, 68, 68, 0.09));
}

.leave-action-menu button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
