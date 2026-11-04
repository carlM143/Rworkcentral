
<script setup lang="ts">
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import LoanTypeActions from './LoanTypeActions.vue'

import type {
  LoanType,
} from '~/types/loans/loan-types/loanType'

withDefaults(
  defineProps<{
    loanTypes: LoanType[]
    loading?: boolean
    busy?: boolean
  }>(),
  {
    loading: false,
    busy: false,
  },
)

defineEmits<{
  edit: [item: LoanType]
  delete: [item: LoanType]
}>()
</script>

<template>
  <BaseDataTable
    title="Loan Types Directory"
    description="View and manage loan categories and their providers."
    :has-rows="loanTypes.length > 0"
    :loading="loading"
    min-width="700px"
    empty-title="No loan types found"
    empty-description="No records match your current filters."
  >
    <template #headers>
      <th>Loan Code</th>
      <th>Loan Name</th>
      <th>Provider</th>
      <th>Status</th>
      <th class="action-column">Actions</th>
    </template>

    <template #rows>
      <tr
        v-for="item in loanTypes"
        :key="item.id"
      >
        <td>
          <span class="loan-code">
            {{ item.loan_code }}
          </span>
        </td>

        <td>
          <span class="loan-name">
            {{ item.loan_name }}
          </span>
        </td>

        <td>
          {{ item.provider || 'Not provided' }}
        </td>

        <td>
          <span
            class="status-pill"
            :class="
              item.status
                ? 'status-pill--active'
                : 'status-pill--inactive'
            "
          >
            {{ item.status ? 'Active' : 'Inactive' }}
          </span>
        </td>

        <td class="action-column">
          <LoanTypeActions
            :loan-type="item"
            :busy="busy"
            @edit="$emit('edit', $event)"
            @delete="$emit('delete', $event)"
          />
        </td>
      </tr>
    </template>
  </BaseDataTable>
</template>

<style scoped>
.loan-code {
  color: var(--primary, #327bff);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.loan-name {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
}

.action-column {
  width: 76px;
  text-align: right !important;
  white-space: nowrap;
}
</style>
