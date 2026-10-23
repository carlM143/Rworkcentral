
<script setup lang="ts">
import { WalletCards, Banknote, Landmark, BadgeDollarSign, CalendarClock, Info } from 'lucide-vue-next'

const { form } = useEmployeeForm()
const { $api } = useNuxtApp()
const { error: showError } = useToast()

interface SalaryTypeRecord { id: number; type_name: string }
interface ApiResponse<T> { success: boolean; message: string; data: T }

const salaryTypes = ref<SalaryTypeRecord[]>([])
const loadingSalaryTypes = ref(false)
const salaryTypeError = ref(false)

const salaryTypeOptions = computed(() => salaryTypes.value.map(item => item.type_name))

const banks = ['BDO', 'BPI', 'Metrobank', 'Landbank', 'UnionBank', 'Security Bank', 'RCBC', 'PNB', 'Other']

const loadSalaryTypes = async () => {
  loadingSalaryTypes.value = true
  salaryTypeError.value = false

  try {
    const response = await $api<ApiResponse<SalaryTypeRecord[]>>('/admin/salary-types', { method: 'GET' })
    salaryTypes.value = response.data

    const selected = response.data.find(item => item.id === form.value.salaryTypeId)
      ?? response.data.find(item => item.type_name === form.value.salaryType)

    form.value.salaryTypeId = selected?.id ?? null
    form.value.salaryType = selected?.type_name ?? ''
  } catch (problem) {
    salaryTypes.value = []
    salaryTypeError.value = true
    showError('Salary Types Unavailable', 'Could not load salary types from Laravel.')
    console.error('Salary Type API Error:', problem)
  } finally {
    loadingSalaryTypes.value = false
  }
}


watch(() => form.value.salaryType, name => {
  const selected = salaryTypes.value.find(item => item.type_name === name)
  form.value.salaryTypeId = selected?.id ?? null
})

onMounted(() => {
  void loadSalaryTypes()
})

const formatMoney = (value: string) => Number(value).toLocaleString('en-PH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const salaryDisplay = computed(() => {
  if (form.value.salaryType === 'Monthly' && form.value.basicSalary)
    return `₱${formatMoney(form.value.basicSalary)}`
  if (form.value.salaryType === 'Daily' && form.value.dailyRate)
    return `₱${formatMoney(form.value.dailyRate)} / day`
  if (form.value.salaryType === 'Hourly' && form.value.hourlyRate)
    return `₱${formatMoney(form.value.hourlyRate)} / hour`
  return 'Not provided'
})

const allowanceDisplay = computed(() => form.value.allowance
  ? `₱${formatMoney(form.value.allowance)}`
  : 'No allowance')





</script>

<template>
  <FormSection
    title="Salary Setup"
    description="Optional during hiring. Save compensation now or complete it later in Edit Employee."
    :icon="WalletCards"
  >
    <div class="payroll-layout">
      <!-- LEFT SUMMARY -->
      <aside class="summary-column">
        <div class="summary-heading">
          <div class="summary-main-icon"><WalletCards :size="28" /></div>
          <strong>Salary Setup</strong>
          <span>Optional during hiring</span>
        </div>

        <div class="payroll-summary">
          <div class="summary-item">
            <div class="summary-icon"><CalendarClock :size="15" /></div>
            <div><span>Salary Type</span><strong>{{ form.salaryType || 'Not selected' }}</strong></div>
          </div>

          <div class="summary-item">
            <div class="summary-icon"><BadgeDollarSign :size="15" /></div>
            <div><span>Primary Rate</span><strong>{{ salaryDisplay }}</strong></div>
          </div>

          <div class="summary-item">
            <div class="summary-icon"><Banknote :size="15" /></div>
            <div><span>Allowance</span><strong>{{ allowanceDisplay }}</strong></div>
          </div>
        </div>

        <div class="summary-note">
          You may leave this step completely blank and finish it later. If entering any salary details, select a Salary Type first. Payroll Group and Payroll Period are assigned during payroll processing.
        </div>
      </aside>

      <!-- RIGHT FORM -->
      <div class="payroll-form">
        <div class="section-title">
          <div class="section-title-icon"><BadgeDollarSign :size="17" /></div>
          <div>
            <strong>Compensation Setup</strong>
            <span>Define the employee's salary type, base rate and recurring allowance.</span>
          </div>
        </div>

        <div class="form-grid two-column">
          <!-- SALARY TYPE FROM LARAVEL -->
          <div class="form-field">
            <label class="field-label">Salary Type (optional)</label>
            <AppSelect
              v-model="form.salaryType"
              :options="salaryTypeOptions"
              :placeholder="loadingSalaryTypes ? 'Loading salary types...' : 'Select salary type'"
            />
            <small v-if="salaryTypeError" class="field-hint error-hint">
              Unable to load salary types.
              <button type="button" @click="loadSalaryTypes">Retry</button>
            </small>
            <small v-else-if="!loadingSalaryTypes && !salaryTypeOptions.length" class="field-hint">
              No salary types found in the database.
            </small>
            <small v-else class="field-hint">Determines which rate will be used as the employee's primary pay basis.</small>
          </div>

        </div>

        <!-- MONTHLY RATE -->
        <div v-if="form.salaryType === 'Monthly'" class="rate-container">
          <div class="form-field">
            <label class="field-label">Basic Monthly Salary</label>
            <div class="money-field">
              <span class="currency">₱</span>
              <AppInput v-model="form.basicSalary" placeholder="0.00" />
            </div>
            <small class="field-hint">Employee's standard monthly basic salary before deductions.</small>
          </div>
        </div>

        <!-- DAILY RATE -->
        <div v-else-if="form.salaryType === 'Daily'" class="rate-container">
          <div class="form-field">
            <label class="field-label">Daily Rate</label>
            <div class="money-field">
              <span class="currency">₱</span>
              <AppInput v-model="form.dailyRate" placeholder="0.00" />
            </div>
            <small class="field-hint">Standard compensation for one regular working day.</small>
          </div>
        </div>

        <!-- HOURLY RATE -->
        <div v-else-if="form.salaryType === 'Hourly'" class="rate-container">
          <div class="form-field">
            <label class="field-label">Hourly Rate</label>
            <div class="money-field">
              <span class="currency">₱</span>
              <AppInput v-model="form.hourlyRate" placeholder="0.00" />
            </div>
            <small class="field-hint">Standard compensation for one working hour.</small>
          </div>
        </div>

        <!-- ALLOWANCE -->
        <div class="form-grid two-column form-row">
          <div class="form-field">
            <label class="field-label">Fixed Allowance</label>
            <div class="money-field">
              <span class="currency">₱</span>
              <AppInput v-model="form.allowance" placeholder="0.00" />
            </div>
            <small class="field-hint">Optional recurring employee allowance.</small>
          </div>
          <div class="empty-column" />
        </div>

        <!-- BANK INFORMATION -->
        <div class="section-divider" />
        <div class="section-title">
          <div class="section-title-icon green"><Landmark :size="17" /></div>
          <div>
            <strong>Bank / Payment Information</strong>
            <span>Enter the employee's payroll disbursement account if applicable.</span>
          </div>
        </div>

        <div class="form-grid two-column">
          <div class="form-field">
            <label class="field-label">Bank Name</label>
            <AppSelect v-model="form.bankName" :options="banks" placeholder="Select bank" />
          </div>

          <div class="form-field">
            <label class="field-label">Account Name</label>
            <AppInput v-model="form.accountName" placeholder="Enter account holder name" />
          </div>
        </div>

        <div class="form-grid two-column form-row">
          <div class="form-field">
            <label class="field-label">Account Number</label>
            <AppInput v-model="form.accountNumber" placeholder="Enter account number" />
            <small class="field-hint">Stored as employee payroll disbursement information.</small>
          </div>
          <div class="empty-column" />
        </div>

        <!-- INFO -->
        <div class="payroll-info">
          <div class="info-icon"><Info :size="18" /></div>
          <div>
            <strong>Payroll Calculation</strong>
            <p>
              Salary Setup is optional while registering an employee. Leave it blank if compensation is not finalized.
              Actual payroll computation will later include attendance, overtime,
              rest days, holidays, leave, loans, deductions, adjustments and government contributions.
            </p>
          </div>
        </div>
      </div>
    </div>
  </FormSection>
</template>

<style scoped>
.payroll-layout{display:grid;grid-template-columns:230px minmax(0,1fr);gap:24px}
.summary-column{padding-right:22px;border-right:1px solid var(--border-soft)}
.summary-heading{display:flex;flex-direction:column;align-items:center;padding-bottom:18px;text-align:center}
.summary-main-icon{display:flex;width:72px;height:72px;align-items:center;justify-content:center;margin-bottom:10px;border-radius:50%;background:var(--primary-soft);color:var(--primary)}
.summary-heading strong{color:var(--text-primary);font-size:12px;font-weight:700}
.summary-heading span{margin-top:3px;color:var(--text-muted);font-size:9px}
.payroll-summary{overflow:hidden;border:1px solid var(--border);border-radius:10px;background:var(--bg-card-soft)}
.summary-item{display:flex;align-items:center;gap:9px;padding:11px;border-bottom:1px solid var(--border-soft)}
.summary-item:last-child{border-bottom:0}
.summary-icon{display:flex;width:30px;height:30px;flex-shrink:0;align-items:center;justify-content:center;border-radius:8px;background:var(--primary-soft);color:var(--primary)}
.summary-item span,.summary-item strong{display:block}
.summary-item span{color:var(--text-muted);font-size:8px}
.summary-item strong{margin-top:2px;color:var(--text-primary);font-size:9px;font-weight:600}
.summary-note{margin-top:13px;padding:10px;border-radius:8px;background:var(--primary-soft);color:var(--text-secondary);font-size:8px;line-height:1.55}
.payroll-form{min-width:0}
.section-title{display:flex;align-items:center;gap:9px;margin-bottom:15px}
.section-title-icon{display:flex;width:32px;height:32px;flex-shrink:0;align-items:center;justify-content:center;border-radius:8px;background:var(--primary-soft);color:var(--primary)}
.section-title-icon.green{background:var(--green-soft);color:var(--green)}
.section-title strong,.section-title span{display:block}
.section-title strong{color:var(--text-primary);font-size:11px;font-weight:650}
.section-title span{margin-top:2px;color:var(--text-muted);font-size:8px}
.form-grid{display:grid;gap:14px}
.two-column{grid-template-columns:repeat(2,minmax(0,1fr))}
.form-row{margin-top:16px}
.form-field{min-width:0}
.field-label{display:block;margin-bottom:7px;color:var(--text-secondary);font-size:10px;font-weight:600}
.field-label span{color:var(--red)}
.field-hint{display:block;margin-top:5px;color:var(--text-muted);font-size:8px}
.error-hint{color:var(--red)}
.error-hint button{margin-left:5px;padding:0;border:0;background:transparent;color:var(--primary);font-size:inherit;font-weight:700;cursor:pointer}
.rate-container{max-width:calc(50% - 7px);margin-top:16px}
.money-field{position:relative}
.currency{position:absolute;top:50%;left:13px;z-index:2;transform:translateY(-50%);color:var(--text-muted);font-size:11px;font-weight:600;pointer-events:none}
.money-field :deep(input){padding-left:30px}
.section-divider{height:1px;margin:24px 0 18px;background:var(--border-soft)}
.payroll-info{display:flex;align-items:flex-start;gap:10px;margin-top:24px;padding:13px;border:1px solid color-mix(in srgb,var(--primary) 18%,var(--border));border-radius:9px;background:color-mix(in srgb,var(--primary-soft) 55%,var(--bg-card))}
.info-icon{display:flex;width:34px;height:34px;flex-shrink:0;align-items:center;justify-content:center;border-radius:8px;background:var(--primary-soft);color:var(--primary)}
.payroll-info strong{display:block;color:var(--text-primary);font-size:10px}
.payroll-info p{margin:4px 0 0;color:var(--text-secondary);font-size:8px;line-height:1.55}
@media(max-width:900px){.payroll-layout{grid-template-columns:1fr}.summary-column{max-width:450px;width:100%;margin:0 auto;padding-right:0;padding-bottom:20px;border-right:0;border-bottom:1px solid var(--border-soft)}}
@media(max-width:650px){.two-column{grid-template-columns:1fr}.rate-container{max-width:none}.empty-column{display:none}}
</style>
