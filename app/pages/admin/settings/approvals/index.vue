<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  ChevronDown,
  ClipboardCheck,
  GitBranch,
  Info,
  Plus,
  RotateCcw,
  Route,
  Save,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  UserCog,
  X,
} from 'lucide-vue-next'
import AppSwitch from '~/components/shared/AppSwitch.vue'
import {
  APPROVER_LABELS,
  defaultApprovalWorkflowSettings,
  useApprovalWorkflowSettings,
  type ApprovalFlow,
  type ApprovalWorkflowSettings,
  type ApproverType,
  type RequestType,
} from '~/composables/admin/settings/useApprovalWorkflowSettings'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()
const api = useApprovalWorkflowSettings()
const { success, error: toastError } = useToast()

const MAX_LEVELS = 3
const APPROVERS = Object.keys(APPROVER_LABELS) as ApproverType[]

// =====================================================
// DATA + DIRTY TRACKING
// =====================================================

const form = ref<ApprovalWorkflowSettings>(defaultApprovalWorkflowSettings())
const snapshot = ref('')
const loading = ref(true)
const saving = ref(false)
const expanded = ref<RequestType | null>(null)

const isDirty = computed(() => !loading.value && JSON.stringify(form.value) !== snapshot.value)

onMounted(async () => {
  try {
    const response = await api.load()
    form.value = response.data
    snapshot.value = JSON.stringify(response.data)
  } finally {
    loading.value = false
  }
})

onBeforeRouteLeave(() => {
  if (isDirty.value && !saving.value) {
    return window.confirm('You have unsaved changes. Leave this page without saving?')
  }
})

// =====================================================
// HEAD KEYWORDS
// =====================================================

const keywordInput = ref('')

const addKeyword = () => {
  const word = keywordInput.value.trim()
  if (!word) return
  const exists = form.value.general.head_keywords.some(k => k.toLowerCase() === word.toLowerCase())
  if (!exists) form.value.general.head_keywords.push(word)
  keywordInput.value = ''
}

const removeKeyword = (index: number) => {
  form.value.general.head_keywords.splice(index, 1)
}

// =====================================================
// FLOWS
// =====================================================

const toggle = (type: RequestType) => {
  expanded.value = expanded.value === type ? null : type
}

const addLevel = (flow: ApprovalFlow) => {
  if (flow.levels.length >= MAX_LEVELS) return
  const next = APPROVERS.find(a => !flow.levels.includes(a)) ?? 'hr'
  flow.levels.push(next)
}

const removeLevel = (flow: ApprovalFlow, index: number) => {
  flow.levels.splice(index, 1)
}

// =====================================================
// VALIDATION
// =====================================================

const errors = computed(() => {
  const e: Record<string, string> = {}
  if (!form.value.general.head_keywords.length) e.keywords = 'Add at least one keyword.'
  form.value.flows.forEach((flow) => {
    if (flow.requires_approval && !flow.levels.length) e[flow.type] = 'Add at least one approver.'
    else if (new Set(flow.levels).size !== flow.levels.length) e[flow.type] = 'The same approver is listed twice.'
    else if (!Number.isFinite(flow.escalate_after_days) || flow.escalate_after_days < 0 || flow.escalate_after_days > 30) {
      e[flow.type] = 'Escalation must be 0 to 30 days.'
    }
  })
  return e
})

const hasErrors = computed(() => Object.keys(errors.value).length > 0)

// =====================================================
// SAVE / RESET
// =====================================================

const save = async () => {
  if (hasErrors.value) {
    const firstFlow = form.value.flows.find(f => errors.value[f.type])
    if (firstFlow) expanded.value = firstFlow.type
    toastError('Check the highlighted workflows', 'Some approval chains are incomplete.')
    return
  }
  saving.value = true
  try {
    const response = await api.save(form.value)
    form.value = response.data
    snapshot.value = JSON.stringify(response.data)
    success('Settings saved', response.message)
  } catch {
    toastError('Unable to save', 'Please try again.')
  } finally {
    saving.value = false
  }
}

const discard = () => {
  form.value = JSON.parse(snapshot.value)
}

const restoreDefaults = () => {
  if (window.confirm('Replace all workflows with the recommended defaults? Nothing is saved until you click Save Changes.')) {
    form.value = defaultApprovalWorkflowSettings()
  }
}

// =====================================================
// ROUTING PREVIEW
// =====================================================

const previewType = ref<RequestType>('leave')
const previewHasHead = ref(true)

const previewFlow = computed(() => form.value.flows.find(f => f.type === previewType.value))

const previewSteps = computed(() => {
  const flow = previewFlow.value
  if (!flow) return []
  if (!flow.requires_approval) return [{ title: 'Approved automatically', text: 'No approval needed for this request type.' }]

  const steps = flow.levels.map((approver, index) => {
    const usesFallback = approver === 'department_head' && !previewHasHead.value
    const resolved = usesFallback ? form.value.general.fallback_approver : approver
    return {
      title: `${index + 1}. ${APPROVER_LABELS[resolved]}`,
      text: usesFallback
        ? `No department head found, so it goes to the fallback approver.`
        : approver === 'department_head'
          ? `Employee whose position has "${form.value.general.head_keywords.join('", "')}" in the requester's department.`
          : 'Any user with this role.',
    }
  })

  steps.push({
    title: 'Approved',
    text: flow.escalate_after_days
      ? `If a step waits more than ${flow.escalate_after_days} day(s), it is escalated to the next approver.`
      : 'No automatic escalation.',
  })
  return steps
})

const chain = (flow: ApprovalFlow) =>
  flow.requires_approval ? flow.levels.map(l => APPROVER_LABELS[l]) : []

const links = [
  { label: 'Approval Center', hint: 'Leave, overtime and undertime requests', to: '/admin/approvals/leaves', icon: ClipboardCheck },
  { label: 'Positions', hint: 'Titles used to detect department heads', to: '/admin/positions', icon: BriefcaseBusiness },
  { label: 'Users & Access', hint: 'Who has the HR, payroll and admin roles', to: '/admin/settings/users', icon: UserCog },
  { label: 'Roles & Permissions', hint: 'What each role can approve', to: '/admin/settings/roles', icon: ShieldCheck },
]
</script>

<template>
  <section class="settings-detail-page">
    <button type="button" class="back-link" @click="router.push('/admin/settings')">
      <ArrowLeft :size="14" /> Back to Settings
    </button>

    <PageHeader
      title="Approval Workflow"
      description="Who approves each request type, in what order, and what happens when a department has no head."
    >
      <AppButton variant="secondary" :icon="RotateCcw" :disabled="loading || saving" @click="restoreDefaults">
        Restore Defaults
      </AppButton>
      <AppButton :icon="Save" :disabled="loading || saving || !isDirty" @click="save">
        {{ saving ? 'Saving...' : 'Save Changes' }}
      </AppButton>
    </PageHeader>

    <p v-if="isDirty" class="dirty-bar" role="status">
      <TriangleAlert :size="15" /> You have unsaved changes.
      <button type="button" class="back-link" style="margin: 0 0 0 auto;" @click="discard">Discard</button>
    </p>

    <div class="content-grid">
      <div class="form-column">
        <!-- GENERAL -->
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><GitBranch :size="17" /></span>
            <div>
              <h2>General Rules</h2>
              <p>Apply to every request type below.</p>
            </div>
          </header>
          <div class="panel-body form-grid">
            <div class="field wide" :class="{ invalid: errors.keywords }">
              <label for="ap-keyword">Department head positions</label>
              <div class="chips">
                <span v-for="(word, index) in form.general.head_keywords" :key="word" class="chip">
                  {{ word }}
                  <button type="button" :aria-label="`Remove ${word}`" @click="removeKeyword(index)"><X :size="12" /></button>
                </span>
              </div>
              <div class="keyword-row">
                <div class="unit-input">
                  <input
                    id="ap-keyword"
                    v-model="keywordInput"
                    type="text"
                    placeholder="e.g. Director"
                    @keydown.enter.prevent="addKeyword"
                  >
                </div>
                <button type="button" class="ghost-btn" @click="addKeyword"><Plus :size="14" /> Add</button>
              </div>
              <small :class="{ 'field-error': errors.keywords }">
                {{ errors.keywords || 'An employee whose position title contains one of these words is the head of their department (e.g. "Operations Manager").' }}
              </small>
            </div>

            <div class="field">
              <label for="ap-fallback">When a department has no head</label>
              <select id="ap-fallback" v-model="form.general.fallback_approver">
                <option v-for="approver in APPROVERS.filter(a => a !== 'department_head' && a !== 'immediate_supervisor')" :key="approver" :value="approver">
                  Send to {{ APPROVER_LABELS[approver] }}
                </option>
              </select>
            </div>

            <div class="field wide">
              <AppSwitch id="ap-self" v-model="form.general.allow_self_approval" label="Allow approving your own request" description="Off is recommended: a different person must approve (maker-checker)." />
              <AppSwitch id="ap-reason" v-model="form.general.require_rejection_reason" label="Require a reason when rejecting" description="The reason is shown to the employee." />
              <AppSwitch id="ap-notify" v-model="form.general.notify_requester" label="Notify the requester on every decision" description="Approved, rejected or escalated." />
            </div>
          </div>
        </section>

        <!-- FLOWS -->
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><Route :size="17" /></span>
            <div>
              <h2>Request Types</h2>
              <p>Up to {{ MAX_LEVELS }} approval levels each. Click a request type to edit its chain.</p>
            </div>
          </header>
          <ul class="flow-list">
            <li v-for="flow in form.flows" :key="flow.type" class="flow" :class="{ open: expanded === flow.type, invalid: errors[flow.type] }">
              <button
                type="button"
                class="flow-head"
                :aria-expanded="expanded === flow.type"
                :aria-controls="`flow-${flow.type}`"
                @click="toggle(flow.type)"
              >
                <span class="flow-title">
                  <strong>{{ flow.label }}</strong>
                  <small>{{ flow.description }} · {{ flow.module }}</small>
                </span>
                <span class="flow-chain">
                  <template v-if="flow.requires_approval && flow.levels.length">
                    <template v-for="(name, index) in chain(flow)" :key="index">
                      <span class="step">{{ name }}</span>
                      <ArrowRight v-if="index < chain(flow).length - 1" :size="12" class="step-arrow" />
                    </template>
                  </template>
                  <span v-else-if="!flow.requires_approval" class="step auto">Auto-approved</span>
                  <span v-else class="step missing">No approver</span>
                </span>
                <ChevronDown :size="16" class="flow-chevron" />
              </button>

              <div v-if="expanded === flow.type" :id="`flow-${flow.type}`" class="flow-body">
                <AppSwitch :id="`ap-req-${flow.type}`" v-model="flow.requires_approval" label="Requires approval" description="When off, the request is approved as soon as it is filed." />

                <template v-if="flow.requires_approval">
                  <p class="subhead">Approval chain</p>
                  <ol class="levels">
                    <li v-for="(approver, index) in flow.levels" :key="index">
                      <span class="level-no">{{ index + 1 }}</span>
                      <select v-model="flow.levels[index]" :aria-label="`Level ${index + 1} approver`">
                        <option v-for="option in APPROVERS" :key="option" :value="option">{{ APPROVER_LABELS[option] }}</option>
                      </select>
                      <button type="button" class="icon-btn" :aria-label="`Remove level ${index + 1}`" @click="removeLevel(flow, index)">
                        <Trash2 :size="14" />
                      </button>
                    </li>
                  </ol>
                  <button v-if="flow.levels.length < MAX_LEVELS" type="button" class="ghost-btn" @click="addLevel(flow)">
                    <Plus :size="14" /> Add level
                  </button>

                  <div class="field" style="margin-top: 14px; max-width: 280px;">
                    <label :for="`ap-esc-${flow.type}`">Escalate a waiting step after</label>
                    <div class="unit-input">
                      <input :id="`ap-esc-${flow.type}`" v-model.number="flow.escalate_after_days" type="number" min="0" max="30" inputmode="numeric">
                      <span>days</span>
                    </div>
                    <small>0 means never escalate.</small>
                  </div>
                </template>

                <p v-if="errors[flow.type]" class="field-error" style="margin: 10px 0 0; font-size: 12px;">{{ errors[flow.type] }}</p>
              </div>
            </li>
          </ul>
        </section>
      </div>

      <!-- SIDE -->
      <aside class="side-column">
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><Route :size="17" /></span>
            <div>
              <h2>Routing Preview</h2>
              <p>Where a request goes after it is filed.</p>
            </div>
          </header>
          <div class="preview-body">
            <div class="field">
              <label for="pv-type">Request type</label>
              <select id="pv-type" v-model="previewType">
                <option v-for="flow in form.flows" :key="flow.type" :value="flow.type">{{ flow.label }}</option>
              </select>
            </div>
            <AppSwitch id="pv-head" v-model="previewHasHead" label="The department has a head" />
            <ol class="route-steps">
              <li v-for="step in previewSteps" :key="step.title">
                <strong>{{ step.title }}</strong>
                <span>{{ step.text }}</span>
              </li>
            </ol>
          </div>
        </section>

        <section class="panel">
          <header class="panel-header">
            <div>
              <h2>Related Pages</h2>
              <p>Requests, positions and roles used by the workflow.</p>
            </div>
          </header>
          <ul class="link-list">
            <li v-for="link in links" :key="link.to">
              <button type="button" @click="router.push(link.to)">
                <component :is="link.icon" :size="16" />
                <span>
                  {{ link.label }}
                  <small>{{ link.hint }}</small>
                </span>
                <ArrowRight :size="14" class="link-arrow" />
              </button>
            </li>
          </ul>
        </section>

        <p class="note">
          <Info :size="15" />
          Saved in this browser session only for now. The values will be stored once the settings backend is connected.
        </p>
      </aside>
    </div>
  </section>
</template>

<style scoped src="../../../../assets/css/settings-form.css"></style>

<style scoped>
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px 4px 10px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--bg-card-soft);
  font-size: 12px;
}

.chip button {
  display: flex;
  padding: 2px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.chip button:hover { color: var(--red); }

.keyword-row {
  display: flex;
  gap: 8px;
  max-width: 360px;
}

.keyword-row .unit-input { flex: 1; }

.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: transparent;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.ghost-btn:focus-visible,
.icon-btn:focus-visible,
.flow-head:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* ===== Flows ===== */

.flow-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.flow { border-bottom: 1px solid var(--border-soft); }
.flow:last-child { border-bottom: 0; }
.flow.invalid { box-shadow: inset 3px 0 0 var(--red); }

.flow-head {
  display: grid;
  width: 100%;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr) auto;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border: 0;
  background: transparent;
  color: var(--text-primary);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}

.flow-head:hover { background: var(--bg-card-soft); }

.flow-title strong {
  display: block;
  font-size: 13px;
}

.flow-title small {
  display: block;
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 11px;
}

.flow-chain {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.step {
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 11px;
  font-weight: 600;
}

.step.auto { background: var(--green-soft); color: var(--green); }
.step.missing { background: var(--red-soft); color: var(--red); }
.step-arrow { color: var(--text-muted); }

.flow-chevron {
  color: var(--text-muted);
  transition: transform 0.18s ease;
}

.flow.open .flow-chevron { transform: rotate(180deg); }

.flow-body {
  padding: 4px 18px 18px;
  background: var(--bg-card-soft);
}

.levels {
  display: grid;
  gap: 8px;
  margin: 8px 0 10px;
  padding: 0;
  list-style: none;
}

.levels li {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 420px;
}

.level-no {
  display: flex;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.levels select {
  flex: 1;
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 13px;
}

.icon-btn {
  display: flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.icon-btn:hover { color: var(--red); border-color: var(--red); }

/* ===== Preview ===== */

.route-steps {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.route-steps li {
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-left: 3px solid var(--primary);
  border-radius: 9px;
  background: var(--bg-card-soft);
}

.route-steps li:last-child { border-left-color: var(--green); }

.route-steps strong {
  display: block;
  font-size: 13px;
}

.route-steps span {
  display: block;
  margin-top: 3px;
  color: var(--text-secondary);
  font-size: 11px;
  line-height: 1.5;
}

@media (max-width: 760px) {
  .flow-head { grid-template-columns: 1fr auto; }
  .flow-chain { grid-column: 1 / -1; grid-row: 2; }
}
</style>