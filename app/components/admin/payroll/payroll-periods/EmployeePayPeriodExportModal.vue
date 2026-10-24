<script setup lang="ts">
import {
  Download,
  FileSpreadsheet,
  FileText,
  Table2,
  X,
} from 'lucide-vue-next'

type Format =
  | 'Excel'
  | 'PDF'
  | 'CSV'

const props =
  defineProps<{
    open: boolean
    recordCount: number
    status?: string
    year?: string
    month?: string
    dateFrom?: string
    dateTo?: string
  }>()

const emit =
  defineEmits<{
    close: []
    export: [format: Format]
  }>()

const format =
  ref<Format>('Excel')

const formats = [
  {
    value: 'Excel' as const,
    icon: FileSpreadsheet,
  },
  {
    value: 'PDF' as const,
    icon: FileText,
  },
  {
    value: 'CSV' as const,
    icon: Table2,
  },
]
</script>

<template>
  <Teleport to="body">

    <div
      v-if="open"
      class="overlay"
      @click.self="emit('close')"
    >

      <article class="modal">

        <header>

          <div class="heading">
            <Download :size="18" />

            <div>
              <h2>
                Export Employee Pay Periods
              </h2>

              <p>
                Export the current employee payroll period report.
              </p>
            </div>
          </div>

          <button
            class="close"
            @click="emit('close')"
          >
            <X :size="18" />
          </button>

        </header>

        <div class="body">

          <div class="summary">

            <div>
              <span>RECORDS</span>
              <strong>
                {{ recordCount }}
              </strong>
            </div>

            <div>
              <span>STATUS</span>
              <strong>
                {{ status || 'All' }}
              </strong>
            </div>

            <div>
              <span>YEAR</span>
              <strong>
                {{ year || 'All' }}
              </strong>
            </div>

            <div>
              <span>MONTH</span>
              <strong>
                {{ month || 'All' }}
              </strong>
            </div>

          </div>

          <h3>
            Export Format
          </h3>

          <div class="formats">

            <button
              v-for="item in formats"
              :key="item.value"
              type="button"
              :class="{
                active:
                  format === item.value,
              }"
              @click="
                format = item.value
              "
            >
              <component
                :is="item.icon"
                :size="18"
              />

              <strong>
                {{ item.value }}
              </strong>
            </button>

          </div>

          <div
            v-if="
              dateFrom ||
              dateTo
            "
            class="range"
          >
            Date:
            {{ dateFrom || 'Beginning' }}
            →
            {{ dateTo || 'Latest' }}
          </div>

          <div class="included">
            <strong>
              Included Data
            </strong>

            <span>
              Period code, payroll dates, employee counts,
              gross amount, deductions, net amount and status.
            </span>
          </div>

        </div>

        <footer>

          <AppButton
            variant="secondary"
            @click="emit('close')"
          >
            Cancel
          </AppButton>

          <AppButton
            :icon="Download"
            @click="
              emit('export', format)
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
.overlay {
  position: fixed;
  z-index: 99990;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(3, 8, 18, 0.76);
  backdrop-filter: blur(4px);
}

.modal {
  width: 100%;
  max-width: 620px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--bg-card);
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 18px;
  border-bottom: 1px solid var(--border-soft);
}

.heading {
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--primary);
}

h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 14px;
}

.heading p {
  margin: 3px 0 0;
  color: var(--text-muted);
  font-size: 8px;
}

.close {
  display: flex;
  width: 31px;
  height: 31px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
}

.body {
  padding: 17px 18px;
}

.summary {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 7px;
}

.summary > div {
  padding: 9px;
  border: 1px solid var(--border-soft);
  border-radius: 7px;
  background: var(--bg-card-soft);
}

.summary span,
.summary strong {
  display: block;
}

.summary span {
  color: var(--text-muted);
  font-size: 6px;
}

.summary strong {
  margin-top: 3px;
  color: var(--text-primary);
  font-size: 8px;
}

h3 {
  margin: 16px 0 8px;
  color: var(--text-primary);
  font-size: 9px;
}

.formats {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 7px;
}

.formats button {
  display: flex;
  min-height: 80px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  cursor: pointer;
}

.formats button.active {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary);
}

.formats strong {
  font-size: 8px;
}

.range,
.included {
  margin-top: 12px;
  padding: 10px;
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 8px;
}

.included strong,
.included span {
  display: block;
}

.included strong {
  color: var(--text-primary);
}

.included span {
  margin-top: 3px;
  color: var(--text-muted);
}

footer {
  display: flex;
  justify-content: flex-end;
  gap: 7px;
  padding: 13px 18px;
  border-top: 1px solid var(--border-soft);
}

@media (max-width: 600px) {
  .summary,
  .formats {
    grid-template-columns: 1fr;
  }
}
</style>