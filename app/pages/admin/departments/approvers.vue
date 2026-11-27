<script setup lang="ts">
import { Save } from 'lucide-vue-next'
import { useDepartmentApi, type DepartmentApiRecord } from '~/composables/admin/departments/useDepartmentApi'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Request Approvers | RWorkCentral' })

type Member = {
  id: number
  name: string
  position: string | null
  assigned: boolean
  eligible: boolean
}

const { $api } = useNuxtApp()
const departmentApi = useDepartmentApi()
const departments = ref<DepartmentApiRecord[]>([])
const departmentId = ref<number | null>(null)
const members = ref<Member[]>([])
const selected = ref<number[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const message = ref('')
let loadVersion = 0

const errorText = (cause: unknown) => {
  const result = cause as { data?: { message?: string }, message?: string }
  return result.data?.message || result.message || 'Please try again.'
}

onMounted(async () => {
  try {
    departments.value = (await departmentApi.getDepartments()).data
    departmentId.value = departments.value[0]?.id ?? null
  } catch (cause) {
    error.value = errorText(cause)
  }
})

watch(departmentId, async (id) => {
  const version = ++loadVersion
  members.value = []
  selected.value = []
  error.value = ''
  message.value = ''
  if (!id) return
  loading.value = true
  try {
    const response = await $api<{ data: Member[] }>(`/admin/departments/${id}/approvers`)
    if (version !== loadVersion) return
    members.value = response.data
    selected.value = response.data.filter(member => member.assigned).map(member => member.id)
  } catch (cause) {
    if (version === loadVersion) error.value = errorText(cause)
  } finally {
    if (version === loadVersion) loading.value = false
  }
})

const save = async () => {
  if (!departmentId.value || saving.value) return
  saving.value = true
  error.value = ''
  message.value = ''
  try {
    await $api(`/admin/departments/${departmentId.value}/approvers`, {
      method: 'PUT',
      body: { employee_ids: selected.value },
    })
    members.value = members.value.map(member => ({ ...member, assigned: selected.value.includes(member.id) }))
    message.value = 'Approver assignments saved.'
  } catch (cause) {
    error.value = errorText(cause)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="approvers-page">
    <PageHeader title="Request Approvers" description="Assign employees to approve requests for their department." />

    <div class="notice" role="status">
      All eligible assigned approvers must approve before a request goes to HR for final approval.
      New requests keep their approver list when filed; changing assignments does not replace that list.
    </div>

    <div class="panel">
      <label for="department">Department</label>
      <select id="department" v-model="departmentId" :disabled="saving">
        <option v-if="!departments.length" :value="null">No departments available</option>
        <option v-for="department in departments" :key="department.id" :value="department.id">
          {{ department.department_name }}
        </option>
      </select>

      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <p v-if="message" class="success" role="status">{{ message }}</p>
      <p v-if="loading" class="hint">Loading employees…</p>
      <template v-else-if="departmentId">
        <p class="hint">Employees must be active and have an account with both For My Approval view and approve permissions. Remove any ineligible assignments before saving.</p>
        <p v-if="!members.length" class="hint">No employees found in this department.</p>
        <div v-else class="member-list">
          <label v-for="member in members" :key="member.id" class="member">
            <input v-model="selected" type="checkbox" :value="member.id" :disabled="saving || (!member.eligible && !selected.includes(member.id))">
            <span class="member-info">
              <strong>{{ member.name }}</strong>
              <span>{{ member.position || 'No position' }}</span>
            </span>
            <span class="badge" :class="{ eligible: member.eligible }">
              {{ member.eligible ? 'Eligible' : 'Not eligible' }}
            </span>
          </label>
        </div>
        <AppButton :icon="Save" :disabled="saving" @click="save">{{ saving ? 'Saving…' : 'Save Assignments' }}</AppButton>
      </template>
    </div>
  </section>
</template>

<style scoped>
.approvers-page { display: grid; gap: 14px; max-width: 1300px; margin: 0 auto; }
.panel { display: grid; gap: 12px; padding: 20px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.panel > label { font-size: 13px; font-weight: 600; }
select { width: 100%; max-width: 420px; min-height: 40px; padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); background: var(--bg-card-soft); }
.notice { padding: 12px 14px; border: 1px solid var(--border); border-radius: 8px; color: var(--text-secondary); font-size: 13px; }
.hint { margin: 0; color: var(--text-secondary); font-size: 13px; }
.error { color: var(--red); } .success { color: var(--green); }
.member-list { display: grid; gap: 8px; }
.member { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--border); border-radius: 8px; }
.member-info { display: grid; gap: 3px; flex: 1; min-width: 0; font-size: 13px; }
.member-info span { color: var(--text-secondary); }
.badge { font-size: 12px; color: var(--text-secondary); }
.badge.eligible { color: var(--green); }
</style>
