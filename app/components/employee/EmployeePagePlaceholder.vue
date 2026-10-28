<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <section class="employee-page-placeholder">
    <span class="employee-page-placeholder__eyebrow">RWorkCentral</span>
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>

    <div class="employee-page-placeholder__card">
      <strong>Coming soon</strong>
      <span>
        The employee workspace is separated and ready for your development team.
      </span>
    </div>
  </section>
</template>

<style scoped>
.employee-page-placeholder {
  max-width: 980px;
}

.employee-page-placeholder__eyebrow {
  color: #4f8cff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin: 8px 0 6px;
  color: #f8fafc;
  font-size: clamp(28px, 4vw, 38px);
}

p {
  max-width: 650px;
  margin: 0;
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.7;
}

.employee-page-placeholder__card {
  display: grid;
  gap: 7px;
  margin-top: 30px;
  padding: 24px;
  border: 1px solid #24344d;
  border-radius: 14px;
  background: #141f31;
}

.employee-page-placeholder__card strong {
  color: #e2e8f0;
  font-size: 14px;
}

.employee-page-placeholder__card span {
  color: #7f8da3;
  font-size: 12px;
}
</style>
