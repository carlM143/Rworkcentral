<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { Ellipsis } from 'lucide-vue-next'
import type { WfhMenuItem } from '~/composables/admin/wfh/useWfhFormat'

const props = defineProps<{
  items: WfhMenuItem[]
  label: string
}>()

const emit = defineEmits<{ select: [key: string] }>()

const open = ref(false)
const button = ref<HTMLButtonElement | null>(null)
const menuStyle = ref<Record<string, string>>({})
const MENU_WIDTH = 210

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') close()
}

const close = () => {
  open.value = false
  window.removeEventListener('scroll', close, true)
  window.removeEventListener('resize', close)
  window.removeEventListener('keydown', onKeydown)
}

const toggle = () => {
  if (open.value || !button.value) {
    close()
    return
  }

  const rect = button.value.getBoundingClientRect()
  const dividers = props.items.filter(item => item.dividerBefore).length
  const height = props.items.length * 38 + dividers * 11 + 14
  const fitsBelow = rect.bottom + height + 8 < window.innerHeight

  menuStyle.value = {
    top: `${fitsBelow ? rect.bottom + 6 : Math.max(8, rect.top - height - 6)}px`,
    left: `${Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8))}px`,
    width: `${MENU_WIDTH}px`,
  }

  open.value = true
  window.addEventListener('scroll', close, true)
  window.addEventListener('resize', close)
  window.addEventListener('keydown', onKeydown)
}

const pick = (key: string) => {
  close()
  emit('select', key)
}

onBeforeUnmount(close)
</script>

<template>
  <button
    ref="button"
    type="button"
    class="table-action-button wfh-action-button"
    :class="{ 'is-open': open }"
    :aria-label="label"
    :aria-expanded="open"
    aria-haspopup="menu"
    @click.stop="toggle"
  >
    <Ellipsis :size="17" />
  </button>

  <Teleport to="body">
    <div v-if="open" class="wfh-menu-shade" @click="close">
      <div class="wfh-menu" :style="menuStyle" role="menu" @click.stop>
        <template v-for="item in items" :key="item.key">
          <div v-if="item.dividerBefore" class="wfh-menu-divider" role="separator" />
          <button
            type="button"
            role="menuitem"
            class="wfh-menu-item"
            :class="{ danger: item.danger }"
            @click="pick(item.key)"
          >
            <component :is="item.icon" v-if="item.icon" :size="15" />
            <span>{{ item.label }}</span>
          </button>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Default: dots only, no border (same as Employee Directory). */
.wfh-action-button.table-action-button {
  border-color: transparent;
  background: transparent;
  color: var(--text-secondary, #a2b0c6);
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
}

.wfh-action-button.table-action-button:hover,
.wfh-action-button.table-action-button.is-open,
.wfh-action-button.table-action-button:focus-visible {
  border-color: rgb(255 255 255 / 22%);
  background: transparent;
  color: var(--primary, #327bff);
  outline: none;
}

.wfh-menu-shade {
  position: fixed;
  inset: 0;
  z-index: 12000;
}

.wfh-menu {
  position: fixed;
  padding: 6px;
  border: 1px solid var(--border, #29364d);
  border-radius: 10px;
  background: var(--bg-card, #131e30);
  box-shadow: 0 18px 40px rgb(0 0 0 / 35%);
}

.wfh-menu-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--text-primary, #f8fafc);
  font-family: inherit;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
}

.wfh-menu-item svg {
  flex-shrink: 0;
  color: var(--text-secondary, #a2b0c6);
}

.wfh-menu-item:hover,
.wfh-menu-item:focus-visible {
  background: var(--bg-card-soft, #182438);
  outline: none;
}

.wfh-menu-item.danger,
.wfh-menu-item.danger svg {
  color: var(--red, #ef4444);
}

.wfh-menu-item.danger:hover {
  background: var(--red-soft, rgb(239 68 68 / 12%));
}

.wfh-menu-divider {
  height: 1px;
  margin: 5px 4px;
  background: var(--border-soft, #253247);
}
</style>