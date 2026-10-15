import type {
  DocumentRecord,
  DocumentCategory,
  DocumentRecordStatus,
  MissingDocumentRequirement,
  DocumentActivity,
} from '~/types/document'

export const useDocumentsOverview = () => {
  const {
    employees,
  } = useEmployees()

  const employeeById = (
    id: number,
  ) => {
    return employees.value.find(
      employee =>
        employee.id === id,
    )
  }

  const createDocument = (
    data: {
      id: number
      employeeId: number

      documentType: string
      fileName: string

      category: DocumentCategory

      uploadedAt: string

      expiresAt?: string

      status: DocumentRecordStatus
    },
  ): DocumentRecord => {
    const employee =
      employeeById(
        data.employeeId,
      )

    if (!employee) {
      throw new Error(
        `Employee ${data.employeeId} not found`,
      )
    }

    return {
      id: data.id,

      employeeId:
        employee.id,

      employeeNumber:
        employee.employeeNumber,

      employeeName: [
        employee.firstName,
        employee.middleName,
        employee.lastName,
      ]
        .filter(Boolean)
        .join(' '),

      department:
        employee.department,

      documentType:
        data.documentType,

      fileName:
        data.fileName,

      category:
        data.category,

      uploadedAt:
        data.uploadedAt,

      expiresAt:
        data.expiresAt,

      status:
        data.status,
    }
  }

  /* =========================================================
     DOCUMENT RECORDS
  ========================================================= */

  const documents =
    ref<DocumentRecord[]>([
      createDocument({
        id: 1,
        employeeId: 1,

        documentType:
          'Government ID',

        fileName:
          'juan-valid-id.pdf',

        category:
          'Government',

        uploadedAt:
          '2026-01-10',

        status:
          'Verified',
      }),

      createDocument({
        id: 2,
        employeeId: 1,

        documentType:
          'Employment Contract',

        fileName:
          'juan-employment-contract.pdf',

        category:
          'Employment',

        uploadedAt:
          '2023-01-15',

        status:
          'Verified',
      }),

      createDocument({
        id: 3,
        employeeId: 1,

        documentType:
          'Medical Certificate',

        fileName:
          'juan-medical-certificate.pdf',

        category:
          'Medical',

        uploadedAt:
          '2025-10-10',

        expiresAt:
          '2026-10-10',

        status:
          'Expiring Soon',
      }),

      createDocument({
        id: 4,
        employeeId: 2,

        documentType:
          'Government ID',

        fileName:
          'maria-government-id.pdf',

        category:
          'Government',

        uploadedAt:
          '2025-08-10',

        status:
          'Verified',
      }),

      createDocument({
        id: 5,
        employeeId: 2,

        documentType:
          'Employment Contract',

        fileName:
          'maria-contract.pdf',

        category:
          'Employment',

        uploadedAt:
          '2022-08-10',

        status:
          'Verified',
      }),

      createDocument({
        id: 6,
        employeeId: 3,

        documentType:
          'NBI Clearance',

        fileName:
          'pedro-nbi-clearance.pdf',

        category:
          'Government',

        uploadedAt:
          '2026-05-02',

        expiresAt:
          '2027-05-02',

        status:
          'Verified',
      }),

      createDocument({
        id: 7,
        employeeId: 4,

        documentType:
          'Employment Contract',

        fileName:
          'ana-contract.pdf',

        category:
          'Employment',

        uploadedAt:
          '2026-02-12',

        status:
          'Pending',
      }),

      createDocument({
        id: 8,
        employeeId: 5,

        documentType:
          'Medical Certificate',

        fileName:
          'carlo-medical.pdf',

        category:
          'Medical',

        uploadedAt:
          '2025-08-15',

        expiresAt:
          '2026-08-15',

        status:
          'Expired',
      }),

      createDocument({
        id: 9,
        employeeId: 6,

        documentType:
          'Government ID',

        fileName:
          'angela-government-id.pdf',

        category:
          'Government',

        uploadedAt:
          '2026-03-20',

        status:
          'Verified',
      }),

      createDocument({
        id: 10,
        employeeId: 7,

        documentType:
          'Driver License',

        fileName:
          'mark-driver-license.pdf',

        category:
          'Government',

        uploadedAt:
          '2026-06-18',

        expiresAt:
          '2026-09-28',

        status:
          'Expiring Soon',
      }),
    ])

  /* =========================================================
     MISSING REQUIREMENTS
  ========================================================= */

  const missingRequirements =
    ref<MissingDocumentRequirement[]>([
      {
        id: 1,

        employeeId: 3,

        employeeName:
          'Pedro Reyes',

        employeeNumber:
          'EMP-003',

        documentType:
          'Medical Certificate',
      },

      {
        id: 2,

        employeeId: 4,

        employeeName:
          'Ana Garcia',

        employeeNumber:
          'EMP-004',

        documentType:
          'NBI Clearance',
      },

      {
        id: 3,

        employeeId: 7,

        employeeName:
          'Mark Lopez',

        employeeNumber:
          'EMP-007',

        documentType:
          'Employment Contract',
      },
    ])

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const category =
    ref('')

  const status =
    ref('')

  const currentPage =
    ref(1)

  const perPage =
    ref(6)

  const filteredDocuments =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return documents.value.filter(
        document => {
          const matchesSearch =
            !keyword ||
            document.employeeName
              .toLowerCase()
              .includes(keyword) ||
            document.employeeNumber
              .toLowerCase()
              .includes(keyword) ||
            document.documentType
              .toLowerCase()
              .includes(keyword) ||
            document.fileName
              .toLowerCase()
              .includes(keyword)

          const matchesCategory =
            !category.value ||
            document.category ===
              category.value

          const matchesStatus =
            !status.value ||
            document.status ===
              status.value

          return (
            matchesSearch &&
            matchesCategory &&
            matchesStatus
          )
        },
      )
    })

  /* =========================================================
     STATS
  ========================================================= */

  const stats =
    computed(() => ({
      total:
        documents.value.length,

      verified:
        documents.value.filter(
          document =>
            document.status ===
            'Verified',
        ).length,

      expiring:
        documents.value.filter(
          document =>
            document.status ===
            'Expiring Soon',
        ).length,

      missing:
        missingRequirements.value.length,
    }))

  const expiringDocuments =
    computed(() => {
      return documents.value.filter(
        document =>
          document.status ===
            'Expiring Soon' ||
          document.status ===
            'Expired',
      )
    })

  /* =========================================================
     RECENT ACTIVITY
  ========================================================= */

  const recentActivity =
    ref<DocumentActivity[]>([
      {
        id: 1,

        employeeName:
          'Juan Dela Cruz',

        action:
          'Document Uploaded',

        description:
          'Medical Certificate was uploaded to the employee record.',

        date:
          '2026-09-04',
      },

      {
        id: 2,

        employeeName:
          'Mark Lopez',

        action:
          'Expiry Reminder',

        description:
          'Driver License is approaching its expiration date.',

        date:
          '2026-09-04',
      },

      {
        id: 3,

        employeeName:
          'Ana Garcia',

        action:
          'Document For Verification',

        description:
          'Employment Contract is waiting for document verification.',

        date:
          '2026-09-03',
      },
    ])

  const categoryOptions:
    DocumentCategory[] = [
      'Government',
      'Employment',
      'Medical',
      'Payroll',
      'Other',
    ]

  const statusOptions:
    DocumentRecordStatus[] = [
      'Verified',
      'Pending',
      'Expiring Soon',
      'Expired',
    ]

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages =
    computed(() => {
      return Math.max(
        1,
        Math.ceil(
          filteredDocuments.value.length /
            perPage.value,
        ),
      )
    })

  const paginatedDocuments =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredDocuments.value.slice(
        start,
        start +
          perPage.value,
      )
    })

  const showingFrom =
    computed(() => {
      if (
        !filteredDocuments.value.length
      ) {
        return 0
      }

      return (
        (
          currentPage.value -
          1
        ) *
          perPage.value +
        1
      )
    })

  const showingTo =
    computed(() => {
      return Math.min(
        currentPage.value *
          perPage.value,

        filteredDocuments.value.length,
      )
    })

  const resetFilters = () => {
    search.value = ''
    category.value = ''
    status.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      category,
      status,
    ],
    () => {
      currentPage.value = 1
    },
  )

  return {
    documents,

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
  }
}