<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  export: [payload: {
    format: string
    scope: string
    includeEmployee: boolean
    includeDepartment: boolean
    includeRateType: boolean
    includePayBasis: boolean
    includeBasicRate: boolean
    includeHourlyRate: boolean
    includeOtRate: boolean
    includeTripRate: boolean
    includeEffectiveDate: boolean
    includeStatus: boolean
  }]
}>()

const format = ref('excel')
const scope = ref('filtered')

const includeEmployee = ref(true)
const includeDepartment = ref(true)
const includeRateType = ref(true)
const includePayBasis = ref(true)
const includeBasicRate = ref(true)
const includeHourlyRate = ref(true)
const includeOtRate = ref(true)
const includeTripRate = ref(true)
const includeEffectiveDate = ref(true)
const includeStatus = ref(true)

const handleClose = () => {
  emit('close')
}

const handleExport = () => {
  emit('export', {
    format: format.value,
    scope: scope.value,
    includeEmployee: includeEmployee.value,
    includeDepartment: includeDepartment.value,
    includeRateType: includeRateType.value,
    includePayBasis: includePayBasis.value,
    includeBasicRate: includeBasicRate.value,
    includeHourlyRate: includeHourlyRate.value,
    includeOtRate: includeOtRate.value,
    includeTripRate: includeTripRate.value,
    includeEffectiveDate: includeEffectiveDate.value,
    includeStatus: includeStatus.value,
  })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="export-modal-overlay"
      @click.self="handleClose"
    >
      <div class="export-modal">
        <div class="export-modal-header">
          <div>
            <h3>Export Payroll Rates</h3>
            <p>
              Configure the export file before downloading the payroll rates data.
            </p>
          </div>

          <button
            type="button"
            class="close-button"
            @click="handleClose"
          >
            ✕
          </button>
        </div>

        <div class="export-modal-body">
          <div class="field-grid">
            <div class="field-group">
              <label>Export Format</label>

              <select v-model="format">
                <option value="excel">Excel (.xlsx)</option>
                <option value="csv">CSV (.csv)</option>
                <option value="pdf">PDF (.pdf)</option>
              </select>
            </div>

            <div class="field-group">
              <label>Export Scope</label>

              <select v-model="scope">
                <option value="filtered">Filtered Results</option>
                <option value="current">Current Page</option>
                <option value="all">All Records</option>
              </select>
            </div>
          </div>

          <div class="checkbox-section">
            <h4>Include Columns</h4>

            <div class="checkbox-grid">
              <label>
                <input v-model="includeEmployee" type="checkbox">
                Employee
              </label>

              <label>
                <input v-model="includeDepartment" type="checkbox">
                Department
              </label>

              <label>
                <input v-model="includeRateType" type="checkbox">
                Rate Type
              </label>

              <label>
                <input v-model="includePayBasis" type="checkbox">
                Pay Basis
              </label>

              <label>
                <input v-model="includeBasicRate" type="checkbox">
                Basic Rate
              </label>

              <label>
                <input v-model="includeHourlyRate" type="checkbox">
                Hourly Rate
              </label>

              <label>
                <input v-model="includeOtRate" type="checkbox">
                OT Rate
              </label>

              <label>
                <input v-model="includeTripRate" type="checkbox">
                Trip Rate
              </label>

              <label>
                <input v-model="includeEffectiveDate" type="checkbox">
                Effective Date
              </label>

              <label>
                <input v-model="includeStatus" type="checkbox">
                Status
              </label>
            </div>
          </div>
        </div>

        <div class="export-modal-footer">
          <button
            type="button"
            class="secondary-button"
            @click="handleClose"
          >
            Cancel
          </button>

          <button
            type="button"
            class="primary-button"
            @click="handleExport"
          >
            Export File
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.export-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background: rgba(3, 8, 20, 0.72);
  backdrop-filter: blur(4px);
}

.export-modal {
  width: 100%;
  max-width: 720px;

  border: 1px solid var(--border);
  border-radius: 16px;

  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.export-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;

  padding: 18px 20px;

  border-bottom: 1px solid var(--border-soft);
}

.export-modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 700;
}

.export-modal-header p {
  margin: 6px 0 0;
  color: var(--text-muted);
  font-size: 12px;
}

.close-button {
  border: 0;
  background: transparent;
  color: var(--text-muted);
  font-size: 16px;
  cursor: pointer;
}

.export-modal-body {
  padding: 20px;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field-group label,
.checkbox-section h4 {
  margin: 0;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 650;
}

.field-group select {
  width: 100%;
  height: 42px;

  padding: 0 12px;

  border: 1px solid var(--border);
  border-radius: 10px;

  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-size: 12px;
  outline: none;
}

.checkbox-section {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid var(--border-soft);
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 14px;
  margin-top: 12px;
}

.checkbox-grid label {
  display: flex;
  align-items: center;
  gap: 8px;

  color: var(--text-secondary);
  font-size: 12px;
}

.export-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  padding: 16px 20px 20px;
  border-top: 1px solid var(--border-soft);
}

.secondary-button,
.primary-button {
  min-width: 120px;
  height: 42px;
  padding: 0 16px;

  border-radius: 10px;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}

.secondary-button {
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
}

.primary-button {
  border: 0;
  background: var(--primary);
  color: white;
}

@media (max-width: 640px) {
  .field-grid,
  .checkbox-grid {
    grid-template-columns: 1fr;
  }

  .export-modal-footer {
    flex-direction: column;
  }

  .secondary-button,
  .primary-button {
    width: 100%;
  }
}
</style>