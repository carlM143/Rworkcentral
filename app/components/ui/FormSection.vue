<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  title: string
  description?: string
  icon?: Component
}>()
</script>

<template>
  <section class="form-section">
    <div class="form-section-header">
      <div
        v-if="icon"
        class="section-icon"
      >
        <component
          :is="icon"
          :size="20"
        />
      </div>

      <div class="section-heading">
        <h3>{{ title }}</h3>

        <p v-if="description">
          {{ description }}
        </p>
      </div>
    </div>

    <div class="form-section-body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.form-section {
  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 12px;

  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.form-section-header {
  display: flex;
  align-items: center;
  gap: 12px;

  padding: 17px 19px;

  border-bottom: 1px solid var(--border-soft);
}

.section-icon {
  display: flex;
  width: 39px;
  height: 39px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background: var(--primary-soft);
  color: var(--primary);
}

.section-heading h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: 14px;
  font-weight: 700;
}

.section-heading p {
  margin: 4px 0 0;

  color: var(--text-muted);

  font-size: 10px;
}

.form-section-body {
  padding: 20px;
}

@media (max-width: 650px) {
  .form-section-body {
    padding: 16px;
  }
}
</style>