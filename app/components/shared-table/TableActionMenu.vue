<script setup lang="ts">
import { onBeforeUnmount, ref, type Component } from 'vue'
import { Ellipsis } from 'lucide-vue-next'

/**
 * Reusable three-dots row menu for any table.
 * Default: dots only. Hover/open: soft border square + blue dots.
 */
const props = defineProps<{
  items: {
    key: string
    label: string
    icon?: Component
    danger?: boolean
    dividerBefore?: boolean
  }[]
  label?: string
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
    class="tam-button"
    :class="{ 'is-open': open }"
    :aria-label="label || 'More actions'"
    :aria-expanded="open"
    aria-haspopup="menu"
    @click.stop="toggle"
  >
    <Ellipsis :size="17" />
  </button>

  <Teleport to="body">
    <div v-if="open" class="tam-shade" @click="close">
      <div class="tam-menu" :style="menuStyle" role="menu" @click.stop>
        <template v-for="item in items" :key="item.key">
          <div v-if="item.dividerBefore" class="tam-divider" role="separator" />
          <button
            type="button"
            role="menuitem"
            class="tam-item"
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
.tam-button {
  display: inline-grid;
  width: 34px;
  height: 34px;
  place-items: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary, #a2b0c6);
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.tam-button:hover,
.tam-button.is-open,
.tam-button:focus-visible {
  border-color: rgb(255 255 255 / 22%);
  color: var(--primary, #327bff);
  outline: none;
}

.tam-shade {
  position: fixed;
  inset: 0;
  z-index: 12000;
}

.tam-menu {
  position: fixed;
  padding: 6px;
  border: 1px solid var(--border, #29364d);
  border-radius: 10px;
  background: var(--bg-card, #131e30);
  box-shadow: 0 18px 40px rgb(0 0 0 / 35%);
}

.tam-item {
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

.tam-item svg {
  flex-shrink: 0;
  color: var(--text-secondary, #a2b0c6);
}

.tam-item:hover,
.tam-item:focus-visible {
  background: var(--bg-card-soft, #182438);
  outline: none;
}

.tam-item.danger,
.tam-item.danger svg {
  color: var(--red, #ef4444);
}

.tam-item.danger:hover {
  background: var(--red-soft, rgb(239 68 68 / 12%));
}

.tam-divider {
  height: 1px;
  margin: 5px 4px;
  background: var(--border-soft, #253247);
}
</style>