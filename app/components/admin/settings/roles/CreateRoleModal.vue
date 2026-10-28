<script setup lang="ts">
import {
  X,
  ShieldPlus,
  Copy,
  Save,
} from 'lucide-vue-next'

import type {
  PermissionLevel,
} from '~/types/rolePermission'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [
    data: {
      name: string
      description: string
      cloneFrom: string
      defaultPermission: PermissionLevel
    },
  ]
}>()

const form = reactive({
  name: '',
  description: '',
  cloneFrom: '',
  defaultPermission:
    'No Access' as PermissionLevel,
})

const cloneOptions = [
  'Administrator',
  'HR Administrator',
  'Supervisor',
  'Employee',
]

const permissionOptions:
  PermissionLevel[] = [
    'Full Access',
    'Manage',
    'Approve',
    'View',
    'Self Only',
    'No Access',
  ]

const resetForm = () => {
  form.name = ''
  form.description = ''
  form.cloneFrom = ''
  form.defaultPermission =
    'No Access'
}

const handleClose = () => {
  resetForm()

  emit('close')
}

const handleSave = () => {
  if (!form.name.trim()) {
    return
  }

  emit('save', {
    name:
      form.name.trim(),

    description:
      form.description.trim(),

    cloneFrom:
      form.cloneFrom,

    defaultPermission:
      form.defaultPermission,
  })

  resetForm()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="modal-backdrop"
        @click.self="handleClose"
      >
        <div class="modal-card">

          <!-- HEADER -->
          <div class="modal-header">

            <div class="header-left">

              <div class="header-icon">
                <ShieldPlus :size="19" />
              </div>

              <div>
                <h2>
                  Create Role
                </h2>

                <p>
                  Create a custom role and define
                  its initial access permissions.
                </p>
              </div>

            </div>

            <button
              type="button"
              class="close-button"
              @click="handleClose"
            >
              <X :size="18" />
            </button>

          </div>

          <!-- BODY -->
          <div class="modal-body">

            <div class="form-grid">

              <div class="field-group full">
                <label>
                  Role Name
                  <span>*</span>
                </label>

                <AppInput
                  v-model="form.name"
                  placeholder="Example: Payroll Officer"
                />
              </div>

              <div class="field-group full">
                <label>
                  Description
                </label>

                <AppTextarea
                  v-model="form.description"
                  placeholder="Describe the responsibilities and access of this role..."
                />
              </div>

              <div class="field-group">
                <label>
                  Clone Permissions From
                </label>

                <AppSelect
                  v-model="form.cloneFrom"
                  :options="cloneOptions"
                  placeholder="Start from scratch"
                />
              </div>

              <div class="field-group">
                <label>
                  Default Permission
                </label>

                <AppSelect
                  v-model="form.defaultPermission"
                  :options="permissionOptions"
                />
              </div>

            </div>

            <div class="clone-note">
              <Copy :size="16" />

              <div>
                <strong>
                  Permission Template
                </strong>

                <p>
                  You can copy an existing role
                  then adjust individual module
                  permissions after creation.
                </p>
              </div>
            </div>

          </div>

          <!-- FOOTER -->
          <div class="modal-footer">

            <AppButton
              variant="secondary"
              @click="handleClose"
            >
              Cancel
            </AppButton>

            <AppButton
              :icon="Save"
              :disabled="!form.name.trim()"
              @click="handleSave"
            >
              Create Role
            </AppButton>

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

.modal-card {
  width: 100%;
  max-width: 650px;

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

  background: var(--purple-soft);
  color: var(--purple);
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

.close-button:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

/* BODY */

.modal-body {
  padding: 18px;
}

.form-grid {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 14px;
}

.field-group.full {
  grid-column: 1 / -1;
}

.field-group label {
  display: block;

  margin-bottom: 7px;

  color: var(--text-primary);

  font-size: 11px;
  font-weight: 600;
}

.field-group label span {
  color: var(--red);
}

.clone-note {
  display: flex;

  gap: 10px;

  margin-top: 16px;

  padding: 12px;

  border: 1px solid var(--border-soft);
  border-radius: 9px;

  background: var(--primary-soft);

  color: var(--primary);
}

.clone-note svg {
  flex-shrink: 0;

  margin-top: 1px;
}

.clone-note strong {
  display: block;

  color: var(--text-primary);

  font-size: 11px;
}

.clone-note p {
  margin: 4px 0 0;

  color: var(--text-secondary);

  font-size: 10px;

  line-height: 1.5;
}

/* FOOTER */

.modal-footer {
  display: flex;

  justify-content: flex-end;

  gap: 8px;

  padding: 13px 18px;

  border-top:
    1px solid var(--border-soft);

  background: var(--bg-card-soft);
}

/* ANIMATION */

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 650px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .field-group.full {
    grid-column: auto;
  }
}
</style>