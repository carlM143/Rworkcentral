<script setup lang="ts">
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'

definePageMeta({
  layout: 'admin',
})
</script>

<template>
  <section class="change-schedule-page">
    <PageHeader
      title="Change Schedule"
      description="Review and manage employee work-schedule change records."
    />

    <BaseDataTable
      title="Schedule Changes"
      description="Employee schedule changes will be displayed here."
      :has-rows="false"
      min-width="1000px"
      empty-title="No schedule changes found"
      empty-description="There are currently no employee schedule-change records."
    >
      <template #headers>
        <th>Employee</th>
        <th>Current Schedule</th>
        <th>New Schedule</th>
        <th>Effective Date</th>
        <th>Status</th>
        <th>Actions</th>
      </template>
    </BaseDataTable>
  </section>
</template>

<style scoped>
.change-schedule-page {
  width: 100%;
  max-width: 1660px;
  min-width: 0;
  margin: 0 auto;
}
</style>
