<script setup lang="ts">
import type { SupervisorRequestType } from '~/composables/admin/approvals/useSupervisorStage'

const props = defineProps<{ open: boolean, type: SupervisorRequestType, id: number }>()
const emit = defineEmits<{ close: [], saved: [] }>()
const { override } = useSupervisorStage()
const reason = ref('')
const error = ref('')
const busy = ref(false)
watch(() => props.open, (open) => { if (open) { reason.value = ''; error.value = '' } })

const submit = async () => {
  if (!reason.value.trim()) { error.value = 'Enter a reason for skipping department approval.'; return }
  busy.value = true
  error.value = ''
  try {
    await override(props.type, props.id, reason.value.trim())
    emit('saved')
    emit('close')
  } catch (cause) {
    const problem = cause as { data?: { message?: string, errors?: Record<string, string[]> } }
    error.value = Object.values(problem.data?.errors ?? {}).flat()[0] || problem.data?.message || 'Unable to skip department approval.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="override-overlay" @click.self="!busy && emit('close')">
      <form class="override-dialog" role="dialog" aria-modal="true" aria-labelledby="override-title" @submit.prevent="submit">
        <h2 id="override-title">Skip department approval?</h2>
        <p>Skip the remaining assigned department approvers. The request will then be ready for final approval.</p>
        <label for="department-override-reason">Reason <span aria-hidden="true">*</span></label>
        <textarea id="department-override-reason" v-model="reason" rows="3" maxlength="1000" required />
        <p v-if="error" class="override-error" role="alert">{{ error }}</p>
        <div class="override-buttons">
          <button type="button" :disabled="busy" @click="emit('close')">Cancel</button>
          <button type="submit" class="override-confirm" :disabled="busy">{{ busy ? 'Saving…' : 'Skip department approval' }}</button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style scoped>
.override-overlay { position: fixed; inset: 0; z-index: 1100; display: grid; place-items: center; padding: 20px; background: rgb(0 0 0 / 60%); }
.override-dialog { box-sizing: border-box; width: min(100%, 460px); padding: 24px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); color: var(--text-primary); }
h2 { margin: 0 0 10px; font-size: 18px; } p { color: var(--text-secondary); font-size: 13px; line-height: 1.6; }
label { display: block; margin: 16px 0 6px; font-size: 12px; font-weight: 600; }
textarea { box-sizing: border-box; width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); font: inherit; resize: vertical; }
.override-error { color: var(--red); }
.override-buttons { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
button { padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-primary); font: inherit; font-size: 12px; cursor: pointer; }
.override-confirm { border-color: var(--primary); background: var(--primary); color: white; }
button:disabled { opacity: .6; cursor: wait; }
</style>
