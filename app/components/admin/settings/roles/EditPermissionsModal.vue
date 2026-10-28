<script setup lang="ts">
import {
  X,
  ShieldCheck,
  Save,
  RotateCcw,
} from 'lucide-vue-next'

import type {
  PermissionLevel,
} from '~/types/rolePermission'

const props = defineProps<{
  open: boolean
  roleName: string

  permissions: {
    module: string
    permission: PermissionLevel
  }[]
}>()

const emit = defineEmits<{
  close: []

  save: [
    permissions: {
      module: string
      permission: PermissionLevel
    }[],
  ]
}>()

const permissionOptions:
  PermissionLevel[] = [
    'Full Access',
    'Manage',
    'Approve',
    'View',
    'Self Only',
    'No Access',
  ]

const draftPermissions =
  ref<
    {
      module: string
      permission: PermissionLevel
    }[]
  >([])

const loadPermissions = () => {
  draftPermissions.value =
    props.permissions.map(
      item => ({
        ...item,
      }),
    )
}

watch(
  () => props.open,
  open => {
    if (open) {
      loadPermissions()
    }
  },
)

watch(
  () => props.permissions,
  () => {
    if (props.open) {
      loadPermissions()
    }
  },
  {
    deep: true,
  },
)

const handleReset = () => {
  loadPermissions()
}

const handleSave = () => {
  emit(
    'save',
    draftPermissions.value.map(
      item => ({
        ...item,
      }),
    ),
  )
}

const permissionClass = (
  permission: PermissionLevel,
) => {
  return permission
    .toLowerCase()
    .replace(/\s+/g, '-')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="modal-backdrop"
        @click.self="emit('close')"
      >
        <div class="permissions-modal">

          <!-- HEADER -->
          <div class="modal-header">

            <div class="header-left">

              <div class="header-icon">
                <ShieldCheck :size="19" />
              </div>

              <div>
                <h2>
                  Edit Permissions
                </h2>

                <p>
                  Configure module access for
                  <strong>{{ roleName }}</strong>.
                </p>
              </div>

            </div>

            <button
              type="button"
              class="close-button"
              @click="emit('close')"
            >
              <X :size="18" />
            </button>

          </div>

          <!-- BODY -->
          <div class="modal-body">

            <div class="permission-legend">

              <span class="full-access">
                Full Access
              </span>

              <span class="manage">
                Manage
              </span>

              <span class="approve">
                Approve
              </span>

              <span class="view">
                View
              </span>

              <span class="self-only">
                Self Only
              </span>

              <span class="no-access">
                No Access
              </span>

            </div>

            <div class="permission-table">

              <div class="permission-header">
                <span>
                  Module
                </span>

                <span>
                  Permission
                </span>
              </div>

              <div
                v-for="item in draftPermissions"
                :key="item.module"
                class="permission-row"
              >

                <div class="module-name">
                  <strong>
                    {{ item.module }}
                  </strong>
                </div>

                <div class="permission-control">

                  <span
                    class="permission-dot"
                    :class="
                      permissionClass(
                        item.permission,
                      )
                    "
                  />

                  <select
                    v-model="item.permission"
                  >
                    <option
                      v-for="option in permissionOptions"
                      :key="option"
                      :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>

                </div>

              </div>

            </div>

          </div>

          <!-- FOOTER -->
          <div class="modal-footer">

            <button
              type="button"
              class="reset-button"
              @click="handleReset"
            >
              <RotateCcw :size="14" />

              Reset Changes
            </button>

            <div class="footer-actions">

              <AppButton
                variant="secondary"
                @click="emit('close')"
              >
                Cancel
              </AppButton>

              <AppButton
                :icon="Save"
                @click="handleSave"
              >
                Save Permissions
              </AppButton>

            </div>

          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;

  z-index: 9999;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background:
    rgba(3, 8, 18, 0.72);

  backdrop-filter: blur(3px);
}

.permissions-modal {
  display: flex;

  width: 100%;
  max-width: 760px;
  max-height: calc(100vh - 50px);

  flex-direction: column;

  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 13px;

  background: var(--bg-card);

  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.35);
}

/* HEADER */

.modal-header {
  display: flex;

  flex-shrink: 0;

  align-items: center;
  justify-content: space-between;

  gap: 15px;

  padding: 16px 18px;

  border-bottom:
    1px solid var(--border-soft);
}

.header-left {
  display: flex;

  align-items: center;

  gap: 11px;
}

.header-icon {
  display: flex;

  width: 40px;
  height: 40px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background: var(--primary-soft);
  color: var(--primary);
}

.modal-header h2 {
  margin: 0;

  color: var(--text-primary);

  font-size: 15px;
  font-weight: 700;
}

.modal-header p {
  margin: 4px 0 0;

  color: var(--text-muted);

  font-size: 10px;
}

.modal-header p strong {
  color: var(--text-primary);
}

.close-button {
  display: flex;

  width: 34px;
  height: 34px;

  align-items: center;
  justify-content: center;

  border: 1px solid var(--border);
  border-radius: 7px;

  background: transparent;
  color: var(--text-secondary);

  cursor: pointer;
}

/* BODY */

.modal-body {
  flex: 1;

  overflow-y: auto;

  padding: 16px 18px;
}

/* LEGEND */

.permission-legend {
  display: flex;

  flex-wrap: wrap;

  gap: 6px;

  margin-bottom: 13px;
}

.permission-legend span {
  display: inline-flex;

  min-height: 25px;

  align-items: center;

  padding: 4px 8px;

  border-radius: 20px;

  font-size: 9px;
  font-weight: 650;
}

.full-access {
  background: var(--green-soft);
  color: var(--green);
}

.manage {
  background: var(--primary-soft);
  color: var(--primary);
}

.approve {
  background: var(--purple-soft);
  color: var(--purple);
}

.view {
  background: var(--bg-card-soft);
  color: var(--text-secondary);
}

.self-only {
  background: var(--orange-soft);
  color: var(--orange);
}

.no-access {
  background: var(--red-soft);
  color: var(--red);
}

/* TABLE */

.permission-table {
  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 9px;
}

.permission-header,
.permission-row {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    220px;

  align-items: center;

  gap: 20px;
}

.permission-header {
  padding: 11px 13px;

  border-bottom:
    1px solid var(--border);

  background: var(--bg-card-soft);

  color: var(--text-secondary);

  font-size: 10px;
  font-weight: 700;

  text-transform: uppercase;
}

.permission-row {
  min-height: 55px;

  padding: 9px 13px;

  border-bottom:
    1px solid var(--border-soft);
}

.permission-row:last-child {
  border-bottom: 0;
}

.permission-row:hover {
  background: var(--bg-card-soft);
}

.module-name strong {
  color: var(--text-primary);

  font-size: 11px;
  font-weight: 650;
}

.permission-control {
  display: flex;

  align-items: center;

  gap: 8px;
}

.permission-control select {
  width: 100%;

  height: 34px;

  padding: 0 9px;

  border: 1px solid var(--border);
  border-radius: 7px;

  outline: none;

  background: var(--bg-card);

  color: var(--text-primary);

  font-size: 10px;
}

.permission-control select:focus {
  border-color: var(--primary);
}

.permission-dot {
  width: 8px;
  height: 8px;

  flex-shrink: 0;

  border-radius: 50%;
}

.permission-dot.full-access {
  background: var(--green);
}

.permission-dot.manage {
  background: var(--primary);
}

.permission-dot.approve {
  background: var(--purple);
}

.permission-dot.view {
  background: var(--text-secondary);
}

.permission-dot.self-only {
  background: var(--orange);
}

.permission-dot.no-access {
  background: var(--red);
}

/* FOOTER */

.modal-footer {
  display: flex;

  flex-shrink: 0;

  align-items: center;
  justify-content: space-between;

  gap: 15px;

  padding: 13px 18px;

  border-top:
    1px solid var(--border-soft);

  background: var(--bg-card-soft);
}

.footer-actions {
  display: flex;

  gap: 8px;
}

.reset-button {
  display: inline-flex;

  align-items: center;

  gap: 6px;

  border: 0;

  background: transparent;
  color: var(--text-secondary);

  font-size: 10px;
  font-weight: 600;

  cursor: pointer;
}

.reset-button:hover {
  color: var(--primary);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .permission-header,
  .permission-row {
    grid-template-columns: 1fr;
    gap: 7px;
  }

  .modal-footer {
    align-items: stretch;

    flex-direction: column;
  }

  .footer-actions {
    justify-content: flex-end;
  }
}
</style>