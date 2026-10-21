<script setup lang="ts">
import {
  Building2,
  BriefcaseBusiness,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
} from 'lucide-vue-next'
import type { PerformanceTemplate } from '~/types/performanceTemplate'

const props = defineProps<{
  templates: PerformanceTemplate[]
}>()

const emit = defineEmits<{
  view: [item: PerformanceTemplate]
  edit: [item: PerformanceTemplate]
  delete: [item: PerformanceTemplate]
  download: [item: PerformanceTemplate]
}>()

const openId = ref<number | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const menuStyle = ref({ top: '0px', left: '0px' })

const closeMenu = () => {
  openId.value = null
}

const toggleMenu = async (id: number, event: MouseEvent) => {
  if (openId.value === id) {
    closeMenu()
    return
  }

  triggerRef.value = event.currentTarget as HTMLElement
  openId.value = id
  await nextTick()

  if (!triggerRef.value) return

  const rect = triggerRef.value.getBoundingClientRect()
  const width = menuRef.value?.offsetWidth ?? 190
  const height = menuRef.value?.offsetHeight ?? 170
  const gap = 6
  const top = rect.bottom + height + gap <= window.innerHeight
    ? rect.bottom + gap
    : rect.top - height - gap

  menuStyle.value = {
    top: `${Math.max(8, Math.min(top, window.innerHeight - height - 8))}px`,
    left: `${Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8))}px`,
  }
}

const handleAction = (action: 'view' | 'edit' | 'delete' | 'download') => {
  const item = props.templates.find(row => row.id === openId.value)
  closeMenu()
  if (item) emit(action, item)
}

const handleOutside = (event: MouseEvent) => {
  const target = event.target as Node
  const inTrigger = triggerRef.value?.contains(target)
  const inMenu = menuRef.value?.contains(target)

  if (!inTrigger && !inMenu) closeMenu()
}

onMounted(() => {
  document.addEventListener('mousedown', handleOutside)
  window.addEventListener('resize', closeMenu)
  window.addEventListener('scroll', closeMenu, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutside)
  window.removeEventListener('resize', closeMenu)
  window.removeEventListener('scroll', closeMenu, true)
})
</script>

<template>
  <article class="table-card">
    <div class="table-title">
      <h3>Evaluation Templates</h3>
      <p>Company, department, position and attached evaluation document.</p>
    </div>

    <div v-if="templates.length" class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Department</th>
            <th>Position</th>
            <th>Document</th>
            <th class="action-column">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in templates" :key="item.id">
            <td>
              <div class="cell">
                <Building2 :size="15" />
                <strong>{{ item.company }}</strong>
              </div>
            </td>

            <td>
              <div class="cell">
                <Users :size="15" />
                {{ item.department }}
              </div>
            </td>

            <td>
              <div class="cell">
                <BriefcaseBusiness :size="15" />
                {{ item.position }}
              </div>
            </td>

            <td>
              <div class="document-cell">
                <div class="document-icon">
                  <FileText :size="17" />
                </div>
                <div>
                  <strong>{{ item.documentName }}</strong>
                  <small>
                    {{ item.documentUrl ? 'Uploaded file' : 'Sample record — no file attached' }}
                  </small>
                </div>
              </div>
            </td>

            <td class="action-column">
              <button
                type="button"
                class="action-trigger"
                aria-label="Template actions"
                :aria-expanded="openId === item.id"
                @click.stop="toggleMenu(item.id, $event)"
              >
                <MoreHorizontal :size="18" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <FileText :size="27" />
      <strong>No evaluation templates found</strong>
      <span>Try changing the search or create a new template.</span>
    </div>

    <Teleport to="body">
      <div
        v-if="openId !== null"
        ref="menuRef"
        class="template-actions-menu"
        :style="menuStyle"
      >
        <button type="button" @click="handleAction('view')">
          <Eye :size="15" /> View Template
        </button>
        <button type="button" @click="handleAction('edit')">
          <Pencil :size="15" /> Edit Template
        </button>
        <button type="button" @click="handleAction('download')">
          <Download :size="15" /> Download Document
        </button>
        <div class="menu-divider" />
        <button type="button" class="danger" @click="handleAction('delete')">
          <Trash2 :size="15" /> Delete Template
        </button>
      </div>
    </Teleport>
  </article>
</template>

<style scoped>
.table-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.table-title {
  padding: 15px 17px;
  border-bottom: 1px solid var(--border-soft);
}

.table-title h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 13px;
}

.table-title p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 9px;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
}

th {
  padding: 12px 15px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 650;
  text-align: left;
  text-transform: uppercase;
}

td {
  padding: 13px 15px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 11px;
}

tbody tr:hover {
  background: var(--bg-card-soft);
}

.cell {
  display: flex;
  align-items: center;
  gap: 9px;
  white-space: nowrap;
}

.cell svg {
  flex-shrink: 0;
  color: var(--primary);
}

.cell strong,
.document-cell strong {
  color: var(--text-primary);
}

.document-cell {
  display: flex;
  min-width: 215px;
  align-items: center;
  gap: 9px;
}

.document-icon {
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

.document-cell strong,
.document-cell small {
  display: block;
}

.document-cell strong {
  font-size: 10px;
}

.document-cell small {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 9px;
}

.action-column {
  position: static;
  width: 75px;
  text-align: center;
}

.action-trigger {
  display: inline-flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
}

.action-trigger:hover {
  background: var(--primary-soft);
  color: var(--primary);
}

.empty-state {
  display: flex;
  min-height: 220px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: var(--text-muted);
  font-size: 10px;
}

.empty-state strong {
  color: var(--text-primary);
  font-size: 12px;
}
</style>

<style>
.template-actions-menu {
  position: fixed;
  z-index: 10020;
  width: 195px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.24);
}

.template-actions-menu button {
  display: flex;
  width: 100%;
  min-height: 36px;
  align-items: center;
  gap: 9px;
  padding: 0 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 11px;
  text-align: left;
}

.template-actions-menu button:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.template-actions-menu button.danger {
  color: var(--red);
}

.template-actions-menu button.danger:hover {
  background: var(--red-soft);
}

.template-actions-menu .menu-divider {
  margin: 5px 4px;
  border-top: 1px solid var(--border-soft);
}
</style>
