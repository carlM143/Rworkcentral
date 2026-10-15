<script setup lang="ts">
import {
  Files,
  FileText,
  UploadCloud,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Info,
} from 'lucide-vue-next'

const {
  form,
  addDocument,
  removeDocument,
} = useEmployeeForm()

const documentTypes = [
  'Employment Contract',
  'Valid ID',
  'Birth Certificate',
  'SSS Document',
  'PhilHealth Document',
  'Pag-IBIG Document',
  'TIN Document',
  'Driver\'s License',
  'Training Certificate',
  'Medical Certificate',
  'Diploma / Transcript',
  'Other',
]

const selectedType = ref('')
const selectedFile = ref<File | null>(null)

const {
  success,
  warning,
} = useToast()

const handleAddDocument = () => {
  if (!selectedType.value) {
    warning(
      'Document Type Required',
      'Please select a document type.',
    )

    return
  }

  if (!selectedFile.value) {
    warning(
      'File Required',
      'Please select a file to upload.',
    )

    return
  }

  addDocument({
    id:
      Date.now().toString() +
      Math.random().toString(36).slice(2),

    type: selectedType.value,

    name: selectedFile.value.name,

    file: selectedFile.value,
  })

  success(
    'Document Added',
    `${selectedType.value} has been added to the employee record.`,
  )

  selectedType.value = ''
  selectedFile.value = null
}

const handleRemoveDocument = (
  id: string,
) => {
  removeDocument(id)

  success(
    'Document Removed',
    'The document has been removed from the employee record.',
  )
}

const formatFileSize = (
  size?: number,
) => {
  if (!size) {
    return ''
  }

  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(
      size / 1024
    ).toFixed(1)} KB`
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(1)} MB`
}

const uploadedCount = computed(
  () => form.value.documents.length,
)
</script>

<template>
  <FormSection
    title="Employee Documents"
    description="Upload and organize the employee's required employment and compliance documents."
    :icon="Files"
  >
    <div class="documents-layout">

      <!-- ====================================
           LEFT SUMMARY
      ===================================== -->
      <aside class="summary-column">

        <div class="summary-heading">
          <div class="summary-main-icon">
            <Files :size="29" />
          </div>

          <strong>
            Employee Files
          </strong>

          <span>
            Document requirements
          </span>
        </div>

        <div class="document-status-card">
          <div class="status-icon">
            <CheckCircle2 :size="19" />
          </div>

          <div>
            <span>
              Uploaded Documents
            </span>

            <strong>
              {{ uploadedCount }}
            </strong>
          </div>
        </div>

        <div class="requirements-list">
          <div class="requirement-item">
            <FileText :size="14" />

            <span>
              Employment Contract
            </span>
          </div>

          <div class="requirement-item">
            <ShieldCheck :size="14" />

            <span>
              Government Records
            </span>
          </div>

          <div class="requirement-item">
            <FileText :size="14" />

            <span>
              Valid Identification
            </span>
          </div>

          <div class="requirement-item">
            <FileText :size="14" />

            <span>
              Certificates
            </span>
          </div>
        </div>

        <div class="summary-note">
          Employee documents will become part
          of the employee's centralized HR file
          after the employee record is saved.
        </div>

      </aside>

      <!-- ====================================
           RIGHT CONTENT
      ===================================== -->
      <div class="documents-content">

        <!-- UPLOAD HEADER -->
        <div class="section-title">
          <div class="section-title-icon">
            <UploadCloud :size="17" />
          </div>

          <div>
            <strong>
              Upload Document
            </strong>

            <span>
              Select the document category and
              attach the corresponding employee file.
            </span>
          </div>
        </div>

        <!-- DOCUMENT TYPE -->
        <div class="upload-form">
          <div class="form-field">
            <label class="field-label">
              Document Type
              <span>*</span>
            </label>

            <AppSelect
              v-model="selectedType"
              :options="documentTypes"
              placeholder="Select document type"
            />
          </div>

          <div class="form-field">
            <AppFileUpload
              v-model="selectedFile"
              label="Document File"
              description="Upload PDF, JPG or PNG document."
              accept=".pdf,.jpg,.jpeg,.png"
              :max-size-mb="5"
            />
          </div>

          <div class="upload-action">
            <AppButton
              :icon="UploadCloud"
              @click="handleAddDocument"
            >
              Add Document
            </AppButton>
          </div>
        </div>

        <div class="section-divider" />

        <!-- ====================================
             UPLOADED DOCUMENTS
        ===================================== -->
        <div class="section-title">
          <div class="section-title-icon green">
            <Files :size="17" />
          </div>

          <div>
            <strong>
              Uploaded Documents
            </strong>

            <span>
              Review the employee documents
              included in this record.
            </span>
          </div>
        </div>

        <!-- EMPTY STATE -->
        <div
          v-if="!form.documents.length"
          class="empty-documents"
        >
          <div class="empty-icon">
            <Files :size="25" />
          </div>

          <strong>
            No documents uploaded yet
          </strong>

          <p>
            Select a document type and upload
            a file above.
          </p>
        </div>

        <!-- DOCUMENT LIST -->
        <div
          v-else
          class="documents-list"
        >
          <div
            v-for="document in form.documents"
            :key="document.id"
            class="document-item"
          >
            <div class="document-icon">
              <FileText :size="18" />
            </div>

            <div class="document-info">
              <strong>
                {{ document.type }}
              </strong>

              <span>
                {{ document.name }}
              </span>

              <small v-if="document.file">
                {{
                  formatFileSize(
                    document.file.size,
                  )
                }}
              </small>
            </div>

            <div class="document-status">
              <CheckCircle2 :size="14" />

              Ready
            </div>

            <button
              type="button"
              class="delete-button"
              title="Remove document"
              @click="
                handleRemoveDocument(
                  document.id,
                )
              "
            >
              <Trash2 :size="15" />
            </button>
          </div>
        </div>

        <!-- INFO -->
        <div class="information-card">
          <div class="information-icon">
            <Info :size="18" />
          </div>

          <div>
            <strong>
              Document Management
            </strong>

            <p>
              Later, this module can support
              document categories, expiration
              dates, renewal reminders and
              restricted document access.
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

  padding-bottom: 18px;

  text-align: center;
}

.summary-main-icon {
  display: flex;

  width: 72px;
  height: 72px;

  align-items: center;
  justify-content: center;

  margin-bottom: 10px;

  border-radius: 50%;

  background: var(--primary-soft);
  color: var(--primary);
}

.summary-heading strong {
  color: var(--text-primary);

  font-size: 12px;
  font-weight: 700;
}

.summary-heading span {
  margin-top: 3px;

  color: var(--text-muted);

  font-size: 9px;
}

.document-status-card {
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 12px;

  border: 1px solid var(--border);
  border-radius: 9px;

  background: var(--bg-card-soft);
}

.status-icon {
  display: flex;

  width: 34px;
  height: 34px;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: var(--green-soft);
  color: var(--green);
}

.document-status-card span,
.document-status-card strong {
  display: block;
}

.document-status-card span {
  color: var(--text-muted);

  font-size: 8px;
}

.document-status-card strong {
  margin-top: 2px;

  color: var(--text-primary);

  font-size: 15px;
}

.requirements-list {
  margin-top: 12px;

  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 9px;

  background: var(--bg-card-soft);
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 8px;

  padding: 10px;

  border-bottom:
    1px solid var(--border-soft);

  color: var(--text-secondary);

  font-size: 8px;
}

.requirement-item:last-child {
  border-bottom: 0;
}

.requirement-item svg {
  color: var(--primary);
}

.summary-note {
  margin-top: 13px;

  padding: 10px;

  border-radius: 8px;

  background: var(--primary-soft);
  color: var(--text-secondary);

  font-size: 8px;
  line-height: 1.55;
}

/* RIGHT */

.documents-content {
  min-width: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 9px;

  margin-bottom: 15px;
}

.section-title-icon {
  display: flex;

  width: 32px;
  height: 32px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: var(--primary-soft);
  color: var(--primary);
}

.section-title-icon.green {
  background: var(--green-soft);
  color: var(--green);
}

.section-title strong,
.section-title span {
  display: block;
}

.section-title strong {
  color: var(--text-primary);

  font-size: 11px;
}

.section-title span {
  margin-top: 2px;

  color: var(--text-muted);

  font-size: 8px;
}

.upload-form {
  display: grid;

  grid-template-columns:
    minmax(180px, 0.7fr)
    minmax(280px, 1.3fr);

  gap: 15px;
}

.form-field {
  min-width: 0;
}

.field-label {
  display: block;

  margin-bottom: 7px;

  color: var(--text-secondary);

  font-size: 10px;
  font-weight: 600;
}

.field-label span {
  color: var(--red);
}

.upload-action {
  grid-column: 1 / -1;

  display: flex;
  justify-content: flex-end;
}

.section-divider {
  height: 1px;

  margin: 24px 0 18px;

  background: var(--border-soft);
}

/* EMPTY */

.empty-documents {
  display: flex;

  min-height: 170px;

  flex-direction: column;
  align-items: center;
  justify-content: center;

  border: 1px dashed var(--border);
  border-radius: 10px;

  background: var(--bg-card-soft);

  text-align: center;
}

.empty-icon {
  display: flex;

  width: 45px;
  height: 45px;

  align-items: center;
  justify-content: center;

  margin-bottom: 9px;

  border-radius: 10px;

  background: var(--primary-soft);
  color: var(--primary);
}

.empty-documents strong {
  color: var(--text-primary);

  font-size: 10px;
}

.empty-documents p {
  margin: 4px 0 0;

  color: var(--text-muted);

  font-size: 8px;
}

/* LIST */

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 10px 12px;

  border: 1px solid var(--border);
  border-radius: 9px;

  background: var(--bg-card-soft);
}

.document-icon {
  display: flex;

  width: 36px;
  height: 36px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: var(--primary-soft);
  color: var(--primary);
}

.document-info {
  min-width: 0;
  flex: 1;
}

.document-info strong,
.document-info span,
.document-info small {
  display: block;
}

.document-info strong {
  color: var(--text-primary);

  font-size: 9px;
}

.document-info span {
  overflow: hidden;

  margin-top: 2px;

  color: var(--text-secondary);

  font-size: 8px;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.document-info small {
  margin-top: 2px;

  color: var(--text-muted);

  font-size: 7px;
}

.document-status {
  display: flex;
  align-items: center;
  gap: 4px;

  padding: 5px 8px;

  border-radius: 20px;

  background: var(--green-soft);
  color: var(--green);

  font-size: 8px;
  font-weight: 600;
}

.delete-button {
  display: flex;

  width: 30px;
  height: 30px;

  align-items: center;
  justify-content: center;

  border: 0;
  border-radius: 7px;

  background: transparent;
  color: var(--text-muted);
}

.delete-button:hover {
  background: var(--red-soft);
  color: var(--red);
}

/* INFO */

.information-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;

  margin-top: 22px;
  padding: 13px;

  border: 1px solid
    color-mix(
      in srgb,
      var(--primary) 18%,
      var(--border)
    );

  border-radius: 9px;

  background:
    color-mix(
      in srgb,
      var(--primary-soft) 55%,
      var(--bg-card)
    );
}

.information-icon {
  display: flex;

  width: 34px;
  height: 34px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: var(--primary-soft);
  color: var(--primary);
}

.information-card strong {
  display: block;

  color: var(--text-primary);

  font-size: 10px;
}

.information-card p {
  margin: 4px 0 0;

  color: var(--text-secondary);

  font-size: 8px;
  line-height: 1.55;
}

@media (max-width: 900px) {
  .documents-layout {
    grid-template-columns: 1fr;
  }

  .summary-column {
    max-width: 450px;
    width: 100%;

    margin: 0 auto;
    padding-right: 0;
    padding-bottom: 20px;

    border-right: 0;
    border-bottom:
      1px solid var(--border-soft);
  }
}

@media (max-width: 650px) {
  .upload-form {
    grid-template-columns: 1fr;
  }
}
</style>