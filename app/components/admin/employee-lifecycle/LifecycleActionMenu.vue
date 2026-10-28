
<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import {
  Ellipsis,
  Eye,
  ClipboardList,
  History,
} from 'lucide-vue-next'

withDefaults(defineProps<{
  detailLabel?: string
  showHistory?: boolean
}>(), {
  detailLabel: 'View Progress',
  showHistory: false,
})

const emit = defineEmits<{
  view: []
  details: []
  history: []
}>()

const open = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)

const dropdownStyle = ref<Record<string, string>>({})

const updatePosition = () => {
  if (!triggerRef.value) return

  const rect = triggerRef.value.getBoundingClientRect()
  const menuWidth = 190

  const left = Math.max(
    8,
    Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8)
  )

  dropdownStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 6}px`,
    left: `${left}px`,
    zIndex: '100000',
  }
}

const toggle = async () => {
  open.value = !open.value

  if (open.value) {
    await nextTick()
    updatePosition()
  }
}

const close = () => {
  open.value = false
}

const handleOutside = (event: MouseEvent) => {
  const target = event.target as Node

  if (
    !triggerRef.value?.contains(target) &&
    !dropdownRef.value?.contains(target)
  ) {
    close()
  }
}

const handleScroll = () => {
  if (open.value) close()
}

const action = (type: 'view' | 'details' | 'history') => {
  close()
  emit(type)
}

onMounted(() => {
  document.addEventListener('pointerdown', handleOutside)
  window.addEventListener('resize', close)
  window.addEventListener('scroll', handleScroll, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleOutside)
  window.removeEventListener('resize', close)
  window.removeEventListener('scroll', handleScroll, true)
})
</script>

<template>
  <div class="action-container">
    <button
      ref="triggerRef"
      type="button"
      class="action-trigger"
      title="More Actions"
      aria-label="More Actions"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      <Ellipsis :size="19" />
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="dropdownRef"
        class="action-dropdown"
        :style="dropdownStyle"
        role="menu"
      >
        <button type="button" role="menuitem" @click="action('view')">
          <Eye :size="15" />
          View Details
        </button>

        <button type="button" role="menuitem" @click="action('details')">
          <ClipboardList :size="15" />
          {{ detailLabel }}
        </button>

        <button
          v-if="showHistory"
          type="button"
          role="menuitem"
          @click="action('history')"
        >
          <History :size="15" />
          View History
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.action-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-trigger {
  display: inline-flex;
  width: 33px;
  height: 33px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-secondary);
  cursor: pointer;
}

.action-trigger:hover,
.action-trigger[aria-expanded="true"] {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary);
}

.action-dropdown {
  width: 190px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  box-shadow: 0 14px 35px rgba(0, 0, 0, .3);
}

.action-dropdown button {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 9px;
  padding: 11px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--text-primary);
  font-size: 11px;
  text-align: left;
  cursor: pointer;
}

.action-dropdown button:hover {
  background: var(--primary-soft);
  color: var(--primary);
}
</style>
