<script setup lang="ts">
import { X, BriefcaseBusiness, Save } from 'lucide-vue-next'
import type { EmploymentTypePayload, EmploymentTypeRecord } from '~/composables/admin/employmentTypes/useEmploymentTypeApi'

const props = defineProps<{
  open: boolean
  employmentType?: EmploymentTypeRecord | null
  saving: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [data: EmploymentTypePayload, id?: number]
}>()

const { error } = useToast()

const form = reactive<EmploymentTypePayload>({
  name: '',
  description: '',
  status: 'active',
})

const isEdit = computed(() => Boolean(props.employmentType))

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    if (props.employmentType) {
      form.name = props.employmentType.name
      form.description = props.employmentType.description || ''
      form.status = props.employmentType.status || 'active'
    } else {
      form.name = ''
      form.description = ''
      form.status = 'active'
    }
  }
})

const handleSave = () => {
  if (!form.name.trim()) {
    error('Name Required', 'Please enter an employment type name.')
    return
  }

  emit('save', {
    name: form.name.trim(),
    description: form.description?.trim() || undefined,
    status: form.status,
  }, props.employmentType?.id)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal-backdrop" @click.self="emit('close')">
        <div class="modal-card">
          <div class="modal-header">
            <div class="header-left">
              <div class="header-icon"><BriefcaseBusiness :size="20" /></div>
              <div>
                <h2>{{ isEdit ? 'Edit Employment Type' : 'Add Employment Type' }}</h2>
                <p>Configure employment classification and status.</p>
              </div>
            </div>
            <button type="button" class="close-button" @click="emit('close')"><X :size="18" /></button>
          </div>

          <div class="modal-body">
            <div class="field-group">
              <label>Employment Type Name <span>*</span></label>
              <AppInput v-model="form.name" placeholder="Example: Contractual, Part-time, Permanent" />
            </div>

            <div class="field-group">
              <label>Description</label>
              <textarea v-model="form.description" class="native-textarea" placeholder="Optional description..." rows="3" />
            </div>

            <div class="field-group">
              <label>Status</label>
              <AppSelect v-model="form.status" :options="['active', 'inactive']" />
            </div>
          </div>

          <div class="modal-footer">
            <AppButton variant="secondary" @click="emit('close')">Cancel</AppButton>
            <AppButton :icon="Save" :disabled="saving" @click="handleSave">
              {{ saving ? 'Saving...' : 'Save Employment Type' }}
            </AppButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(3, 8, 18, 0.74); backdrop-filter: blur(3px); }
.modal-card { display: flex; width: 100%; max-width: 520px; flex-direction: column; overflow: hidden; border: 1px solid var(--border); border-radius: 13px; background: var(--bg-card); box-shadow: 0 24px 80px rgba(0, 0, 0, 0.38); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; border-bottom: 1px solid var(--border-soft); }
.header-left { display: flex; align-items: center; gap: 11px; }
.header-icon { display: flex; width: 40px; height: 40px; align-items: center; justify-content: center; border-radius: 10px; background: var(--primary-soft); color: var(--primary); }
.modal-header h2 { margin: 0; font-size: 15px; font-weight: 700; color: var(--text-primary); }
.modal-header p { margin: 3px 0 0; font-size: 10px; color: var(--text-muted); }
.close-button { display: flex; width: 34px; height: 34px; align-items: center; justify-content: center; border: 1px solid var(--border); border-radius: 7px; background: transparent; color: var(--text-secondary); cursor: pointer; }
.close-button:hover { background: var(--bg-card-soft); color: var(--text-primary); }
.modal-body { padding: 18px; display: flex; flex-direction: column; gap: 14px; }
.field-group label { display: block; margin-bottom: 6px; font-size: 10px; font-weight: 600; color: var(--text-primary); }
.field-group label span { color: var(--red); }
.native-textarea { width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 7px; background: var(--bg-card); color: var(--text-primary); font-family: inherit; font-size: 11px; outline: none; resize: vertical; }
.native-textarea:focus { border-color: var(--primary); }
.modal-footer { display: flex; align-items: center; justify-content: flex-end; gap: 8px; padding: 14px 18px; border-top: 1px solid var(--border-soft); background: var(--bg-card-soft); }
</style>
