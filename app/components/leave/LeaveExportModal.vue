<script setup lang="ts">
import {
  Download,
  FileSpreadsheet,
  FileText,
  Table2,
  X,
} from 'lucide-vue-next'

export type LeaveExportFormat =
  | 'Excel'
  | 'PDF'
  | 'CSV'

const props =
  defineProps<{
    open: boolean

    recordCount: number

    pendingCount: number

    approvedCount: number

    rejectedCount: number
  }>()

const emit =
  defineEmits<{
    close: []

    export: [
      format:
        LeaveExportFormat,
    ]
  }>()

const format =
  ref<LeaveExportFormat>(
    'Excel',
  )

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

          <header class="modal-header">

            <div class="header-main">

              <div class="header-icon">

                <Download
                  :size="18"
                />

              </div>

              <div>

                <h2>
                  Export Leave Records
                </h2>

                <p>
                  Export employee leave records and request status.
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

          <div class="modal-body">

            <div class="summary-grid">

              <div>

                <span>
                  TOTAL
                </span>

                <strong>
                  {{ recordCount }}
                </strong>

              </div>

              <div>

                <span>
                  PENDING
                </span>

                <strong>
                  {{ pendingCount }}
                </strong>

              </div>

              <div>

                <span>
                  APPROVED
                </span>

                <strong>
                  {{ approvedCount }}
                </strong>

              </div>

              <div>

                <span>
                  REJECTED
                </span>

                <strong>
                  {{ rejectedCount }}
                </strong>

              </div>

            </div>

            <div class="section-title">
              Export Format
            </div>

            <div class="format-grid">

              <button
                type="button"
                :class="{
                  active:
                    format ===
                    'Excel',
                }"
                @click="
                  format =
                    'Excel'
                "
              >

                <FileSpreadsheet
                  :size="20"
                />

                <strong>
                  Excel
                </strong>

                <span>
                  Best for HR leave reports and analysis.
                </span>

              </button>

              <button
                type="button"
                :class="{
                  active:
                    format ===
                    'PDF',
                }"
                @click="
                  format =
                    'PDF'
                "
              >

                <FileText
                  :size="20"
                />

                <strong>
                  PDF
                </strong>

                <span>
                  Printable leave request report.
                </span>

              </button>

              <button
                type="button"
                :class="{
                  active:
                    format ===
                    'CSV',
                }"
                @click="
                  format =
                    'CSV'
                "
              >

                <Table2
                  :size="20"
                />

                <strong>
                  CSV
                </strong>

                <span>
                  Raw leave data for external processing.
                </span>

              </button>

            </div>

            <div class="included">

              <strong>
                Included Data
              </strong>

              <p>
                Employee, department, leave type,
                requested dates, number of days,
                reason, request status and filed date.
              </p>

            </div>

          </div>

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
    rgba(3, 10, 24, 0.78);

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

  padding:
    16px 18px;

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
  margin:
    3px 0 0;

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
}

.modal-body {
  padding:
    17px 18px;
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

  font-size: 12px;
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

  min-height: 110px;

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

.format-grid button.active {
  border-color:
    var(--primary);

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
}

.included {
  margin-top: 12px;

  padding: 10px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.included strong {
  color:
    var(--text-primary);

  font-size: 8px;
}

.included p {
  margin:
    4px 0 0;

  color:
    var(--text-muted);

  font-size: 7px;

  line-height: 1.5;
}

.modal-footer {
  display: flex;

  justify-content: flex-end;

  gap: 7px;

  padding:
    13px 18px;

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
}
</style>