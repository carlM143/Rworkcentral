<script setup lang="ts">
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Users,
  BriefcaseBusiness,
<<<<<<< Updated upstream
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
=======
  X,
  Building2,
  Trash2,
} from 'lucide-vue-next'

import type { Department } from '~/types/department'

const props = defineProps<{
  department: Department
  employeeCount: number
  positionCount: number
}>()

const emit = defineEmits<{
  edit: [department: Department]
  delete: [department: Department]
}>()

const router = useRouter()

const open = ref(false)
const showView = ref(false)

const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

const menuStyle = ref({
  top: '0px',
  left: '0px',
})

/* =========================================
   MENU POSITION
========================================= */

const updateMenuPosition = () => {
  if (!triggerRef.value) return

  const rect = triggerRef.value.getBoundingClientRect()

  const width = menuRef.value?.offsetWidth ?? 210
  const height = menuRef.value?.offsetHeight ?? 220

  menuStyle.value = {
    left: `${Math.max(
      10,
      Math.min(
        rect.right - width,
        window.innerWidth - width - 10,
      ),
    )}px`,

    top: `${Math.max(
      10,
      Math.min(
        rect.bottom + 6 + height > window.innerHeight
          ? rect.top - height - 6
          : rect.bottom + 6,
        window.innerHeight - height - 10,
      ),
    )}px`,
  }
}

/* =========================================
   MENU ACTIONS
========================================= */

const toggle = async () => {
  open.value = !open.value

  if (open.value) {
    await nextTick()
    updateMenuPosition()
  }
}

const closeMenu = () => {
  open.value = false
}

const view = () => {
  closeMenu()
  showView.value = true
}

const edit = () => {
  closeMenu()
  emit('edit', props.department)
}

const remove = () => {
  closeMenu()
  emit('delete', props.department)
}

const managePositions = () => {
  closeMenu()

  router.push({
    path: '/positions',
    query: {
      department: props.department.name,
    },
  })
}

const viewEmployees = () => {
  closeMenu()

  router.push({
    path: '/department-assignments',
    query: {
      department: props.department.name,
    },
  })
}

/* =========================================
   EVENT LISTENERS
========================================= */

const onOutside = (event: MouseEvent) => {
  const node = event.target as Node

  if (
    !triggerRef.value?.contains(node) &&
    !menuRef.value?.contains(node)
  ) {
    closeMenu()
  }
}

const onEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeMenu()
    showView.value = false
  }
}
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
    <!-- TRIGGER -->
=======
    <!-- ACTION TRIGGER -->
>>>>>>> Stashed changes
    <button
      ref="triggerRef"
      type="button"
      class="actions-trigger"
<<<<<<< Updated upstream
      @click.stop="toggleMenu"
=======
      aria-label="Department actions"
      :aria-expanded="open"
      @click.stop="toggle"
>>>>>>> Stashed changes
    >
      <MoreHorizontal :size="18" />
    </button>

<<<<<<< Updated upstream
    <!--
      TELEPORT:
      Nilalabas natin ang dropdown sa table
      para hindi ma-clip ng overflow.
    -->
    <Teleport to="body">

=======
    <Teleport to="body">

      <!-- DROPDOWN -->
>>>>>>> Stashed changes
      <div
        v-if="open"
        ref="menuRef"
        class="department-actions-menu"
        :style="menuStyle"
      >

<<<<<<< Updated upstream
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
=======
        <button
          type="button"
          class="action-item"
          @click="view"
        >
          <Eye :size="15" />
          View Department
        </button>

        <button
          type="button"
          class="action-item"
          @click="edit"
        >
          <Pencil :size="15" />
          Edit Department
        </button>

        <div class="menu-divider" />

>>>>>>> Stashed changes
        <button
          type="button"
          class="action-item"
          @click="managePositions"
        >
<<<<<<< Updated upstream
          <BriefcaseBusiness
            :size="15"
          />

          Manage Positions
        </button>

        <!-- EMPLOYEES -->
=======
          <BriefcaseBusiness :size="15" />
          Manage Positions
        </button>

>>>>>>> Stashed changes
        <button
          type="button"
          class="action-item"
          @click="viewEmployees"
        >
          <Users :size="15" />
<<<<<<< Updated upstream

          View Employees
        </button>

=======
          View Employees
        </button>

        <div class="menu-divider" />

        <button
          type="button"
          class="action-item danger"
          @click="remove"
        >
          <Trash2 :size="15" />
          Delete Department
        </button>

      </div>

      <!-- VIEW DEPARTMENT MODAL -->
      <div
        v-if="showView"
        class="dept-overlay"
        @click.self="showView = false"
      >

        <div
          class="dept-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dept-view-title"
        >

          <!-- MODAL HEADER -->
          <div class="dept-modal-header">

            <div class="dept-title">
              <div class="dept-icon">
                <Building2 :size="19" />
              </div>

              <div>
                <h2 id="dept-view-title">
                  Department Details
                </h2>

                <p>
                  View organizational information
                </p>
              </div>
            </div>

            <button
              class="close-btn"
              type="button"
              aria-label="Close"
              @click="showView = false"
            >
              <X :size="17" />
            </button>

          </div>

          <!-- MODAL BODY -->
          <div class="dept-body">

            <div class="dept-profile">

              <Building2 :size="22" />

              <div>
                <strong>
                  {{ department.name }}
                </strong>

                <span>
                  {{ department.code }}
                </span>
              </div>

              <span
                class="status-chip"
                :class="department.status.toLowerCase()"
              >
                {{ department.status }}
              </span>

            </div>

            <h3>
              Department Information
            </h3>

            <div class="detail-grid">

              <div class="detail">
                <span>Department Code</span>
                <strong>{{ department.code }}</strong>
              </div>

              <div class="detail">
                <span>Department Status</span>
                <strong>{{ department.status }}</strong>
              </div>

              <div class="detail">
                <span>Assigned Employment Records</span>
                <strong>{{ employeeCount }}</strong>
              </div>

              <div class="detail">
                <span>Positions</span>
                <strong>{{ positionCount }}</strong>
              </div>

            </div>

            <h3>
              Additional Information
            </h3>

            <p class="description">
              Department head and description are not
              configured in the current department database.
            </p>

          </div>

          <!-- MODAL FOOTER -->
          <div class="dept-footer">

            <button
              type="button"
              class="btn-secondary"
              @click="showView = false"
            >
              Close
            </button>

            <button
              type="button"
              class="btn-primary"
              @click="showView = false; edit()"
            >
              <Pencil :size="14" />
              Edit Department
            </button>

          </div>

        </div>
>>>>>>> Stashed changes
      </div>

    </Teleport>

  </div>
</template>

<style scoped>
.actions-wrapper {
  position: relative;
<<<<<<< Updated upstream

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
=======
  display: inline-flex;
}

.actions-trigger {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
>>>>>>> Stashed changes
}

.actions-trigger:hover {
  border-color: var(--border);
<<<<<<< Updated upstream

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
=======
  background: var(--bg-card-soft);
  color: var(--primary);
}

/* DROPDOWN */

.department-actions-menu {
  position: fixed;
  z-index: 9999;
  width: 210px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.22);
}

.action-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  min-height: 36px;
  padding: 0 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 11px;
  text-align: left;
  cursor: pointer;
}

.action-item:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.action-item.danger {
  color: var(--red);
}

.action-item.danger:hover {
  background: var(--red-soft);
  color: var(--red);
}

.menu-divider {
  height: 1px;
  margin: 5px 0;
  background: var(--border);
}

/* VIEW MODAL */

.dept-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(3, 12, 29, 0.78);
  backdrop-filter: blur(5px);
}

.dept-dialog {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--bg-card);
  box-shadow: 0 25px 65px rgba(0, 0, 0, 0.25);
}

.dept-modal-header,
.dept-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 17px;
  border-bottom: 1px solid var(--border);
}

.dept-footer {
  justify-content: flex-end;
  border-bottom: 0;
  border-top: 1px solid var(--border);
}

.dept-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dept-icon {
  display: grid;
  place-items: center;
  width: 37px;
  height: 37px;
  border-radius: 9px;
  background: var(--primary-soft);
  color: var(--primary);
}

.dept-title h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 13px;
}

.dept-title p {
  margin: 3px 0 0;
  color: var(--text-muted);
  font-size: 9px;
}

.close-btn {
  display: grid;
  place-items: center;
  width: 29px;
  height: 29px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.dept-body {
  padding: 17px;
}

.dept-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card-soft);
  color: var(--primary);
}

.dept-profile > div {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
}

.dept-profile strong {
  font-size: 13px;
  color: var(--text-primary);
}

.dept-profile span {
  font-size: 10px;
  color: var(--text-muted);
}

.status-chip {
  padding: 6px 9px;
  border-radius: 20px;
  background: var(--green-soft);
  color: var(--green) !important;
  font-weight: 700;
}

.status-chip.inactive {
  background: var(--red-soft);
  color: var(--red) !important;
}

.dept-body h3 {
  margin: 17px 0 10px;
  color: var(--text-primary);
  font-size: 11px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.detail,
.description {
  margin: 0;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.detail span {
  display: block;
  margin-bottom: 7px;
  color: var(--text-muted);
  font-size: 9px;
}

.detail strong {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-primary);
  font-size: 11px;
}

.description {
  color: var(--text-secondary);
  font-size: 11px;
  line-height: 1.6;
}

.btn-secondary,
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 36px;
  padding: 0 13px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary {
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-primary);
}

.btn-primary {
  border: 1px solid var(--primary);
  background: var(--primary);
  color: white;
}

@media (max-width: 480px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
>>>>>>> Stashed changes
}
</style>