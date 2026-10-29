
<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import {
  Ellipsis,
  Eye,
  Pencil,
  Power,
  CreditCard,
} from 'lucide-vue-next'

type Action = 'view' | 'edit' | 'toggle' | 'payment'

const props = withDefaults(defineProps<{
  type?: 'loan' | 'loan-type'
  active?: boolean
  allowPayment?: boolean
}>(), {
  type: 'loan',
  active: true,
  allowPayment: false,
})

const emit = defineEmits<{
  view: []
  edit: []
  toggle: []
  payment: []
}>()

const open = ref(false)
const trigger = ref<HTMLElement | null>(null)
const dropdown = ref<HTMLElement | null>(null)
const position = ref<Record<string, string>>({})

const updatePosition = () => {
  if (!trigger.value) return

  const rect = trigger.value.getBoundingClientRect()
  const width = 200
  const estimatedHeight = props.type === 'loan-type'
    ? 142
    : props.allowPayment ? 105 : 58

  const left = Math.max(
    8,
    Math.min(rect.right - width, window.innerWidth - width - 8)
  )

  const spaceBelow = window.innerHeight - rect.bottom
  const above = spaceBelow < estimatedHeight + 12

  position.value = {
    position: 'fixed',
    left: `${left}px`,
    top: above
      ? `${Math.max(8, rect.top - estimatedHeight - 6)}px`
      : `${rect.bottom + 6}px`,
    zIndex: '100000',
  }
}

const toggleMenu = async () => {
  open.value = !open.value

  if (open.value) {
    await nextTick()
    updatePosition()
  }
}

const close = () => { open.value = false }

const selectAction = (action: Action) => {
  close()
  emit(action)
}

const onOutside = (event: PointerEvent) => {
  const target = event.target as Node

  if (
    !trigger.value?.contains(target) &&
    !dropdown.value?.contains(target)
  ) close()
}

const onScroll = () => {
  if (open.value) close()
}

onMounted(() => {
  document.addEventListener('pointerdown', onOutside)
  window.addEventListener('scroll', onScroll, true)
  window.addEventListener('resize', close)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onOutside)
  window.removeEventListener('scroll', onScroll, true)
  window.removeEventListener('resize', close)
})
</script>

<template>
  <div class="loan-action">
    <button
      ref="trigger"
      type="button"
      class="loan-action-trigger"
      :aria-expanded="open"
      aria-label="More actions"
      @click.stop="toggleMenu"
    >
      <Ellipsis :size="18" />
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="dropdown"
        class="loan-action-dropdown"
        :style="position"
        role="menu"
      >
        <button role="menuitem" @click="selectAction('view')">
          <Eye :size="15" />
          View Details
        </button>

        <template v-if="type === 'loan-type'">
          <button role="menuitem" @click="selectAction('edit')">
            <Pencil :size="15" />
            Edit Loan Type
          </button>

          <button
            role="menuitem"
            @click="selectAction('toggle')"
          >
            <Power :size="15" />
            {{ active ? 'Deactivate' : 'Activate' }}
          </button>
        </template>

        <button
          v-if="type === 'loan' && allowPayment"
          role="menuitem"
          @click="selectAction('payment')"
        >
          <CreditCard :size="15" />
          Record Payment
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.loan-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.loan-action-trigger {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #2b3d56;
  border-radius: 8px;
  background: #131e30;
  color: #a8b8cf;
  cursor: pointer;
  transition: all 0.15s ease;
}

.loan-action-trigger:hover,
.loan-action-trigger[aria-expanded="true"] {
  background: rgba(37, 99, 235, 0.16);
  border-color: #3b82f6;
  color: #60a5fa;
}

.loan-action-dropdown {
  width: 200px;
  padding: 6px;
  border: 1px solid #30415b;
  border-radius: 10px;
  background: #141f31;
  box-shadow: 0 16px 35px rgba(0, 0, 0, 0.4);
}

.loan-action-dropdown button {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 10px;
  padding: 11px 12px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #e2e8f0;
  text-align: left;
  font-size: 11px;
  cursor: pointer;
}

.loan-action-dropdown button:hover {
  background: rgba(37, 99, 235, 0.16);
  color: #60a5fa;
}
</style>
