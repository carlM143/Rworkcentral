
<script setup lang="ts">
import {
  Check,
  Save,
  Settings2,
  X,
} from 'lucide-vue-next'

import type {
  SettingsModule,
} from '~/types/settings'

type FieldType = 'text' | 'number' | 'select' | 'checkbox'

interface ConfigField {
  key: string
  label: string
  type: FieldType
  placeholder?: string
  options?: string[]
  description?: string
}

interface ConfigSection {
  title: string
  description: string
  fields: ConfigField[]
}

const props = defineProps<{
  open: boolean
  module: SettingsModule | null
}>()

const emit = defineEmits<{
  close: []
  saved: [title: string]
}>()

/* =========================================
   SETTINGS FORM DEFINITIONS
========================================= */

const configurations: Record<string, ConfigSection[]> = {
  Company: [
    {
      title: 'Company Profile',
      description: 'Basic company information.',
      fields: [
        { key: 'companyName', label: 'Company Name', type: 'text' },
        { key: 'companyEmail', label: 'Company Email', type: 'text' },
        { key: 'companyPhone', label: 'Contact Number', type: 'text' },
        { key: 'companyAddress', label: 'Company Address', type: 'text' },
      ],
    },
    {
      title: 'Business Details',
      description: 'Company registration and business information.',
      fields: [
        { key: 'tin', label: 'Company TIN', type: 'text' },
        { key: 'businessType', label: 'Business Type', type: 'text' },
      ],
    },
  ],

  Timekeeping: [
    {
      title: 'Attendance Rules',
      description: 'Default company timekeeping policies.',
      fields: [
        {
          key: 'gracePeriod',
          label: 'Grace Period (Minutes)',
          type: 'number',
        },
        {
          key: 'lateTracking',
          label: 'Enable Late Tracking',
          type: 'checkbox',
        },
        {
          key: 'undertimeTracking',
          label: 'Enable Undertime Tracking',
          type: 'checkbox',
        },
      ],
    },
    {
      title: 'Timekeeping Preferences',
      description: 'General attendance configuration.',
      fields: [
        {
          key: 'timeFormat',
          label: 'Time Format',
          type: 'select',
          options: ['12-hour', '24-hour'],
        },
        {
          key: 'timezone',
          label: 'Timezone',
          type: 'select',
          options: ['Asia/Manila'],
        },
      ],
    },
  ],

  Payroll: [
    {
      title: 'Payroll Configuration',
      description: 'General payroll processing rules.',
      fields: [
        {
          key: 'payrollFrequency',
          label: 'Payroll Frequency',
          type: 'select',
          options: ['Semi-Monthly', 'Monthly', 'Weekly'],
        },
        {
          key: 'currency',
          label: 'Currency',
          type: 'select',
          options: ['PHP'],
        },
        {
          key: 'autoCalculate',
          label: 'Enable Automatic Payroll Calculation',
          type: 'checkbox',
        },
      ],
    },
  ],

  'Leave & Overtime': [
    {
      title: 'Leave Policies',
      description: 'Company-wide leave preferences.',
      fields: [
        {
          key: 'allowLeaveApplication',
          label: 'Allow Employee Leave Applications',
          type: 'checkbox',
        },
        {
          key: 'requireLeaveApproval',
          label: 'Require Leave Approval',
          type: 'checkbox',
        },
      ],
    },
    {
      title: 'Overtime Policies',
      description: 'Overtime request and approval settings.',
      fields: [
        {
          key: 'allowOvertime',
          label: 'Allow Overtime Requests',
          type: 'checkbox',
        },
        {
          key: 'requireOtApproval',
          label: 'Require Overtime Approval',
          type: 'checkbox',
        },
      ],
    },
  ],

  Approval: [
    {
      title: 'Approval Workflow',
      description: 'Default approval preferences.',
      fields: [
        {
          key: 'requireSupervisor',
          label: 'Require Supervisor Review',
          type: 'checkbox',
        },
        {
          key: 'requireHrApproval',
          label: 'Require HR Approval',
          type: 'checkbox',
        },
        {
          key: 'approvalLevel',
          label: 'Default Approval Level',
          type: 'select',
          options: ['Single Level', 'Two Levels'],
        },
      ],
    },
  ],

  Notifications: [
    {
      title: 'Notification Channels',
      description: 'Configure system alerts and reminders.',
      fields: [
        {
          key: 'emailNotifications',
          label: 'Enable Email Notifications',
          type: 'checkbox',
        },
        {
          key: 'systemNotifications',
          label: 'Enable In-App Notifications',
          type: 'checkbox',
        },
        {
          key: 'approvalNotifications',
          label: 'Notify Pending Approvals',
          type: 'checkbox',
        },
      ],
    },
    {
      title: 'Reminders',
      description: 'Upcoming employee-related reminders.',
      fields: [
        {
          key: 'lifecycleReminders',
          label: 'Enable Lifecycle Reminders',
          type: 'checkbox',
        },
        {
          key: 'documentReminders',
          label: 'Enable Document Expiration Reminders',
          type: 'checkbox',
        },
      ],
    },
  ],

  System: [
    {
      title: 'General Preferences',
      description: 'System-wide configuration.',
      fields: [
        {
          key: 'dateFormat',
          label: 'Date Format',
          type: 'select',
          options: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
        },
        {
          key: 'defaultLanguage',
          label: 'Default Language',
          type: 'select',
          options: ['English'],
        },
      ],
    },
    {
      title: 'Security Preferences',
      description: 'Session and audit settings.',
      fields: [
        {
          key: 'sessionTimeout',
          label: 'Session Timeout (Minutes)',
          type: 'number',
        },
        {
          key: 'auditLogging',
          label: 'Enable Audit Logging',
          type: 'checkbox',
        },
      ],
    },
  ],
}

/* =========================================
   STATE
========================================= */

const form = reactive<Record<string, string | number | boolean>>({})

const sections = computed(() => {
  if (!props.module) return []

  return configurations[props.module.category] ?? []
})

const storageKey = computed(() => {
  return props.module
    ? `rworkcentral-settings-${props.module.category}`
    : ''
})

const loadSettings = () => {
  Object.keys(form).forEach(key => {
    delete form[key]
  })

  for (const section of sections.value) {
    for (const field of section.fields) {
      form[field.key] = field.type === 'checkbox'
        ? false
        : field.type === 'number'
          ? 0
          : field.type === 'select'
            ? field.options?.[0] ?? ''
            : ''
    }
  }

  if (!import.meta.client || !storageKey.value) return

  try {
    const saved = localStorage.getItem(storageKey.value)

    if (!saved) return

    const parsed: unknown = JSON.parse(saved)

    if (
      parsed === null ||
      typeof parsed !== 'object' ||
      Array.isArray(parsed)
    ) {
      return
    }

    const values = parsed as Record<string, unknown>

    for (const section of sections.value) {
      for (const field of section.fields) {
        const value = values[field.key]

        if (field.type === 'checkbox' && typeof value === 'boolean') {
          form[field.key] = value
        } else if (field.type === 'number' && typeof value === 'number') {
          form[field.key] = value
        } else if (
          ['text', 'select'].includes(field.type) &&
          typeof value === 'string'
        ) {
          form[field.key] = value
        }
      }
    }
  } catch {
    // Ignore invalid or unavailable browser storage.
  }
}

watch(
  () => [props.open, props.module?.id],
  () => {
    if (props.open) {
      loadSettings()
    }
  },
  { immediate: true },
)

const handleSave = () => {
  if (!props.module || !import.meta.client) return

  for (const section of sections.value) {
    for (const field of section.fields) {
      if (
        field.type === 'number' &&
        (
          !Number.isFinite(Number(form[field.key])) ||
          Number(form[field.key]) < 0
        )
      ) {
        return
      }
    }
  }

  try {
    localStorage.setItem(
      storageKey.value,
      JSON.stringify({ ...form }),
    )

    emit('saved', props.module.title)
  } catch {
    // Browser storage may be disabled or full.
  }
}

const handleClose = () => {
  emit('close')
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.open) {
    handleClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && module"
      class="settings-modal-overlay"
      @click.self="handleClose"
    >
      <section
        class="settings-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="module.title"
      >
        <header class="modal-header">
          <div class="heading">
            <div class="heading-icon">
              <Settings2 :size="18" />
            </div>

            <div>
              <h2>{{ module.title }}</h2>
              <p>{{ module.description }}</p>
            </div>
          </div>

          <button
            type="button"
            class="close-button"
            aria-label="Close configuration"
            @click="handleClose"
          >
            <X :size="17" />
          </button>
        </header>

        <form
          class="modal-form"
          @submit.prevent="handleSave"
        >
          <div class="modal-content">
            <div class="prototype-notice">
              <Settings2 :size="15" />

              <span>
                Frontend configuration preview.
                Changes are saved in this browser only.
              </span>
            </div>

            <section
              v-for="section in sections"
              :key="section.title"
              class="form-section"
            >
              <div class="section-heading">
                <h3>{{ section.title }}</h3>
                <p>{{ section.description }}</p>
              </div>

              <div class="fields-grid">
                <div
                  v-for="field in section.fields"
                  :key="field.key"
                  class="form-field"
                  :class="{
                    'checkbox-field': field.type === 'checkbox',
                  }"
                >
                  <template v-if="field.type === 'checkbox'">
                    <label class="checkbox-label">
                      <input
                        v-model="form[field.key]"
                        type="checkbox"
                      />

                      <span>{{ field.label }}</span>
                    </label>
                  </template>

                  <template v-else>
                    <label :for="field.key">
                      {{ field.label }}
                    </label>

                    <select
                      v-if="field.type === 'select'"
                      :id="field.key"
                      v-model="form[field.key]"
                    >
                      <option
                        v-for="option in field.options"
                        :key="option"
                        :value="option"
                      >
                        {{ option }}
                      </option>
                    </select>

                    <input
                      v-else-if="field.type === 'number'"
                      :id="field.key"
                      v-model.number="form[field.key]"
                      type="number"
                      min="0"
                      step="1"
                    />

                    <input
                      v-else
                      :id="field.key"
                      v-model="form[field.key]"
                      type="text"
                      :placeholder="field.placeholder || field.label"
                    />
                  </template>

                  <small v-if="field.description">
                    {{ field.description }}
                  </small>
                </div>
              </div>
            </section>

            <div
              v-if="!sections.length"
              class="empty-settings"
            >
              No configuration fields available.
            </div>
          </div>

          <footer class="modal-footer">
            <span>
              <Check :size="13" />
              Browser preview
            </span>

            <div class="footer-actions">
              <button
                type="button"
                class="cancel-button"
                @click="handleClose"
              >
                Cancel
              </button>

              <button
                type="submit"
                class="save-button"
                :disabled="!sections.length"
              >
                <Save :size="15" />
                Save Changes
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.settings-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(2, 9, 22, 0.76);
  backdrop-filter: blur(5px);
}

.settings-modal {
  display: flex;
  width: 100%;
  max-width: 650px;
  max-height: 90vh;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  box-shadow: 0 25px 75px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  padding: 17px;
  border-bottom: 1px solid var(--border);
}

.heading {
  display: flex;
  align-items: center;
  gap: 11px;
}

.heading-icon {
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

.heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 14px;
}

.heading p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.5;
}

.close-button {
  display: flex;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.close-button:hover {
  border-color: var(--border);
  background: var(--bg-card-soft);
}

.modal-form {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
}

.modal-content {
  min-height: 0;
  overflow-y: auto;
  padding: 17px;
}

.prototype-notice {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 10px;
  line-height: 1.6;
}

.prototype-notice svg {
  flex-shrink: 0;
  color: var(--primary);
}

.form-section {
  margin-top: 21px;
}

.section-heading {
  margin-bottom: 13px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-soft);
}

.section-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 12px;
}

.section-heading p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.fields-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 13px;
}

.form-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 7px;
}

.form-field > label {
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 600;
}

.form-field input:not([type="checkbox"]),
.form-field select {
  width: 100%;
  height: 39px;
  padding: 0 11px;
  border: 1px solid var(--border);
  border-radius: 8px;
  outline: none;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 11px;
}

.form-field input:focus,
.form-field select:focus {
  border-color: var(--primary);
}

.checkbox-field {
  justify-content: center;
  min-height: 44px;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
}

.checkbox-label input {
  width: 15px;
  height: 15px;
  accent-color: var(--primary);
}

.form-field small {
  color: var(--text-muted);
  font-size: 9px;
}

.empty-settings {
  padding: 25px;
  color: var(--text-muted);
  font-size: 11px;
  text-align: center;
}

.modal-footer {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 14px 17px;
  border-top: 1px solid var(--border);
}

.modal-footer > span {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 10px;
}

.footer-actions {
  display: flex;
  gap: 8px;
}

.cancel-button,
.save-button {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.save-button {
  border-color: var(--primary);
  background: var(--primary);
  color: white;
}

.save-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 550px) {
  .fields-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .footer-actions {
    width: 100%;
  }

  .footer-actions button {
    flex: 1;
  }
}
</style>
