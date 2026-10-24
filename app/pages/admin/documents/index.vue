<script setup lang="ts">
import {
  Download,
  Upload,
  RotateCcw,
} from 'lucide-vue-next'

import type {
  DocumentRecord,
} from '~/types/document'

const {
  search,
  category,
  status,

  currentPage,

  filteredDocuments,
  paginatedDocuments,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  expiringDocuments,
  missingRequirements,

  recentActivity,

  categoryOptions,
  statusOptions,

  resetFilters,
} = useDocumentsOverview()

const {
  info,
} = useToast()

const handleUpload = () => {
  info(
    'Upload Document',
    'Document upload form will be implemented in the document management workflow.',
  )
}

const handleExport = () => {
  info(
    'Export Documents',
    'Document export will be connected later.',
  )
}

const handleView = (
  document: DocumentRecord,
) => {
  info(
    document.documentType,
    `${document.employeeName} — ${document.fileName}`,
  )
}

const handleDownload = (
  document: DocumentRecord,
) => {
  info(
    'Download Document',
    `${document.fileName} download will be connected later.`,
  )
}

const handleVerification = () => {
  info(
    'Pending Verification',
    'Pending document verification list will be implemented next.',
  )
}

const handleRequirements = () => {
  info(
    'Required Documents',
    'Required employee document configuration will be implemented later.',
  )
}
</script>

<template>
  <section class="documents-page">

    <!-- HEADER -->
    <PageHeader
      title="Documents"
      description="Manage employee documents, verification, expiration dates and document requirements."
    >

      <AppButton
        variant="secondary"
        :icon="Download"
        @click="handleExport"
      >
        Export
      </AppButton>

      <AppButton
        :icon="Upload"
        @click="handleUpload"
      >
        Upload Document
      </AppButton>

    </PageHeader>

    <!-- STATS -->
    <DocumentStats
      :stats="stats"
    />

    <!-- FILTERS -->
    <div class="document-filters">

      <AppInput
        v-model="search"
        searchable
        clearable
        placeholder="Search employee, document or file name..."
      />

      <AppSelect
        v-model="category"
        :options="categoryOptions"
        placeholder="All Categories"
      />

      <AppSelect
        v-model="status"
        :options="statusOptions"
        placeholder="All Status"
      />

      <AppButton
        variant="secondary"
        :icon="RotateCcw"
        @click="resetFilters"
      >
        Reset
      </AppButton>

    </div>

    <!-- MAIN -->
    <div class="documents-layout">

      <div class="documents-main">

        <DocumentRepositoryTable
          :documents="paginatedDocuments"
          @view="handleView"
          @download="handleDownload"
        />

        <div class="table-footer">

          <p>
            Showing

            <strong>
              {{ showingFrom }}–{{ showingTo }}
            </strong>

            of

            <strong>
              {{ filteredDocuments.length }}
            </strong>

            documents
          </p>

          <AppPagination
            v-model="currentPage"
            :total-pages="totalPages"
          />

        </div>

        <RecentDocumentActivity
          :activities="recentActivity"
        />

      </div>

      <DocumentSidePanel
        :expiring-documents="expiringDocuments"
        :missing-requirements="missingRequirements"
        @upload="handleUpload"
        @verification="handleVerification"
        @requirements="handleRequirements"
      />

    </div>

  </section>
</template>

<style scoped>
.documents-page {
  width: 100%;

  max-width: 1660px;

  margin: 0 auto;
}

/* FILTERS */

.document-filters {
  display: grid;

  grid-template-columns:
    minmax(300px, 1fr)
    200px
    190px
    auto;

  gap: 8px;

  margin-bottom: 14px;

  padding: 10px;

  border: 1px solid var(--border);
  border-radius: 10px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

/* Same readable size as Performance */

.document-filters :deep(input) {
  font-size: 11px;
}

.document-filters :deep(select) {
  font-size: 11px;
}

.document-filters :deep(button) {
  font-size: 10px;
}

/* LAYOUT */

.documents-layout {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    320px;

  gap: 14px;
}

.documents-main {
  display: flex;

  min-width: 0;

  flex-direction: column;

  gap: 14px;
}

/* FOOTER */

.table-footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 20px;

  padding: 2px 3px 0;
}

.table-footer p {
  margin: 0;

  color: var(--text-muted);

  font-size: 11px;
}

.table-footer strong {
  color: var(--text-primary);

  font-size: 11px;
  font-weight: 650;
}

@media (max-width: 1100px) {
  .documents-layout {
    grid-template-columns: 1fr;
  }

  .document-filters {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .document-filters {
    grid-template-columns: 1fr;
  }

  .table-footer {
    flex-direction: column;

    align-items: flex-start;
  }
}
</style>