
<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

import {
  ClipboardList,
  Layers3,
  Users,
  MoreHorizontal,
  Eye,
  Pencil,
  Copy,
} from 'lucide-vue-next'

import type {
  PerformanceTemplate,
  PerformanceTemplateStatus,
  PerformanceTemplateType,
} from '~/types/performanceTemplate'

defineProps<{
  templates: PerformanceTemplate[]
}>()

const emit = defineEmits<{
  view: [item: PerformanceTemplate]
  edit: [item: PerformanceTemplate]
  duplicate: [item: PerformanceTemplate]
}>()

type TemplateAction = 'view' | 'edit' | 'duplicate'

const activeTemplate = ref<PerformanceTemplate | null>(null)
const actionButton = ref<HTMLElement | null>(null)

const menuPosition = ref({
  top: 0,
  left: 0,
})

const formatDate = (value: string) => {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const typeClass = (type: PerformanceTemplateType) => {
  switch (type) {
    case 'General Review':
      return 'general'
    case 'Probationary Review':
      return 'probationary'
    case 'Leadership Review':
      return 'leadership'
    case 'Technical Review':
      return 'technical'
    default:
      return 'driver'
  }
}

const statusClass = (status: PerformanceTemplateStatus) => {
  switch (status) {
    case 'Active':
      return 'active'
    case 'Draft':
      return 'draft'
    case 'Inactive':
      return 'inactive'
    default:
      return 'archived'
  }
}

const closeActions = () => {
  activeTemplate.value = null
  actionButton.value = null
}

const updateMenuPosition = () => {
  const rect = actionButton.value?.getBoundingClientRect()

  if (!rect) return

  const width = 215
  const height = 140
  const gap = 6

  menuPosition.value = {
    left: Math.max(
      8,
      Math.min(rect.right - width, window.innerWidth - width - 8),
    ),
    top:
      rect.bottom + height + gap > window.innerHeight
        ? Math.max(8, rect.top - height - gap)
        : rect.bottom + gap,
  }
}

const toggleActions = async (
  item: PerformanceTemplate,
  event: MouseEvent,
) => {
  if (activeTemplate.value?.id === item.id) {
    closeActions()
    return
  }

  activeTemplate.value = item
  actionButton.value = event.currentTarget as HTMLElement

  await nextTick()
  updateMenuPosition()
}

const selectAction = (action: TemplateAction) => {
  const item = activeTemplate.value

  closeActions()

  if (!item) return

  if (action === 'view') emit('view', item)
  if (action === 'edit') emit('edit', item)
  if (action === 'duplicate') emit('duplicate', item)
}

const handleOutsideClick = (event: MouseEvent) => {
  const target = event.target

  if (!(target instanceof Element)) return

  if (
    target.closest('.template-more-button') ||
    target.closest('.template-action-menu')
  ) {
    return
  }

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
  <article class="table-card">
    <!-- TABLE HEADER -->
    <div class="table-heading">
      <h3>Evaluation Templates</h3>
      <p>
        Manage reusable evaluation templates, employee
        applicability and availability.
      </p>
    </div>

    <!-- TABLE -->
    <div v-if="templates.length" class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Template</th>
            <th>Template Type</th>
            <th>Employee Scope</th>
            <th>Description</th>
            <th>Sections</th>
            <th>Status</th>
            <th>Last Updated</th>
            <th class="actions-heading">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in templates"
            :key="item.id"
          >
            <!-- TEMPLATE -->
            <td>
              <div class="template-cell">
                <div class="template-icon">
                  <ClipboardList :size="16" />
                </div>

                <div class="template-info">
                  <strong>{{ item.name }}</strong>
                  <span>{{ item.templateCode }}</span>
                </div>
              </div>
            </td>

            <!-- TEMPLATE TYPE -->
            <td>
              <span
                class="type-badge"
                :class="typeClass(item.type)"
              >
                {{ item.type }}
              </span>
            </td>

            <!-- EMPLOYEE SCOPE -->
            <td>
              <div class="scope-cell">
                <Users :size="13" />
                <strong>{{ item.scope }}</strong>
              </div>
            </td>

            <!-- DESCRIPTION -->
            <td>
              <p class="description">
                {{ item.description || '—' }}
              </p>
            </td>

            <!-- SECTIONS -->
            <td>
              <div class="count-cell">
                <Layers3 :size="13" />
                <strong>{{ item.sectionCount }}</strong>
                <span>sections</span>
              </div>
            </td>

            <!-- STATUS -->
            <td>
              <span
                class="status-badge"
                :class="statusClass(item.status)"
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
            <td class="actions-cell">
              <button
                type="button"
                class="template-more-button"
                :aria-label="`Actions for ${item.name}`"
                :aria-expanded="activeTemplate?.id === item.id"
                aria-haspopup="menu"
                @click.stop="toggleActions(item, $event)"
              >
                <MoreHorizontal :size="18" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- EMPTY STATE -->
    <div v-else class="empty-state">
      <ClipboardList :size="34" />
      <strong>No evaluation templates found</strong>
      <span>Try changing your template filters.</span>
    </div>
  </article>

  <!-- TELEPORTED DROPDOWN -->
  <Teleport to="body">
    <div
      v-if="activeTemplate"
      class="template-action-menu"
      role="menu"
      :style="{
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
      }"
    >
      <button
        type="button"
        role="menuitem"
        @click="selectAction('view')"
      >
        <Eye :size="15" />
        <span>View Template</span>
      </button>

      <button
        type="button"
        role="menuitem"
        @click="selectAction('edit')"
      >
        <Pencil :size="15" />
        <span>Edit Template</span>
      </button>

      <button
        type="button"
        role="menuitem"
        @click="selectAction('duplicate')"
      >
        <Copy :size="15" />
        <span>Duplicate Template</span>
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.table-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.table-heading {
  padding: 16px 17px;
  border-bottom: 1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 700;
}

.table-heading p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1050px;
  border-collapse: collapse;
}

th {
  padding: 12px 13px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

td {
  padding: 13px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 10px;
  vertical-align: middle;
}

tbody tr:hover {
  background: var(--bg-card-soft);
}

/* TEMPLATE */
.template-cell {
  display: flex;
  min-width: 200px;
  align-items: center;
  gap: 9px;
}

.template-icon {
  display: flex;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--primary-soft);
  color: var(--primary);
}

.template-info strong,
.template-info span {
  display: block;
}

.template-info strong {
  color: var(--text-primary);
  font-size: 10px;
  font-weight: 700;
}

.template-info span {
  margin-top: 4px;
  color: var(--primary);
  font-size: 9px;
  font-weight: 650;
}

/* TEMPLATE TYPE */
.type-badge {
  display: inline-flex;
  padding: 5px 9px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 650;
  white-space: nowrap;
}

.type-badge.general {
  background: var(--primary-soft);
  color: var(--primary);
}

.type-badge.probationary {
  background: var(--orange-soft);
  color: var(--orange);
}

.type-badge.leadership {
  background: var(--purple-soft);
  color: var(--purple);
}

.type-badge.technical {
  background: var(--green-soft);
  color: var(--green);
}

.type-badge.driver {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

/* EMPLOYEE SCOPE */
.scope-cell {
  display: flex;
  min-width: 115px;
  align-items: center;
  gap: 6px;
  color: var(--text-primary);
}

.scope-cell svg {
  color: var(--primary);
}

/* DESCRIPTION */
.description {
  width: 250px;
  margin: 0;
  color: var(--text-secondary);
  font-size: 10px;
  line-height: 1.5;
}

/* SECTIONS */
.count-cell {
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.count-cell svg {
  color: var(--primary);
}

.count-cell strong {
  color: var(--text-primary);
  font-size: 11px;
}

.count-cell span {
  color: var(--text-muted);
  font-size: 9px;
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

.status-badge.draft {
  background: var(--orange-soft);
  color: var(--orange);
}

.status-badge.inactive {
  background: var(--red-soft);
  color: var(--red);
}

.status-badge.archived {
  background: var(--bg-card-soft);
  color: var(--text-muted);
}

/* LAST UPDATED */
.updated-date {
  white-space: nowrap;
}

/* ACTIONS */
.actions-heading,
.actions-cell {
  text-align: right;
}

.template-more-button {
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.18s ease;
}

.template-more-button:hover,
.template-more-button[aria-expanded='true'] {
  border-color: var(--border);
  background: var(--bg-card-soft);
  color: var(--primary);
}

.template-more-button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* EMPTY */
.empty-state {
  display: flex;
  min-height: 260px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-muted);
}

.empty-state strong {
  color: var(--text-primary);
  font-size: 12px;
}

.empty-state span {
  font-size: 10px;
}
</style>

<style>
/* TELEPORTED ACTION MENU */
.template-action-menu {
  position: fixed;
  z-index: 99999;
  width: 215px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
}

.template-action-menu button {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;
}

.template-action-menu button:hover {
  background: var(--bg-card-soft);
  color: var(--primary);
}

.template-action-menu button svg {
  flex-shrink: 0;
  color: var(--text-secondary);
}

.template-action-menu button:hover svg {
  color: var(--primary);
}
</style>
