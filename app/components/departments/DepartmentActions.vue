<script setup lang="ts">
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Users,
  BriefcaseBusiness,
} from 'lucide-vue-next'

import type {
  Department,
} from '~/types/department'

const props = defineProps<{
  department: Department
}>()

const router = useRouter()

const {
  info,
} = useToast()

const open = ref(false)

const triggerRef =
  ref<HTMLElement | null>(null)

const menuRef =
  ref<HTMLElement | null>(null)

const menuStyle = ref({
  top: '0px',
  left: '0px',
})

/* =========================================================
   POSITION DROPDOWN
========================================================= */

const updateMenuPosition = async () => {
  if (
    !import.meta.client ||
    !triggerRef.value
  ) {
    return
  }

  const triggerRect =
    triggerRef.value.getBoundingClientRect()

  await nextTick()

  const menuWidth =
    menuRef.value?.offsetWidth ?? 200

  const menuHeight =
    menuRef.value?.offsetHeight ?? 170

  const gap = 6
  const screenPadding = 10

  /* ==============================
     HORIZONTAL
  ============================== */

  let left =
    triggerRect.right - menuWidth

  if (left < screenPadding) {
    left = screenPadding
  }

  if (
    left + menuWidth >
    window.innerWidth - screenPadding
  ) {
    left =
      window.innerWidth -
      menuWidth -
      screenPadding
  }

  /* ==============================
     VERTICAL
  ============================== */

  const spaceBelow =
    window.innerHeight -
    triggerRect.bottom

  const spaceAbove =
    triggerRect.top

  let top =
    triggerRect.bottom + gap

  /*
   * Kung walang enough space sa baba,
   * automatic bubukas pataas.
   */
  if (
    spaceBelow <
      menuHeight + gap &&
    spaceAbove >
      menuHeight + gap
  ) {
    top =
      triggerRect.top -
      menuHeight -
      gap
  }

  /*
   * Safety para hindi lumabas
   * sa viewport.
   */
  if (top < screenPadding) {
    top = screenPadding
  }

  if (
    top + menuHeight >
    window.innerHeight -
      screenPadding
  ) {
    top =
      window.innerHeight -
      menuHeight -
      screenPadding
  }

  menuStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
}

/* =========================================================
   OPEN / CLOSE
========================================================= */

const toggleMenu = async () => {
  if (open.value) {
    open.value = false
    return
  }

  open.value = true

  await nextTick()

  updateMenuPosition()
}

const close = () => {
  open.value = false
}

/* =========================================================
   ACTIONS
========================================================= */

const viewDepartment = () => {
  close()

  router.push(
    `/departments/${props.department.id}`,
  )
}

const editDepartment = () => {
  close()

  info(
    'Edit Department',
    'Department editing UI will be implemented after the department directory.',
  )
}

const managePositions = () => {
  close()

  info(
    'Manage Positions',
    `Positions under ${props.department.name} will be managed from the Positions module.`,
  )
}

const viewEmployees = () => {
  close()

  info(
    'Department Employees',
    `Employee assignment for ${props.department.name} will be available in the assignment module.`,
  )
}

/* =========================================================
   CLICK OUTSIDE
========================================================= */

const handleOutsideClick = (
  event: MouseEvent,
) => {
  if (!open.value) {
    return
  }

  const target =
    event.target as Node

  if (
    triggerRef.value?.contains(target) ||
    menuRef.value?.contains(target)
  ) {
    return
  }

  close()
}

/* =========================================================
   LIFECYCLE
========================================================= */

onMounted(() => {
  document.addEventListener(
    'mousedown',
    handleOutsideClick,
  )

  window.addEventListener(
    'resize',
    close,
  )

  window.addEventListener(
    'scroll',
    close,
    true,
  )
})

onBeforeUnmount(() => {
  document.removeEventListener(
    'mousedown',
    handleOutsideClick,
  )

  window.removeEventListener(
    'resize',
    close,
  )

  window.removeEventListener(
    'scroll',
    close,
    true,
  )
})
</script>

<template>
  <div class="actions-wrapper">

    <!-- TRIGGER -->
    <button
      ref="triggerRef"
      type="button"
      class="actions-trigger"
      @click.stop="toggleMenu"
    >
      <MoreHorizontal :size="18" />
    </button>

    <!--
      TELEPORT:
      Nilalabas natin ang dropdown sa table
      para hindi ma-clip ng overflow.
    -->
    <Teleport to="body">

      <div
        v-if="open"
        ref="menuRef"
        class="department-actions-menu"
        :style="menuStyle"
      >

        <!-- VIEW -->
        <button
          type="button"
          class="action-item"
          @click="viewDepartment"
        >
          <Eye :size="15" />

          View Department
        </button>

        <!-- EDIT -->
        <button
          type="button"
          class="action-item"
          @click="editDepartment"
        >
          <Pencil :size="15" />

          Edit Department
        </button>

        <!-- POSITIONS -->
        <button
          type="button"
          class="action-item"
          @click="managePositions"
        >
          <BriefcaseBusiness
            :size="15"
          />

          Manage Positions
        </button>

        <!-- EMPLOYEES -->
        <button
          type="button"
          class="action-item"
          @click="viewEmployees"
        >
          <Users :size="15" />

          View Employees
        </button>

      </div>

    </Teleport>

  </div>
</template>

<style scoped>
.actions-wrapper {
  position: relative;

  display: inline-flex;
}

/* ==============================
   TRIGGER
============================== */

.actions-trigger {
  display: flex;

  width: 32px;
  height: 32px;

  align-items: center;
  justify-content: center;

  border:
    1px solid transparent;

  border-radius: 7px;

  background: transparent;
  color: var(--text-secondary);

  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.actions-trigger:hover {
  border-color: var(--border);

  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);
}

/* ==============================
   TELEPORTED MENU
============================== */

.department-actions-menu {
  position: fixed;

  z-index: 9999;

  width: 200px;

  padding: 6px;

  border:
    1px solid var(--border);

  border-radius: 9px;

  background:
    var(--bg-card);

  box-shadow:
    0 16px 40px
    rgba(0, 0, 0, 0.22);
}

/* ==============================
   ACTION ITEM
============================== */

.action-item {
  display: flex;

  width: 100%;
  min-height: 36px;

  align-items: center;
  gap: 9px;

  padding: 0 10px;

  border: 0;
  border-radius: 6px;

  background: transparent;

  color:
    var(--text-secondary);

  font-size: 11px;
  font-weight: 500;

  text-align: left;

  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.action-item:hover {
  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);
}

.action-item svg {
  flex-shrink: 0;
}
</style>