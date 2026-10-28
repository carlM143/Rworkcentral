<script setup lang="ts">
import { MoreHorizontal, Eye, Pencil, Trash2, X, BriefcaseBusiness, Building2 } from 'lucide-vue-next'
import type { Position } from '~/types/position'

const props = defineProps<{ position: Position }>()
const emit = defineEmits<{ edit: [position: Position]; delete: [position: Position] }>()

const opened = ref(false)
const viewOpened = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const menuStyle = ref({ top: '0px', left: '0px' })

const close = () => { opened.value = false }

const toggle = async () => {
  if (opened.value) { close(); return }
  opened.value = true
  await nextTick()

  const rect = triggerRef.value?.getBoundingClientRect()
  if (!rect) return

  const width = menuRef.value?.offsetWidth ?? 205
  const height = menuRef.value?.offsetHeight ?? 130

  menuStyle.value = {
    left: `${Math.max(10, Math.min(rect.right - width, window.innerWidth - width - 10))}px`,
    top: `${Math.max(10, Math.min(rect.bottom + 6 + height > window.innerHeight ? rect.top - height - 6 : rect.bottom + 6, window.innerHeight - height - 10))}px`,
  }
}

const doView = () => { close(); viewOpened.value = true }
const doEdit = () => { close(); emit('edit', props.position) }
const doDelete = () => { close(); emit('delete', props.position) }

const outside = (event: MouseEvent) => {
  const target = event.target as Node
  if (!triggerRef.value?.contains(target) && !menuRef.value?.contains(target)) close()
}

const onScroll = () => close()
const onKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape') { close(); viewOpened.value = false }
}

onMounted(() => {
  document.addEventListener('mousedown', outside)
  window.addEventListener('scroll', onScroll, true)
  window.addEventListener('resize', onScroll)
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', outside)
  window.removeEventListener('scroll', onScroll, true)
  window.removeEventListener('resize', onScroll)
  window.removeEventListener('keydown', onKey)
})

const formatDate = (value: string) => value ? new Date(value).toLocaleDateString('en-US') : '—'
</script>

<template>
  <button ref="triggerRef" type="button" class="action-trigger" :aria-label="`Actions for ${position.name}`" :aria-expanded="opened" @click.stop="toggle">
    <MoreHorizontal :size="18" />
  </button>

  <Teleport to="body">
    <div v-if="opened" ref="menuRef" class="position-menu" :style="menuStyle">
      <button type="button" @click="doView"><Eye :size="15" />View Position</button>
      <button type="button" @click="doEdit"><Pencil :size="15" />Edit Position</button>
      <button type="button" class="delete-action" @click="doDelete"><Trash2 :size="15" />Delete Position</button>
    </div>

    <div v-if="viewOpened" class="position-overlay" @click.self="viewOpened = false">
      <section class="position-dialog" role="dialog" aria-modal="true" aria-labelledby="position-details-title">
        <header class="position-head">
          <div class="position-heading">
            <span class="position-icon"><BriefcaseBusiness :size="20" /></span>
            <div>
              <h2 id="position-details-title">Position Details</h2>
              <p>Position ID: {{ position.id }}</p>
            </div>
          </div>
          <button class="position-close" type="button" aria-label="Close" @click="viewOpened = false"><X :size="17" /></button>
        </header>

        <div class="position-body">
          <div class="position-hero">
            <Building2 :size="20" />
            <div>
              <strong>{{ position.name }}</strong>
              <span>{{ position.department }}</span>
            </div>
          </div>

          <h3>Position Information</h3>
          <div class="detail-grid">
            <div><span>Position ID</span><strong>{{ position.id }}</strong></div>
            <div><span>Department</span><strong>{{ position.department }}</strong></div>
            <div><span>Position Title</span><strong>{{ position.name }}</strong></div>
            <div><span>Status</span><strong>{{ position.status }}</strong></div>
          </div>

          <h3>Job Description</h3>
          <div class="description-box">{{ position.description || 'No description provided.' }}</div>

          <div class="detail-grid dates">
            <div><span>Created At</span><strong>{{ formatDate(position.createdAt) }}</strong></div>
            <div><span>Last Updated</span><strong>{{ formatDate(position.updatedAt) }}</strong></div>
          </div>
        </div>

        <footer class="position-footer">
          <button type="button" @click="viewOpened = false">Close Details</button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.action-trigger{width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--text-secondary);cursor:pointer}
.action-trigger:hover{border-color:var(--border);background:var(--bg-card-soft);color:var(--primary)}
.position-menu{position:fixed;z-index:10000;width:205px;padding:6px;border:1px solid var(--border);border-radius:9px;background:var(--bg-card);box-shadow:0 16px 40px #0004}
.position-menu button{display:flex;align-items:center;gap:10px;width:100%;min-height:38px;padding:0 10px;border:0;border-radius:6px;background:transparent;color:var(--text-secondary);font-size:11px;text-align:left;cursor:pointer}
.position-menu button:hover{background:var(--bg-card-soft);color:var(--text-primary)}
.position-menu .delete-action{color:var(--red)}
.position-menu .delete-action:hover{background:var(--red-soft);color:var(--red)}
.position-overlay{position:fixed;inset:0;z-index:10001;background:rgba(3,12,29,.78);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;padding:20px}
.position-dialog{width:100%;max-width:590px;max-height:90vh;overflow-y:auto;background:var(--bg-card);border:1px solid var(--border);border-radius:13px;box-shadow:0 25px 65px #0004}
.position-head{display:flex;align-items:center;justify-content:space-between;padding:16px;border-bottom:1px solid var(--border)}
.position-heading{display:flex;align-items:center;gap:10px}
.position-icon{width:38px;height:38px;display:grid;place-items:center;border-radius:9px;background:var(--primary-soft);color:var(--primary)}
.position-head h2{margin:0;color:var(--text-primary);font-size:13px}
.position-head p{margin:4px 0 0;color:var(--text-muted);font-size:9px}
.position-close{display:grid;place-items:center;width:29px;height:29px;border:1px solid var(--border);border-radius:7px;background:transparent;color:var(--text-secondary);cursor:pointer}
.position-body{padding:17px}
.position-hero{display:flex;align-items:center;gap:12px;padding:14px;background:var(--bg-card-soft);border:1px solid var(--border);border-radius:9px;color:var(--primary)}
.position-hero div{display:flex;flex-direction:column;gap:4px}
.position-hero strong{font-size:13px;color:var(--text-primary)}
.position-hero span{font-size:10px;color:var(--text-muted)}
.position-body h3{margin:21px 0 11px;font-size:11px;color:var(--text-primary)}
.detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
.detail-grid>div{display:flex;flex-direction:column;gap:7px;min-width:0;padding:12px;background:var(--bg-card-soft);border:1px solid var(--border);border-radius:8px}
.detail-grid span{color:var(--text-muted);font-size:9px}
.detail-grid strong{color:var(--text-primary);font-size:11px;overflow-wrap:anywhere}
.description-box{background:var(--bg-card-soft);border:1px solid var(--border);border-radius:8px;padding:12px;color:var(--text-secondary);font-size:11px;line-height:1.6}
.dates{margin-top:12px}
.position-footer{display:flex;justify-content:flex-end;padding:13px 16px;border-top:1px solid var(--border)}
.position-footer button{border:0;border-radius:8px;background:var(--primary);color:#fff;padding:11px 16px;font-size:11px;cursor:pointer}
@media(max-width:520px){.detail-grid{grid-template-columns:1fr}}
</style>