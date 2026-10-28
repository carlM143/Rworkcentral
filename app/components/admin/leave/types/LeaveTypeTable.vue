
<script setup lang="ts">
import { CalendarDays, Pencil, Trash2 } from 'lucide-vue-next'
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import type { LeaveType } from '~/types/leaveType'

withDefaults(defineProps<{
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
        <td>
          <div class="actions">
            <button
              type="button"
              class="action-button"
              title="Edit Leave Type"
              :aria-label="`Edit ${item.name}`"
              :disabled="busy"
              @click="emit('edit', item)"
            >
              <Pencil :size="15" />
            </button>

            <button
              type="button"
              class="action-button danger"
              title="Delete Leave Type"
              :aria-label="`Delete ${item.name}`"
              :disabled="busy"
              @click="emit('delete', item)"
            >
              <Trash2 :size="15" />
            </button>
          </div>
        </td>
      </tr>
    </template>
  </BaseDataTable>
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
</style>
