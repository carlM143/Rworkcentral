<script setup lang="ts">
import {
  Download,
  FileSpreadsheet,
  FileText,
  Table2,
  X,
} from 'lucide-vue-next'

export type ClientDirectoryExportFormat =
  | 'Excel'
  | 'PDF'
  | 'CSV'

const props =
  defineProps<{
    open: boolean

    recordCount: number

    industry?: string
    status?: string
    contractStatus?: string
  }>()

const emit =
  defineEmits<{
    close: []

    export: [
      format:
        ClientDirectoryExportFormat,
    ]
  }>()

const format =
  ref<ClientDirectoryExportFormat>(
    'Excel',
  )

const formats = [
  {
    value:
      'Excel' as const,

    label:
      'Excel',

    icon:
      FileSpreadsheet,

    description:
      'Best for client directory review and spreadsheet processing.',
  },

  {
    value:
      'PDF' as const,

    label:
      'PDF',

    icon:
      FileText,

    description:
      'Generate a formatted and printable client directory.',
  },

  {
    value:
      'CSV' as const,

    label:
      'CSV',

    icon:
      Table2,

    description:
      'Export raw client information for external processing.',
  },
]

watch(
  () =>
    props.open,
  value => {
    if (value) {
      format.value =
        'Excel'
    }
  },
)
</script>

<template>
  <Teleport to="body">

    <Transition name="modal-fade">

      <div
        v-if="open"
        class="modal-overlay"
        @click.self="
          emit('close')
        "
      >

        <article class="modal-card">

          <!-- HEADER -->

          <header class="modal-header">

            <div class="header-main">

              <div class="header-icon">

                <Download
                  :size="18"
                />

              </div>

              <div>

                <h2>
                  Export Client Directory
                </h2>

                <p>
                  Export the currently filtered client records.
                </p>

              </div>

            </div>

            <button
              type="button"
              class="close-button"
              @click="
                emit('close')
              "
            >
              <X :size="18" />
            </button>

          </header>

          <!-- BODY -->

          <div class="modal-body">

            <!-- SUMMARY -->

            <div class="summary-grid">

              <div>

                <span>
                  RECORDS
                </span>

                <strong>
                  {{ recordCount }}
                </strong>

              </div>

              <div>

                <span>
                  INDUSTRY
                </span>

                <strong>
                  {{
                    industry ||
                    'All Industries'
                  }}
                </strong>

              </div>

              <div>

                <span>
                  CLIENT STATUS
                </span>

                <strong>
                  {{
                    status ||
                    'All Status'
                  }}
                </strong>

              </div>

              <div>

                <span>
                  CONTRACT
                </span>

                <strong>
                  {{
                    contractStatus ||
                    'All Contracts'
                  }}
                </strong>

              </div>

            </div>

            <!-- FORMAT -->

            <div class="section-title">
              Export Format
            </div>

            <div class="format-grid">

              <button
                v-for="
                  item in formats
                "
                :key="
                  item.value
                "
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
                  :is="
                    item.icon
                  "
                  :size="19"
                />

                <strong>
                  {{ item.label }}
                </strong>

                <span>
                  {{ item.description }}
                </span>

              </button>

            </div>

            <!-- INCLUDED -->

            <div class="included-card">

              <strong>
                Included Fields
              </strong>

              <p>
                Client code, client name, industry,
                contact person, email, phone, location,
                client sites, assigned employees,
                contract status, client status and date started.
              </p>

            </div>

          </div>

          <!-- FOOTER -->

          <footer class="modal-footer">

            <AppButton
              variant="secondary"
              @click="
                emit('close')
              "
            >
              Cancel
            </AppButton>

            <AppButton
              :icon="Download"
              @click="
                emit(
                  'export',
                  format,
                )
              "
            >
              Export {{ format }}
            </AppButton>

          </footer>

        </article>

      </div>

    </Transition>

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
    rgba(3, 10, 24, 0.76);

  backdrop-filter:
    blur(4px);
}

.modal-card {
  width: 100%;
  max-width: 650px;

  border:
    1px solid var(--border);

  border-radius: 14px;

  background:
    var(--bg-card);

  box-shadow:
    0 25px 70px
    rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 16px 18px;

  border-bottom:
    1px solid var(--border);
}

.header-main {
  display: flex;
  align-items: center;

  gap: 10px;
}

.header-icon {
  display: flex;

  width: 39px;
  height: 39px;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.modal-header h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;
}

.modal-header p {
  margin: 3px 0 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

.close-button {
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

.modal-body {
  padding: 17px 18px;
}

.summary-grid {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 7px;
}

.summary-grid > div {
  padding: 10px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.summary-grid span,
.summary-grid strong {
  display: block;
}

.summary-grid span {
  color:
    var(--text-muted);

  font-size: 6px;
}

.summary-grid strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 8px;
}

.section-title {
  margin:
    16px 0 7px;

  color:
    var(--text-primary);

  font-size: 9px;
  font-weight: 700;
}

.format-grid {
  display: grid;

  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );

  gap: 7px;
}

.format-grid button {
  display: flex;

  min-height: 115px;

  flex-direction: column;
  align-items: flex-start;

  gap: 6px;

  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-family:
    inherit;

  text-align: left;

  cursor: pointer;
}

.format-grid button:hover,
.format-grid button.active {
  border-color:
    var(--primary);
}

.format-grid button.active {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.format-grid strong {
  color:
    var(--text-primary);

  font-size: 8px;
}

.format-grid span {
  color:
    var(--text-muted);

  font-size: 7px;

  line-height: 1.45;
}

.included-card {
  margin-top: 12px;

  padding: 10px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.included-card strong {
  color:
    var(--text-primary);

  font-size: 8px;
}

.included-card p {
  margin: 4px 0 0;

  color:
    var(--text-muted);

  font-size: 7px;

  line-height: 1.5;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;

  gap: 7px;

  padding: 13px 18px;

  border-top:
    1px solid var(--border);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition:
    opacity 0.18s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 650px) {
  .summary-grid,
  .format-grid {
    grid-template-columns:
      1fr;
  }

  .modal-footer {
    align-items: stretch;

    flex-direction:
      column-reverse;
  }
}
</style>