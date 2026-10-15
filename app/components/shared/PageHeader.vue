<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="page-header">
    <div>
      <h1>
        {{ title }}
      </h1>

      <p v-if="description">
        {{ description }}
      </p>
    </div>

    <div class="page-header-actions">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;

  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;

  color: var(--text-primary);

  font-size: 26px;
  font-weight: 750;
  letter-spacing: -0.6px;
}

.page-header p {
  margin: 6px 0 0;

  color: var(--text-secondary);

  font-size: 12px;
}

.page-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 600px) {
  .page-header {
    flex-direction: column;
  }

  .page-header-actions {
    width: 100%;
  }
}
</style>