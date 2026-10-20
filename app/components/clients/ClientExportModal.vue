<script setup lang="ts">
import {
  Download,
  FileSpreadsheet,
  FileText,
  Table2,
  X,
} from 'lucide-vue-next'

type ExportFormat =
  | 'Excel'
  | 'PDF'
  | 'CSV'

const props =
  defineProps<{
    open: boolean

    recordCount: number

    status?: string
    contractStatus?: string
  }>()

const emit =
  defineEmits<{
    close: []

    export: [
      format:
        ExportFormat,
    ]
  }>()

const format =
  ref<ExportFormat>(
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
      'Best for client master lists and HR records.',
  },

  {
    value:
      'PDF' as const,

    label:
      'PDF',

    icon:
      FileText,

    description:
      'Printable formatted client directory report.',
  },

  {
    value:
      'CSV' as const,

    label:
      'CSV',

    icon:
      Table2,

    description:
      'Raw client information for spreadsheet processing.',
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

    <div
      v-if="open"
      class="modal-overlay"
      @click.self="
        emit('close')
      "
    >

      <article class="modal-card">

        <header>

          <div class="header-main">

            <div class="header-icon">
              <Download :size="18" />
            </div>

            <div>

              <h2>
                Export Clients
              </h2>

              <p>
                Export the currently filtered client directory.
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
                RECORDS
              </span>

              <strong>
                {{ recordCount }}
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
                CONTRACT STATUS
              </span>

              <strong>
                {{
                  contractStatus ||
                  'All Contracts'
                }}
              </strong>

            </div>

          </div>

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

          <div class="included">

            <strong>
              Included Data
            </strong>

            <span>
              Client code, company name, industry, contact person,
              email, phone, address, branches, assigned employees,
              contract dates, contract status and client status.
            </span>

          </div>

        </div>

        <footer>

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

header {
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

header h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;
}

header p {
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
      3,
      minmax(0, 1fr)
    );

  gap: 7px;
}

.summary-grid div {
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

  font-size: 6.5px;
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

  line-height: 1.4;
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

.included strong,
.included span {
  display: block;
}

.included strong {
  color:
    var(--text-primary);

  font-size: 8px;
}

.included span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 7px;

  line-height: 1.5;
}

footer {
  display: flex;
  justify-content: flex-end;

  gap: 7px;

  padding: 13px 18px;

  border-top:
    1px solid var(--border);
}

@media (max-width: 650px) {
  .summary-grid,
  .format-grid {
    grid-template-columns:
      1fr;
  }

  footer {
    align-items: stretch;

    flex-direction: column-reverse;
  }
}
</style>