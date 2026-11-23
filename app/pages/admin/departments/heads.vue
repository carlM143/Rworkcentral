<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { AlertTriangle, RefreshCw, Save, UserCheck } from 'lucide-vue-next'
import { useDepartmentHeads, type DepartmentHeadRow } from '~/composables/admin/departments/useDepartmentHeads'

/**
 * Who approves each department's requests first (leave, overtime,
 * undertime, official business). HR approves after the head.
 */
definePageMeta({ layout: 'admin' })

const api = useDepartmentHeads()
const { success, error: toastError, warning: toastWarning } = useToast()

const rows = ref<DepartmentHeadRow[]>([])
const choice = reactive<Record<number, number | ''>>({})
const loading = ref(true)
const savingId = ref<number | null>(null)

const load = async () => {
  loading.value = true
  try {
    rows.value = (await api.list()).data
    rows.value.forEach((r) => { choice[r.id] = r.head?.employee_id ?? '' })
  } catch {
    toastError('Unable to load', 'Please try again.')
  } finally {
    loading.value = false
  }
}

onMounted(load)

const changed = (r: DepartmentHeadRow) => (choice[r.id] || null) !== (r.head?.employee_id ?? null)

const save = async (r: DepartmentHeadRow) => {
  savingId.value = r.id
  try {
    const response = await api.save(r.id, choice[r.id] ? Number(choice[r.id]) : null)
    if (response.warning) toastWarning?.('Saved, but…', response.warning)
    else success('Department head saved', `${r.name}: ${response.message}`)
    await load()
  } catch (err) {
    const e = err as { data?: { message?: string } }
    toastError('Unable to save', e?.data?.message ?? 'Please try again.')
  } finally {
    savingId.value = null
  }
}
</script>

<template>
  <section class="heads-page">
    <PageHeader
      title="Department Heads"
      description="The head approves their department's leave, overtime, undertime and official business requests first. HR gives the final approval."
    >
      <AppButton variant="secondary" :icon="RefreshCw" :disabled="loading" @click="load">Refresh</AppButton>
    </PageHeader>

    <section class="panel">
      <div v-if="loading && !rows.length" class="state">Loading departments...</div>
      <div v-else class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th scope="col">Department</th>
              <th scope="col">Department head</th>
              <th scope="col">Status</th>
              <th scope="col"><span class="sr-only">Save</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id">
              <td>
                <strong>{{ r.name }}</strong>
                <small>{{ r.members.length }} employee{{ r.members.length === 1 ? '' : 's' }}<template v-if="!r.active"> · Inactive</template></small>
              </td>
              <td>
                <select v-model="choice[r.id]" :aria-label="`Head of ${r.name}`" :disabled="!r.members.length">
                  <option value="">No head (requests go straight to HR)</option>
                  <option v-for="m in r.members" :key="m.employee_id" :value="m.employee_id">
                    {{ m.name }}{{ m.position ? ` · ${m.position}` : '' }}{{ m.has_account ? '' : ' (no account)' }}
                  </option>
                </select>
              </td>
              <td>
                <template v-if="r.head">
                  <span v-if="r.head.has_account" class="tag ok"><UserCheck :size="13" /> {{ r.head.role ?? 'Has account' }}</span>
                  <span v-else class="tag warn"><AlertTriangle :size="13" /> No user account</span>
                  <small v-if="r.head.pending">{{ r.head.pending }} waiting for approval</small>
                </template>
                <span v-else class="muted">—</span>
              </td>
              <td>
                <AppButton v-if="changed(r)" size="sm" :icon="Save" :disabled="savingId === r.id" @click="save(r)">
                  {{ savingId === r.id ? 'Saving...' : 'Save' }}
                </AppButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <p class="help">
      The head signs in to the <strong>employee portal</strong> and approves under <strong>Team Approvals</strong>.
      A head needs a user account (Users &amp; Access › System Users), usually with the Manager or Supervisor role.
      Without a head, or without an account, requests go straight to HR.
    </p>
  </section>
</template>

<style scoped>
.heads-page { display: grid; gap: 14px; width: 100%; max-width: 1300px; margin: 0 auto; }
.panel { overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.state { padding: 40px; color: var(--text-muted); text-align: center; }
.table-wrap { overflow-x: auto; }
.table { width: 100%; min-width: 780px; border-collapse: collapse; font-size: 13px; }
.table th { padding: 12px 16px; color: var(--text-secondary); font-size: 11px; font-weight: 700; text-align: left; text-transform: uppercase; letter-spacing: 0.05em; }
.table td { padding: 12px 16px; border-top: 1px solid var(--border-soft); color: var(--text-secondary); vertical-align: middle; }
.table td strong { color: var(--text-primary); }
.table td small { display: block; margin-top: 3px; color: var(--text-muted); font-size: 11px; }
.table select { width: 100%; max-width: 380px; height: 38px; padding: 0 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); font-family: inherit; font-size: 13px; }
.table select:focus-visible { border-color: var(--primary); outline: none; }
.tag { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.tag.ok { background: var(--green-soft); color: var(--green); }
.tag.warn { background: var(--orange-soft); color: var(--orange); }
.muted { color: var(--text-muted); }
.help { margin: 0; color: var(--text-secondary); font-size: 12px; line-height: 1.6; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
</style>