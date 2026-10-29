<script setup lang="ts">
import type { ApprovalUiRecord } from '~/utils/approvalUi'
import { approvalCanReview, approvalReference } from '~/utils/approvalUi'

const props = defineProps<{ request: ApprovalUiRecord }>()
const emit = defineEmits<{ action: [mode: string, request: ApprovalUiRecord] }>()

const canUndo = computed(() => {
  const st = String(props.request?.status ?? '').toLowerCase()
  return st === 'approved' || st === 'rejected'
})

const items = computed(() => [
  { key: 'view', label: 'View Details' },
  { key: 'review', label: 'Review Request', disabled: !approvalCanReview(props.request), reason: 'Only Pending or For Review requests can be reviewed.' },
  { key: 'approve', label: 'Approve Request', disabled: !approvalCanReview(props.request), reason: 'This request is already decided or cancelled.' },
  { key: 'reject', label: 'Reject Request', disabled: !approvalCanReview(props.request), reason: 'This request is already decided or cancelled.' },
  { key: 'revert', label: 'Undo / Revert to Pending', disabled: !canUndo.value, reason: 'Only Approved or Rejected requests can be reverted to Pending.' },
  { key: 'history', label: 'View History' },
])
</script>

<template>
  <PayrollActionMenu :label="'Actions for ' + approvalReference(request)" :items="items" @select="mode => emit('action', mode, request)" />
</template>
