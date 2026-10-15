<script setup lang="ts">
const props = defineProps<{
  status: string
}>()

const badgeClass = computed(() => {
  const status = props.status.toLowerCase()

  if (
    ['active', 'regular', 'approved', 'completed', 'paid', 'present', 'complete', 'ready']
      .includes(status)
  ) {
    return 'success'
  }

    if (
    [
      'probationary',
      'pending',
      'for review',
      'on leave',
      'late',
      'incomplete',
      'with issue',
      'draft',
      'expiring soon',
      'not started',
      'in progress',
      'scheduled',
      'invited',
    ].includes(status)
  ) {
    return 'warning'
  }

  if (
    [
      'contractual',
      'project-based',
      'processing',
      'preparing',
    ].includes(status)
  ) {
    return 'purple'
  }

  if (
    ['inactive', 'rejected', 'cancelled', 'absent', 'missing log', 'expired', 'overdue', 'missing', 'disabled']
      .includes(status)
  ) {
    return 'danger'
  }

  return 'neutral'
})
</script>

<template>
  <span
    class="status-badge"
    :class="badgeClass"
  >
    <span class="status-dot" />

    {{ status }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  gap: 6px;

  padding: 3px 9px;

  border-radius: 20px;

  font-size: 10px;
  font-weight: 600;
}

.status-dot {
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: currentColor;
}

.success {
  background: var(--green-soft);
  color: var(--green);
}

.warning {
  background: var(--orange-soft);
  color: var(--orange);
}

.purple {
  background: var(--purple-soft);
  color: var(--purple);
}

.danger {
  background: var(--red-soft);
  color: var(--red);
}

.neutral {
  background: var(--bg-card-soft);
  color: var(--text-secondary);
}
</style>