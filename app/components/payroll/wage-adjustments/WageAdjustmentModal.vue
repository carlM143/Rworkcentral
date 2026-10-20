<script setup lang="ts">
import {
  X,
  CircleDollarSign,
  UserRound,
  CalendarDays,
  Scale,
  Save,
} from 'lucide-vue-next'

import type {
  WageAdjustmentRecord,
  WageAdjustmentStatus,
} from '~/types/wageManagement'

const props =
  defineProps<{
    open: boolean

    record:
      WageAdjustmentRecord |
      null

    mode:
      | 'view'
      | 'review'
  }>()

const emit =
  defineEmits<{
    close: []

    save: [
      payload: {
        id: number
        proposedRate: number
        effectiveDate: string
        status:
          WageAdjustmentStatus
        remarks: string
      },
    ]
  }>()

const proposedRate =
  ref(0)

const effectiveDate =
  ref('')

const status =
  ref<WageAdjustmentStatus>(
    'For Review',
  )

const remarks =
  ref('')

const statusOptions:
  WageAdjustmentStatus[] = [
    'For Review',
    'Pending Approval',
    'Approved',
    'Scheduled',
    'Effective',
  ]

const money = (
  value: number,
) => {
  return new Intl.NumberFormat(
    'en-PH',
    {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    },
  ).format(value)
}

const syncForm = () => {
  if (!props.record) {
    return
  }

  proposedRate.value =
    props.record.proposedRate

  effectiveDate.value =
    props.record.effectiveDate

  status.value =
    props.record.status

  remarks.value =
    ''
}

watch(
  () => props.open,
  value => {
    if (value) {
      syncForm()
    }
  },
)

watch(
  () => props.record?.id,
  () => {
    if (props.open) {
      syncForm()
    }
  },
)

const handleSave = () => {
  if (!props.record) {
    return
  }

  emit(
    'save',
    {
      id:
        props.record.id,

      proposedRate:
        Number(
          proposedRate.value,
        ),

      effectiveDate:
        effectiveDate.value,

      status:
        status.value,

      remarks:
        remarks.value,
    },
  )
}
</script>

<template>
  <Teleport to="body">

    <div
      v-if="
        open &&
        record
      "
      class="overlay"
      @click.self="
        emit('close')
      "
    >

      <article class="modal">

        <!-- HEADER -->

        <header class="header">

          <div class="header-main">

            <div class="header-icon">
              <CircleDollarSign
                :size="18"
              />
            </div>

            <div>
              <h2>
                {{
                  mode === 'review'
                    ? 'Review Wage Adjustment'
                    : 'Wage Adjustment Details'
                }}
              </h2>

              <p>
                {{ record.employeeName }}
                ·
                {{ record.employeeNumber }}
              </p>
            </div>

          </div>

          <button
            type="button"
            class="close"
            @click="
              emit('close')
            "
          >
            <X :size="18" />
          </button>

        </header>

        <!-- BODY -->

        <div class="body">

          <section class="employee-card">

            <div class="employee-icon">
              <UserRound
                :size="18"
              />
            </div>

            <div>
              <strong>
                {{ record.employeeName }}
              </strong>

              <span>
                {{ record.employeeNumber }}
                ·
                {{ record.position }}
                ·
                {{ record.department }}
              </span>
            </div>

          </section>

          <div class="rate-grid">

            <div class="rate-box">
              <span>
                Current Rate
              </span>

              <strong>
                {{
                  money(
                    record.currentRate,
                  )
                }}
              </strong>
            </div>

            <div class="rate-box">
              <span>
                Required Minimum
              </span>

              <strong>
                {{
                  money(
                    record.newMinimumRate,
                  )
                }}
              </strong>
            </div>

            <div class="rate-box increase">
              <span>
                Required Increase
              </span>

              <strong>
                +{{
                  money(
                    record.requiredIncrease,
                  )
                }}
              </strong>
            </div>

            <div class="rate-box proposed">
              <span>
                Proposed Rate
              </span>

              <strong>
                {{
                  money(
                    record.proposedRate,
                  )
                }}
              </strong>
            </div>

          </div>

          <section class="info-grid">

            <div>
              <span>Region</span>
              <strong>
                {{ record.region }}
              </strong>
            </div>

            <div>
              <span>Wage Order</span>
              <strong>
                {{ record.wageOrderCode }}
              </strong>
            </div>

            <div>
              <span>Result</span>
              <strong>
                {{ record.result }}
              </strong>
            </div>

            <div>
              <span>Distortion</span>
              <strong>
                {{
                  record.distortionRisk
                    ? 'Review Required'
                    : 'No Risk'
                }}
              </strong>
            </div>

          </section>

          <!-- REVIEW FORM -->

          <template
            v-if="
              mode === 'review'
            "
          >

            <div class="divider" />

            <section class="review-section">

              <div class="section-title">

                <Scale :size="15" />

                Adjustment Review
              </div>

              <div class="form-grid">

                <div class="field">

                  <label>
                    Proposed Rate
                  </label>

                  <div class="money-input">
                    <span>₱</span>

                    <input
                      v-model.number="
                        proposedRate
                      "
                      type="number"
                      min="0"
                      step="0.01"
                    >
                  </div>

                </div>

                <div class="field">

                  <label>
                    Effective Date
                  </label>

                  <input
                    v-model="
                      effectiveDate
                    "
                    type="date"
                  >

                </div>

                <div class="field full">

                  <label>
                    Review Status
                  </label>

                  <select
                    v-model="status"
                  >
                    <option
                      v-for="
                        item in
                        statusOptions
                      "
                      :key="item"
                      :value="item"
                    >
                      {{ item }}
                    </option>
                  </select>

                </div>

                <div class="field full">

                  <label>
                    Review Remarks
                  </label>

                  <textarea
                    v-model="
                      remarks
                    "
                    rows="3"
                    placeholder="Enter HR review remarks..."
                  />

                </div>

              </div>

            </section>

          </template>

          <div class="reference">

            <CalendarDays
              :size="14"
            />

            Effective date:
            <strong>
              {{ record.effectiveDate }}
            </strong>

          </div>

        </div>

        <!-- FOOTER -->

        <footer class="footer">

          <AppButton
            variant="secondary"
            @click="
              emit('close')
            "
          >
            Close
          </AppButton>

          <AppButton
            v-if="
              mode === 'review'
            "
            :icon="Save"
            @click="
              handleSave
            "
          >
            Save Review
          </AppButton>

        </footer>

      </article>

    </div>

  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;

  z-index: 99990;

  inset: 0;

  display: flex;

  align-items: center;
  justify-content: center;

  padding: 20px;

  background:
    rgba(3, 10, 24, 0.76);

  backdrop-filter:
    blur(4px);
}

.modal {
  width: 100%;
  max-width: 720px;

  max-height:
    calc(100vh - 40px);

  overflow-y: auto;

  border:
    1px solid var(--border);

  border-radius: 14px;

  background:
    var(--bg-card);

  box-shadow:
    0 25px 70px
    rgba(0, 0, 0, 0.3);
}

.header {
  position: sticky;

  z-index: 5;

  top: 0;

  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 15px;

  padding: 15px 18px;

  border-bottom:
    1px solid var(--border);

  background:
    var(--bg-card);
}

.header-main {
  display: flex;

  align-items: center;

  gap: 10px;
}

.header-icon {
  display: flex;

  width: 39px;
  height: 39px;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.header h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;
}

.header p {
  margin: 3px 0 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

.close {
  display: flex;

  width: 31px;
  height: 31px;

  align-items: center;
  justify-content: center;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);

  cursor: pointer;
}

.body {
  padding: 17px 18px;
}

.employee-card {
  display: flex;

  align-items: center;

  gap: 10px;

  padding: 11px;

  border:
    1px solid var(--border-soft);

  border-radius: 9px;

  background:
    var(--bg-card-soft);
}

.employee-icon {
  display: flex;

  width: 36px;
  height: 36px;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.employee-card strong,
.employee-card span {
  display: block;
}

.employee-card strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.employee-card span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7.5px;
}

.rate-grid {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 7px;

  margin-top: 12px;
}

.rate-box {
  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.rate-box span,
.rate-box strong {
  display: block;
}

.rate-box span {
  color:
    var(--text-muted);

  font-size: 7px;
}

.rate-box strong {
  margin-top: 4px;

  color:
    var(--text-primary);

  font-size: 10px;
}

.rate-box.increase strong {
  color:
    var(--orange);
}

.rate-box.proposed {
  background:
    var(--green-soft);
}

.rate-box.proposed strong {
  color:
    var(--green);
}

.info-grid {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 7px;

  margin-top: 10px;
}

.info-grid div {
  padding: 9px;

  border:
    1px solid var(--border-soft);

  border-radius: 7px;
}

.info-grid span,
.info-grid strong {
  display: block;
}

.info-grid span {
  color:
    var(--text-muted);

  font-size: 7px;
}

.info-grid strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 8.5px;
}

.divider {
  height: 1px;

  margin: 16px 0;

  background:
    var(--border-soft);
}

.section-title {
  display: flex;

  align-items: center;

  gap: 6px;

  margin-bottom: 10px;

  color:
    var(--text-primary);

  font-size: 10px;
  font-weight: 700;
}

.form-grid {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 10px;
}

.field {
  display: flex;

  flex-direction: column;

  gap: 5px;
}

.field.full {
  grid-column: 1 / -1;
}

.field label {
  color:
    var(--text-secondary);

  font-size: 8px;
  font-weight: 600;
}

.field input,
.field select,
.field textarea {
  width: 100%;

  box-sizing: border-box;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);

  font-family: inherit;
  font-size: 9px;

  outline: none;
}

.field input,
.field select {
  height: 38px;

  padding: 0 10px;
}

.field textarea {
  padding: 9px;

  resize: vertical;
}

.money-input {
  position: relative;
}

.money-input span {
  position: absolute;

  top: 50%;
  left: 10px;

  transform:
    translateY(-50%);

  color:
    var(--text-muted);

  font-size: 9px;
}

.money-input input {
  padding-left: 24px;
}

.reference {
  display: flex;

  align-items: center;

  gap: 5px;

  margin-top: 14px;

  padding: 9px;

  border-radius: 7px;

  background:
    var(--primary-soft);

  color:
    var(--text-secondary);

  font-size: 8px;
}

.reference strong {
  color:
    var(--text-primary);
}

.footer {
  position: sticky;

  bottom: 0;

  display: flex;

  justify-content: flex-end;

  gap: 7px;

  padding: 13px 18px;

  border-top:
    1px solid var(--border);

  background:
    var(--bg-card);
}

@media (max-width: 650px) {
  .rate-grid,
  .info-grid,
  .form-grid {
    grid-template-columns:
      1fr;
  }

  .field.full {
    grid-column: auto;
  }
}
</style>