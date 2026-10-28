
<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { Ellipsis, Eye, Pencil, History } from 'lucide-vue-next'

const emit = defineEmits<{
  view: []
  edit: []
  history: []
}>()

const open = ref(false)
const trigger = ref<HTMLElement | null>(null)
const menu = ref<HTMLElement | null>(null)
const position = ref<Record<string, string>>({})

const updatePosition = async () => {
  if (!trigger.value) return
  const rect = trigger.value.getBoundingClientRect()

  await nextTick()

  const width = 190
  const height = menu.value?.offsetHeight ?? 145
  const spaceBelow = window.innerHeight - rect.bottom
  const top = spaceBelow >= height + 10
    ? rect.bottom + 6
    : Math.max(8, rect.top - height - 6)

  position.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8))}px`,
    zIndex: '100000',
  }
}

const toggle = async () => {
  open.value = !open.value
  if (open.value) await updatePosition()
}

const close = () => { open.value = false }

const outside = (event: PointerEvent) => {
  const node = event.target as Node
  if (!trigger.value?.contains(node) && !menu.value?.contains(node)) close()
}

const choose = (action: 'view' | 'edit' | 'history') => {
  close()
  emit(action)
}

onMounted(() => {
  document.addEventListener('pointerdown', outside)
  window.addEventListener('scroll', close, true)
  window.addEventListener('resize', close)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', outside)
  window.removeEventListener('scroll', close, true)
  window.removeEventListener('resize', close)
})
</script>

<template>
  <div class="transfer-menu">
    <button
      ref="trigger"
      type="button"
      class="trigger"
      aria-label="Transfer actions"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      <Ellipsis :size="19" />
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="menu"
        class="dropdown"
        :style="position"
        role="menu"
      >
        <button type="button" role="menuitem" @click="choose('view')">
          <Eye :size="15" /> View Details
        </button>

        <button type="button" role="menuitem" @click="choose('edit')">
          <Pencil :size="15" /> Edit Transfer
        </button>

        <button type="button" role="menuitem" @click="choose('history')">
          <History :size="15" /> View History
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.transfer-menu { display:inline-flex;align-items:center;justify-content:center; }
.trigger { display:grid;place-items:center;width:33px;height:33px;border:1px solid var(--border);border-radius:8px;background:var(--bg-card);color:var(--text-secondary);cursor:pointer; }
.trigger:hover,.trigger[aria-expanded="true"] { border-color:var(--primary);background:var(--primary-soft);color:var(--primary); }
.dropdown { width:190px;padding:6px;border:1px solid var(--border);border-radius:10px;background:var(--bg-card);color:var(--text-primary);box-shadow:0 14px 35px rgba(0,0,0,.3); }
.dropdown button { display:flex;align-items:center;gap:9px;width:100%;padding:11px;border:0;border-radius:7px;background:transparent;color:inherit;font-size:11px;text-align:left;cursor:pointer; }
.dropdown button:hover { background:var(--primary-soft);color:var(--primary); }
</style>
