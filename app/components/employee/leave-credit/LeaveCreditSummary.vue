<script setup lang="ts">
defineProps<{
  employeeName: string
  employmentType: string
  monthsOfService: number
}>()

const formatService = (months: number) =>
  `${months} ${months === 1 ? 'month' : 'months'}`
</script>

<template>
  <div class="credit-summary">
    <div class="summary-item">
      <span>Employee</span>
      <strong>{{ employeeName }}</strong>
    </div>

    <div class="summary-item">
      <span>Employment Type</span>
      <strong>{{ employmentType }}</strong>
    </div>

    <div class="summary-item">
      <span>Length of Service</span>
      <strong>{{ formatService(monthsOfService) }}</strong>
    </div>
  </div>
</template>

<style scoped>
.credit-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
}

.summary-item span {
  color: var(--text-muted);
  font-size: 10px;
}

.summary-item strong {
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 650;
}

@media (max-width: 650px) {
  .credit-summary {
    grid-template-columns: 1fr;
  }
}
</style>
