<script setup lang="ts">
import {
  Download,
  FileSpreadsheet,
  FileText,
  Table2,
  X,
} from 'lucide-vue-next'

import type {
  OvertimeExportPayload,
} from '~/types/overtimeActions'

defineProps<{
  open: boolean

  recordCount: number
}>()

const emit =
  defineEmits<{
    close: []

    export: [
      payload:
        OvertimeExportPayload,
    ]
  }>()

const format =
  ref<
    OvertimeExportPayload['format']
  >('Excel')

const scope =
  ref<
    OvertimeExportPayload['scope']
  >('Current Filters')

const includeEmployee =
  ref(true)

const includeReason =
  ref(true)

const includeApproval =
  ref(true)

const formats = [
  {
    value: 'Excel',
    icon: FileSpreadsheet,
    description:
      'Best for analysis and filtering.',
  },
  {
    value: 'PDF',
    icon: FileText,
    description:
      'Printable overtime report.',
  },
  {
    value: 'CSV',
    icon: Table2,
    description:
      'Raw overtime request data.',
  },
] as const

const submit = () => {
  emit(
    'export',
    {
      format:
        format.value,

      scope:
        scope.value,

      includeEmployee:
        includeEmployee.value,

      includeReason:
        includeReason.value,

      includeApproval:
        includeApproval.value,
    },
  )

  emit('close')
}
</script>

<template>
  <Teleport to="body">

    <div
      v-if="open"
      class="modal-overlay"
      @click.self="emit('close')"
    >

      <article class="modal">

        <header>

          <div class="header-main">

            <div class="header-icon">
              <Download
                :size="18"
              />
            </div>

            <div>

              <h2>
                Export Overtime Requests
              </h2>

              <p>
                {{ recordCount }}
                records match the current filters.
              </p>

            </div>

          </div>

          <button
            type="button"
            class="close"
            @click="emit('close')"
          >
            <X :size="18" />
          </button>

        </header>

        <main>

          <div class="label">
            Export Format
          </div>

          <div class="formats">

            <button
              v-for="item in formats"
              :key="item.value"
              type="button"
              :class="{
                active:
                  format ===
                  item.value,
              }"
              @click="
                format =
                  item.value
              "
            >

              <component
                :is="item.icon"
                :size="18"
              />

              <strong>
                {{ item.value }}
              </strong>

              <span>
                {{ item.description }}
              </span>

            </button>

          </div>

          <div class="section">

            <div class="label">
              Export Scope
            </div>

            <label class="radio">

              <input
                v-model="scope"
                type="radio"
                value="Current Filters"
              >

              <div>
                <strong>
                  Current Filtered Records
                </strong>

                <span>
                  Export exactly what matches the current page filters.
                </span>
              </div>

            </label>

            <label class="radio">

              <input
                v-model="scope"
                type="radio"
                value="Date Range"
              >

              <div>
                <strong>
                  Selected Date Range
                </strong>

                <span>
                  Use the OT Date From and OT Date To filters.
                </span>
              </div>

            </label>

          </div>

          <div class="section">

            <div class="label">
              Include
            </div>

            <label class="check">
              <input
                v-model="includeEmployee"
                type="checkbox"
              >
              Employee information
            </label>

            <label class="check">
              <input
                v-model="includeReason"
                type="checkbox"
              >
              Overtime reasons
            </label>

            <label class="check">
              <input
                v-model="includeApproval"
                type="checkbox"
              >
              Approval status and approved hours
            </label>

          </div>

        </main>

        <footer>

          <AppButton
            variant="secondary"
            @click="emit('close')"
          >
            Cancel
          </AppButton>

          <AppButton
            :icon="Download"
            @click="submit"
          >
            Export {{ format }}
          </AppButton>

        </footer>

      </article>

    </div>

  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  z-index: 99990;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background:
    rgba(3, 10, 24, .76);

  backdrop-filter:
    blur(4px);
}

.modal {
  width: 100%;
  max-width: 580px;

  border:
    1px solid var(--border);

  border-radius: 13px;

  background:
    var(--bg-card);
}

header,
footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding:
    15px 17px;
}

header {
  border-bottom:
    1px solid var(--border);
}

footer {
  justify-content: flex-end;

  border-top:
    1px solid var(--border);
}

.header-main {
  display: flex;

  align-items: center;

  gap: 10px;
}

.header-icon {
  display: flex;

  width: 38px;
  height: 38px;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;
}

header p {
  margin:
    3px 0 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

.close {
  display: flex;

  width: 31px;
  height: 31px;

  align-items: center;
  justify-content: center;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);

  cursor: pointer;
}

main {
  padding:
    16px 17px;
}

.label {
  margin-bottom: 7px;

  color:
    var(--text-primary);

  font-size: 9px;
  font-weight: 700;
}

.formats {
  display: grid;

  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );

  gap: 7px;
}

.formats button {
  display: flex;

  min-height: 105px;

  flex-direction: column;

  align-items: flex-start;

  gap: 5px;

  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  text-align: left;

  cursor: pointer;
}

.formats button.active {
  border-color:
    var(--primary);

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.formats strong {
  color:
    var(--text-primary);

  font-size: 9px;
}

.formats span {
  color:
    var(--text-muted);

  font-size: 7.5px;

  line-height: 1.4;
}

.section {
  margin-top: 16px;
}

.radio {
  display: flex;

  gap: 8px;

  padding: 9px;

  border:
    1px solid var(--border-soft);

  border-radius: 7px;

  cursor: pointer;
}

.radio + .radio {
  margin-top: 6px;
}

.radio input,
.check input {
  accent-color:
    var(--primary);
}

.radio strong,
.radio span {
  display: block;
}

.radio strong {
  color:
    var(--text-primary);

  font-size: 8.5px;
}

.radio span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7.5px;
}

.check {
  display: flex;

  align-items: center;

  gap: 7px;

  min-height: 28px;

  color:
    var(--text-secondary);

  font-size: 8.5px;
}

@media (max-width: 550px) {
  .formats {
    grid-template-columns:
      1fr;
  }
}
</style>