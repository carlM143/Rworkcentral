<script setup lang="ts">
import {
  Files,
  FileText,
  CheckCircle2,
  Circle,
  ShieldCheck,
  Info,
  Landmark,
  GraduationCap,
  IdCard,
  HeartPulse,
  BriefcaseBusiness,
} from 'lucide-vue-next'

const {
  form,
  addDocument,
  removeDocument,
} = useEmployeeForm()

interface DocumentRequirement {
  id: string
  label: string
  category: string
  description: string
}

const requirements: DocumentRequirement[] = [
  {
    id: 'tin',
    label: 'Tax Identification Number (TIN)',
    category: 'Government',
    description: 'TIN verification or an applicable BIR document.',
  },
  {
    id: 'sss',
    label: 'SSS Number',
    category: 'Government',
    description: 'SSS number verification or supporting document.',
  },
  {
    id: 'philhealth',
    label: 'PhilHealth Number',
    category: 'Government',
    description: 'PhilHealth membership or number verification.',
  },
  {
    id: 'pagibig',
    label: 'Pag-IBIG (HDMF) Number',
    category: 'Government',
    description: 'Pag-IBIG or HDMF membership number verification.',
  },
  {
    id: 'nbi-clearance',
    label: 'NBI Clearance',
    category: 'Clearance',
    description: 'Valid NBI clearance submitted by the employee.',
  },
  {
    id: 'police-clearance',
    label: 'Police Clearance',
    category: 'Clearance',
    description: 'Valid police clearance submitted by the employee.',
  },
  {
    id: 'psa-birth-certificate',
    label: 'PSA Birth Certificate',
    category: 'Personal',
    description: 'Official birth certificate issued by the Philippine Statistics Authority.',
  },
  {
    id: 'valid-government-id',
    label: 'Valid Government ID',
    category: 'Identification',
    description: 'A current government-issued photo identification document.',
  },
  {
    id: 'transcript-of-records',
    label: 'Transcript of Records',
    category: 'Education',
    description: 'Official academic transcript from the employee’s school or university.',
  },
  {
    id: 'diploma',
    label: 'Diploma',
    category: 'Education',
    description: 'Diploma supporting the employee’s declared educational attainment.',
  },
  {
    id: 'certificate-of-employment',
    label: 'Certificate of Employment (COE)',
    category: 'Employment',
    description: 'Certificate from previous employers, when applicable, proving the employee’s work history.',
  },
  {
    id: 'previous-employer-clearance',
    label: 'Clearance from Previous Employer',
    category: 'Employment',
    description: 'Confirms that the employee has no outstanding liabilities with a previous employer.',
  },
  {
    id: 'pre-employment-medical-examination',
    label: 'Pre-Employment Medical Examination (PEME)',
    category: 'Medical',
    description: 'Medical examination from a company-accredited clinic, typically including a chest X-ray, urine test, and physical exam.',
  },
]

const isSubmitted = (
  requirement: DocumentRequirement,
) => {
  return form.value.documents.some(
    document =>
      document.id === requirement.id,
  )
}

const toggleRequirement = (
  requirement: DocumentRequirement,
  checked: boolean,
) => {
  if (checked) {
    if (isSubmitted(requirement)) {
      return
    }

    addDocument({
      id: requirement.id,
      type: requirement.label,
      name: 'Submitted requirement',
      file: null,
    })

    return
  }

  removeDocument(
    requirement.id,
  )
}

const submittedCount =
  computed(
    () =>
      form.value.documents.length,
  )

const pendingCount =
  computed(
    () =>
      Math.max(
        requirements.length -
        submittedCount.value,
        0,
      ),
  )

const completionPercentage =
  computed(() => {
    if (!requirements.length) {
      return 0
    }

    return Math.round(
      (
        submittedCount.value /
        requirements.length
      ) * 100,
    )
  })

const requirementIcon = (
  category: string,
) => {
  if (category === 'Government') {
    return Landmark
  }

  if (category === 'Education') {
    return GraduationCap
  }

  if (category === 'Identification') {
    return IdCard
  }

  if (category === 'Medical') {
    return HeartPulse
  }

  if (category === 'Employment') {
    return BriefcaseBusiness
  }

  return FileText
}
</script>

<template>
  <FormSection
    title="Employment Documents"
    description="Mark the employment and compliance requirements already submitted by the employee."
    :icon="Files"
  >
    <div class="documents-layout">

      <!-- LEFT SUMMARY -->

      <aside class="summary-column">

        <div class="summary-heading">

          <div class="summary-main-icon">
            <Files :size="29" />
          </div>

          <strong>
            Document Requirements
          </strong>

          <span>
            Submission checklist
          </span>

        </div>

        <div class="progress-card">

          <div class="progress-heading">

            <div>
              <span>
                Requirements Submitted
              </span>

              <strong>
                {{ submittedCount }}
                /
                {{ requirements.length }}
              </strong>
            </div>

            <div class="percentage">
              {{ completionPercentage }}%
            </div>

          </div>

          <div class="progress-track">
            <div
              class="progress-value"
              :style="{
                width:
                  `${completionPercentage}%`,
              }"
            />
          </div>

        </div>

        <div class="summary-stats">

          <div class="summary-stat submitted">

            <div class="stat-icon">
              <CheckCircle2 :size="16" />
            </div>

            <div>
              <span>Submitted</span>

              <strong>
                {{ submittedCount }}
              </strong>
            </div>

          </div>

          <div class="summary-stat pending">

            <div class="stat-icon">
              <Circle :size="16" />
            </div>

            <div>
              <span>Pending</span>

              <strong>
                {{ pendingCount }}
              </strong>
            </div>

          </div>

        </div>

        <div class="requirements-summary">

          <div>
            <ShieldCheck :size="14" />
            Government Records
          </div>

          <div>
            <IdCard :size="14" />
            Identification
          </div>

          <div>
            <GraduationCap :size="14" />
            Educational Records
          </div>

          <div>
            <BriefcaseBusiness :size="14" />
            Employment Records
          </div>

        </div>

        <div class="summary-note">
          Unchecked requirements will remain marked as pending and may be submitted later through the employee document management module.
        </div>

      </aside>

      <!-- RIGHT CONTENT -->

      <div class="documents-content">

        <div class="section-title">

          <div class="section-title-icon">
            <CheckCircle2 :size="17" />
          </div>

          <div>
            <strong>
              Submitted Requirements
            </strong>

            <span>
              Check every document already submitted by the employee.
            </span>
          </div>

        </div>

        <!-- CHECKLIST -->

        <div class="requirements-grid">

          <label
            v-for="requirement in requirements"
            :key="requirement.id"
            class="requirement-card"
            :class="{
              selected:
                isSubmitted(
                  requirement,
                ),
            }"
          >

            <div class="checkbox-wrap">

              <input
                type="checkbox"
                :checked="
                  isSubmitted(
                    requirement,
                  )
                "
                @change="
                  toggleRequirement(
                    requirement,
                    ($event.target as HTMLInputElement).checked,
                  )
                "
              >

            </div>

            <div
              class="requirement-icon"
              :class="{
                selected:
                  isSubmitted(
                    requirement,
                  ),
              }"
            >
              <component
                :is="
                  requirementIcon(
                    requirement.category,
                  )
                "
                :size="17"
              />
            </div>

            <div class="requirement-info">

              <div class="requirement-top">

                <strong>
                  {{ requirement.label }}
                </strong>

                <span
                  class="status-badge"
                  :class="{
                    submitted:
                      isSubmitted(
                        requirement,
                      ),
                  }"
                >
                  {{
                    isSubmitted(
                      requirement,
                    )
                      ? 'Submitted'
                      : 'Pending'
                  }}
                </span>

              </div>

              <span class="category">
                {{ requirement.category }}
              </span>

              <p>
                {{ requirement.description }}
              </p>

            </div>

          </label>

        </div>

        <!-- INFO -->

        <div class="information-card">

          <div class="information-icon">
            <Info :size="18" />
          </div>

          <div>
            <strong>
              Document Requirement Tracking
            </strong>

            <p>
              Checked items mean the employee already submitted the requirement. Unchecked items remain pending and can be completed later during onboarding or document management.
            </p>
          </div>

        </div>

      </div>

    </div>
  </FormSection>
</template>

<style scoped>
.documents-layout {
  display: grid;
  grid-template-columns:
    230px minmax(0, 1fr);

  gap: 24px;
}

/* LEFT */

.summary-column {
  padding-right: 22px;

  border-right:
    1px solid var(--border-soft);
}

.summary-heading {
  display: flex;

  flex-direction: column;
  align-items: center;

  padding:
    18px 10px;

  text-align: center;
}

.summary-main-icon {
  display: flex;

  width: 62px;
  height: 62px;

  align-items: center;
  justify-content: center;

  margin-bottom: 10px;

  border-radius: 50%;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.summary-heading strong {
  color:
    var(--text-primary);

  font-size: 11px;
}

.summary-heading span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
}

/* PROGRESS */

.progress-card {
  margin-bottom: 10px;

  padding: 12px;

  border:
    1px solid var(--border);

  border-radius: 9px;

  background:
    var(--bg-card-soft);
}

.progress-heading {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 10px;
}

.progress-heading span {
  display: block;

  color:
    var(--text-muted);

  font-size: 7px;
}

.progress-heading strong {
  display: block;

  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 12px;
}

.percentage {
  color:
    var(--primary);

  font-size: 10px;
  font-weight: 700;
}

.progress-track {
  width: 100%;
  height: 5px;

  margin-top: 10px;

  overflow: hidden;

  border-radius: 20px;

  background:
    var(--border-soft);
}

.progress-value {
  height: 100%;

  border-radius: inherit;

  background:
    var(--primary);

  transition:
    width 0.2s ease;
}

/* SUMMARY STATS */

.summary-stats {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 7px;

  margin-bottom: 10px;
}

.summary-stat {
  display: flex;

  align-items: center;

  gap: 8px;

  padding: 9px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background:
    var(--bg-card);
}

.stat-icon {
  display: flex;

  width: 29px;
  height: 29px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 7px;
}

.summary-stat.submitted
.stat-icon {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.summary-stat.pending
.stat-icon {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.summary-stat span {
  display: block;

  color:
    var(--text-muted);

  font-size: 6.5px;
}

.summary-stat strong {
  display: block;

  margin-top: 2px;

  color:
    var(--text-primary);

  font-size: 10px;
}

/* SUMMARY LIST */

.requirements-summary {
  display: flex;

  flex-direction: column;

  gap: 6px;

  margin-bottom: 10px;
}

.requirements-summary div {
  display: flex;

  align-items: center;

  gap: 7px;

  padding:
    7px 8px;

  border:
    1px solid var(--border-soft);

  border-radius: 7px;

  color:
    var(--text-secondary);

  font-size: 7.5px;
}

.summary-note {
  padding: 9px;

  border-radius: 7px;

  background:
    var(--primary-soft);

  color:
    var(--text-secondary);

  font-size: 7px;

  line-height: 1.5;
}

/* RIGHT */

.documents-content {
  min-width: 0;
}

.section-title {
  display: flex;

  align-items: center;

  gap: 9px;

  margin-bottom: 12px;
}

.section-title-icon {
  display: flex;

  width: 34px;
  height: 34px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.section-title strong,
.section-title span {
  display: block;
}

.section-title strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.section-title span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7.5px;
}

/* CHECKLIST */

.requirements-grid {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 8px;
}

.requirement-card {
  position: relative;

  display: grid;

  grid-template-columns:
    auto auto minmax(0, 1fr);

  align-items: flex-start;

  gap: 9px;

  min-height: 100px;

  padding: 11px;

  border:
    1px solid var(--border);

  border-radius: 9px;

  background:
    var(--bg-card-soft);

  cursor: pointer;

  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
}

.requirement-card:hover {
  border-color:
    var(--primary);

  transform:
    translateY(-1px);
}

.requirement-card.selected {
  border-color:
    var(--primary);

  background:
    var(--primary-soft);
}

.checkbox-wrap {
  padding-top: 2px;
}

.checkbox-wrap input {
  width: 15px;
  height: 15px;

  margin: 0;

  accent-color:
    var(--primary);

  cursor: pointer;
}

.requirement-icon {
  display: flex;

  width: 32px;
  height: 32px;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--bg-card);

  color:
    var(--text-muted);
}

.requirement-icon.selected {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.requirement-info {
  min-width: 0;
}

.requirement-top {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 7px;
}

.requirement-top strong {
  color:
    var(--text-primary);

  font-size: 8.5px;
}

.status-badge {
  flex-shrink: 0;

  padding:
    3px 6px;

  border-radius: 20px;

  background:
    var(--orange-soft);

  color:
    var(--orange);

  font-size: 6.5px;
  font-weight: 700;
}

.status-badge.submitted {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.category {
  display: block;

  margin-top: 3px;

  color:
    var(--primary);

  font-size: 6.5px;
  font-weight: 600;
}

.requirement-info p {
  margin:
    5px 0 0;

  color:
    var(--text-muted);

  font-size: 7px;

  line-height: 1.45;
}

/* INFO */

.information-card {
  display: flex;

  align-items: flex-start;

  gap: 9px;

  margin-top: 15px;

  padding: 10px;

  border-radius: 8px;

  background:
    var(--primary-soft);
}

.information-icon {
  display: flex;

  width: 31px;
  height: 31px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 7px;

  background:
    var(--bg-card);

  color:
    var(--primary);
}

.information-card strong {
  display: block;

  color:
    var(--text-primary);

  font-size: 9px;
}

.information-card p {
  margin:
    3px 0 0;

  color:
    var(--text-secondary);

  font-size: 7.5px;

  line-height: 1.5;
}

/* RESPONSIVE */

@media (max-width: 900px) {
  .documents-layout {
    grid-template-columns:
      1fr;
  }

  .summary-column {
    max-width: 450px;

    width: 100%;

    margin:
      0 auto;

    padding-right: 0;
    padding-bottom: 20px;

    border-right: 0;

    border-bottom:
      1px solid var(--border-soft);
  }
}

@media (max-width: 650px) {
  .requirements-grid {
    grid-template-columns:
      1fr;
  }
}
</style>
