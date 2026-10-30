
<script setup lang="ts">
import { BriefcaseBusiness } from 'lucide-vue-next'
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import PositionActions from '~/components/admin/departments/positions/PositionActions.vue'
import type { Position } from '~/types/position'

defineProps<{
  positions: Position[]
}>()

const emit = defineEmits<{
  edit: [position: Position]
  delete: [position: Position]
}>()

const formatDate = (value?: string | null): string => {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<template>
  <BaseDataTable
    class="position-directory"
    title="Positions & Designations"
    description="Manage job positions, their descriptions and availability."
    :has-rows="positions.length > 0"
     min-width="950px"
    empty-title="No positions found"
    empty-description="Try changing your position filters."
  >
    <template #headers>
      <th>Position</th>
      <th>Department</th>
      <th>Description</th>
      <th>Status</th>
      <th>Last Updated</th>
      <th class="action-column">Actions</th>
    </template>

    <template #rows>
      <tr
        v-for="item in positions"
        :key="item.id"
      >
        <!-- POSITION -->
        <td>
          <div class="position-cell">
            <span class="position-name">
              {{ item.name }}
            </span>
          </div>
        </td>

        <!-- DEPARTMENT -->
        <td>
          <span class="department-name">
            {{ item.department || 'Not assigned' }}
          </span>
        </td>

        <!-- DESCRIPTION -->
        <td>
          <p class="description">
            {{ item.description || 'No description provided' }}
          </p>
        </td>

        <!-- STATUS -->
        <td>
          <span
            class="status-badge"
            :class="item.status === 'Active' ? 'active' : 'inactive'"
          >
            <span class="status-dot" />
            {{ item.status }}
          </span>
        </td>

        <!-- LAST UPDATED -->
        <td>
          <span class="updated-date">
            {{ formatDate(item.updatedAt) }}
          </span>
        </td>

        <!-- ACTIONS -->
        <td class="action-column">
          <PositionActions
            :position="item"
            @edit="emit('edit', $event)"
            @delete="emit('delete', $event)"
          />
        </td>
      </tr>
    </template>

    <template #empty>
      <div class="position-empty">
        <BriefcaseBusiness :size="34" />
        <strong>No positions found</strong>
        <span>Try changing your position filters.</span>
      </div>
    </template>
  </BaseDataTable>
</template>
