
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import {
  CalendarDays,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-vue-next'

import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import type { LeaveType } from '~/types/leaveType'

const props = withDefaults(
  defineProps<{
    leaveTypes: LeaveType[]
    busy?: boolean
  }>(),
  {
    busy: false,
  },
)

const emit = defineEmits<{
  edit: [item: LeaveType]
  delete: [item: LeaveType]
}>()

// STATUS
const statusClass = (status: string) =>
  status.toLowerCase() === 'active'
    ? 'status-pill--active'
    : 'status-pill--inactive'

const formatStatus = (status: string) =>
  status.charAt(0).toUpperCase() +
  status.slice(1).toLowerCase()

// ACTION MENU
const selectedItem = ref<LeaveType | null>(null)
const hoveredAction = ref('')

const menuPosition = ref({
  top: 0,
  left: 0,
})

const closeActions = () => {
  selectedItem.value = null
  hoveredAction.value = ''
}

const toggleActions = (
  item: LeaveType,
  event: MouseEvent,
) => {
  if (props.busy) return

  if (selectedItem.value?.id === item.id) {
    closeActions()
    return
  }

  const button = event.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()

  const menuWidth = 210
  const menuHeight = 104
  const gap = 6

  const left = Math.max(
    8,
    Math.min(
      rect.right - menuWidth,
      window.innerWidth - menuWidth - 8,
    ),
  )

  const top =
    rect.bottom + menuHeight + gap <= window.innerHeight
      ? rect.bottom + gap
      : Math.max(8, rect.top - menuHeight - gap)

  menuPosition.value = { top, left }
  selectedItem.value = item
}

// EDIT
const handleEdit = () => {
  if (props.busy || !selectedItem.value) return

  const item = selectedItem.value
  closeActions()
  emit('edit', item)
}

// DELETE
const handleDelete = () => {
  if (props.busy || !selectedItem.value) return

  const item = selectedItem.value
  closeActions()
  emit('delete', item)
}

// OUTSIDE CLICK
const handleOutsideClick = (event: PointerEvent) => {
  const target = event.target

  if (!(target instanceof Element)) return

  if (
    target.closest('.leave-more-btn') ||
    target.closest('.leave-action-menu')
  ) {
    return
  }

  closeActions()
}

// ESCAPE
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeActions()
  }
}

watch(
  () => props.busy,
  busy => {
    if (busy) closeActions()
  },
)

onMounted(() => {
  document.addEventListener('pointerdown', handleOutsideClick)
  document.addEventListener('keydown', handleEscape)
  window.addEventListener('resize', closeActions)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', handleOutsideClick)
  document.removeEventListener('keydown', handleEscape)
  window.removeEventListener('resize', closeActions)
})

// STYLES
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

const countStyle = {
  display: 'inline-flex',
  minWidth: '30px',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '5px 9px',
  borderRadius: '6px',
  background: 'var(--bg-card-soft, #182438)',
  color: 'var(--text-primary, #f8fafc)',
  fontSize: '13px',
  fontWeight: '400',
}
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
      <th style="text-align: right">Actions</th>
    </template>

    <template #rows>
      <tr
        v-for="item in leaveTypes"
        :key="item.id"
      >
        <!-- LEAVE TYPE -->
        <td>
          <div
            style="display:flex;align-items:center;gap:10px"
          >

            <div>
              <strong
                style="display:block;font-weight:600"
              >
                {{ item.name }}
              </strong>
            </div>
          </div>
        </td>

        <!-- LEAVE CODE -->
        <td>
          {{ item.code }}
        </td>

        <!-- LEAVE POLICIES -->
        <td>
          <span :style="countStyle">
            {{ item.policiesCount }}
          </span>
        </td>

        <!-- LEAVE REQUESTS -->
        <td>
          <span :style="countStyle">
            {{ item.requestsCount }}
          </span>
        </td>

        <!-- STATUS -->
        <td>
          <span
            class="status-pill"
            :class="statusClass(item.status)"
          >
            {{ formatStatus(item.status) }}
          </span>
        </td>

        <!-- ACTIONS -->
        <td style="text-align:right">
          <button
            type="button"
            class="leave-more-btn"
            :style="{
              ...triggerStyle,
              borderColor: selectedItem?.id === item.id
                ? 'var(--primary, #327bff)'
                : 'var(--border, #29364d)',
              color: selectedItem?.id === item.id
                ? 'var(--primary, #327bff)'
                : 'var(--text-secondary, #a2b0c6)',
            }"
            :aria-label="`More actions for ${item.name}`"
            aria-haspopup="menu"
            :aria-expanded="selectedItem?.id === item.id"
            :disabled="busy"
            @click.stop="toggleActions(item, $event)"
          >
            <MoreHorizontal :size="18" />
          </button>
        </td>
      </tr>
    </template>
  </BaseDataTable>

  <!-- TELEPORTED DROPDOWN -->
  <Teleport to="body">
    <div
      v-if="selectedItem"
      class="leave-action-menu"
      role="menu"
      :aria-label="`Actions for ${selectedItem.name}`"
      :style="{
        ...menuStyle,
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
      }"
    >
      <!-- EDIT -->
      <button
        type="button"
        role="menuitem"
        :disabled="busy"
        :style="{
          ...actionStyle,
          color: 'var(--text-primary, #f8fafc)',
          background: hoveredAction === 'edit'
            ? 'var(--bg-card-soft, #182438)'
            : 'transparent',
        }"
        @mouseenter="hoveredAction = 'edit'"
        @mouseleave="hoveredAction = ''"
        @click="handleEdit"
      >
        <Pencil :size="15" />
        <span>Edit Leave Type</span>
      </button>

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
          background: hoveredAction === 'delete'
            ? 'var(--red-soft, rgba(239,68,68,0.09))'
            : 'transparent',
        }"
        @mouseenter="hoveredAction = 'delete'"
        @mouseleave="hoveredAction = ''"
        @click="handleDelete"
      >
        <Trash2 :size="15" />
        <span>Delete Leave Type</span>
      </button>
    </div>
  </Teleport>
</template>
