import type {
  ExpiringDocument,
  ExpiringDocumentStatus,
} from '~/types/expiringDocument'

export const useExpiringDocuments = () => {
  const documents =
    useState<ExpiringDocument[]>(
      'expiring-documents',
      () => [
        {
          id: 1,

          employeeId: 1,
          employeeNumber: 'EMP-001',
          employeeName: 'Juan Dela Cruz',

          department: 'Operations',
          position: 'Driver',

          category: 'Government IDs',

          documentName: 'Driver License',
          documentNumber: 'N01-23-456789',

          issuedDate: '2023-10-15',
          expiryDate: '2026-10-09',

          issuingAuthority: 'LTO',

          uploadedAt: '2026-01-15T09:30:00',

          remarks: 'Renewal required before next deployment.',
        },

        {
          id: 2,

          employeeId: 3,
          employeeNumber: 'EMP-003',
          employeeName: 'Pedro Reyes',

          department: 'Finance',
          position: 'Finance Staff',

          category: 'Government IDs',

          documentName: 'Professional ID',
          documentNumber: 'PRC-2024-00291',

          issuedDate: '2024-10-20',
          expiryDate: '2026-10-20',

          issuingAuthority: 'PRC',

          uploadedAt: '2026-02-10T10:15:00',
        },

        {
          id: 3,

          employeeId: 6,
          employeeNumber: 'EMP-006',
          employeeName: 'Angela Flores',

          department: 'Billing',
          position: 'Billing Staff',

          category: 'Certificates',

          documentName: 'Billing Compliance Certificate',
          documentNumber: 'BCC-2025-182',

          issuedDate: '2025-11-01',
          expiryDate: '2026-11-01',

          issuingAuthority: 'Training Provider',

          uploadedAt: '2026-01-20T11:00:00',
        },

        {
          id: 4,

          employeeId: 7,
          employeeNumber: 'EMP-007',
          employeeName: 'Mark Lopez',

          department: 'IT',
          position: 'IT Support',

          category: 'Certificates',

          documentName: 'Network Support Certification',
          documentNumber: 'NSC-445920',

          issuedDate: '2024-12-10',
          expiryDate: '2026-12-10',

          issuingAuthority: 'Certification Provider',

          uploadedAt: '2026-03-01T08:45:00',
        },

        {
          id: 5,

          employeeId: 8,
          employeeNumber: 'EMP-008',
          employeeName: 'Jenny Ramos',

          department: 'Human Resources',
          position: 'HR Staff',

          category: 'Medical Records',

          documentName: 'Annual Medical Certificate',

          issuedDate: '2025-09-30',
          expiryDate: '2026-09-30',

          issuingAuthority: 'Accredited Clinic',

          uploadedAt: '2025-10-01T10:00:00',

          remarks: 'Already expired. Updated medical certificate required.',
        },

        {
          id: 6,

          employeeId: 9,
          employeeNumber: 'EMP-009',
          employeeName: 'Robert Castillo',

          department: 'Finance',
          position: 'Finance Officer',

          category: 'Client Requirements',

          documentName: 'Client Accreditation',
          documentNumber: 'ACC-2026-091',

          issuedDate: '2026-04-15',
          expiryDate: '2026-10-15',

          issuingAuthority: 'Client Accreditation Office',

          uploadedAt: '2026-04-16T14:00:00',
        },

        {
          id: 7,

          employeeId: 11,
          employeeNumber: 'EMP-011',
          employeeName: 'Leo Martinez',

          department: 'Operations',
          position: 'Driver',

          category: 'Government IDs',

          documentName: 'Driver License',
          documentNumber: 'LTO-884521',

          issuedDate: '2023-10-01',
          expiryDate: '2026-10-06',

          issuingAuthority: 'LTO',

          uploadedAt: '2026-01-12T08:30:00',

          remarks: 'Expires today.',
        },

        {
          id: 8,

          employeeId: 12,
          employeeNumber: 'EMP-012',
          employeeName: 'Claire Villanueva',

          department: 'Operations',
          position: 'Operations Coordinator',

          category: 'Client Requirements',

          documentName: 'Site Access Certification',
          documentNumber: 'SAC-2026-113',

          issuedDate: '2026-05-01',
          expiryDate: '2026-11-15',

          issuingAuthority: 'Client Site Administration',

          uploadedAt: '2026-05-02T09:00:00',
        },

        {
          id: 9,

          employeeId: 4,
          employeeNumber: 'EMP-004',
          employeeName: 'Ana Garcia',

          department: 'Operations',
          position: 'Operations Staff',

          category: 'Medical Records',

          documentName: 'Fit to Work Certificate',

          issuedDate: '2026-04-01',
          expiryDate: '2026-10-25',

          issuingAuthority: 'Accredited Clinic',

          uploadedAt: '2026-04-01T13:30:00',
        },

        {
          id: 10,

          employeeId: 5,
          employeeNumber: 'EMP-005',
          employeeName: 'Carlo Mendoza',

          department: 'IT',
          position: 'Software Developer',

          category: 'Certificates',

          documentName: 'Cloud Developer Certification',
          documentNumber: 'CDC-2025-9182',

          issuedDate: '2025-10-02',
          expiryDate: '2026-10-02',

          issuingAuthority: 'Cloud Certification Provider',

          uploadedAt: '2025-10-03T08:15:00',

          remarks: 'Renewal pending.',
        },
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const category =
    ref('')

  const department =
    ref('')

  const expiryWindow =
    ref('')

  const status =
    ref('')

  /* =========================================================
     PAGINATION
  ========================================================= */

  const currentPage =
    ref(1)

  const perPage =
    ref(6)

  /* =========================================================
     HELPERS
  ========================================================= */

  const todayString = () => {
    const now =
      new Date()

    return [
      now.getFullYear(),
      String(
        now.getMonth() + 1,
      ).padStart(2, '0'),
      String(
        now.getDate(),
      ).padStart(2, '0'),
    ].join('-')
  }

  const getDaysRemaining = (
    expiryDate: string,
  ) => {
    const today =
      new Date(
        `${todayString()}T00:00:00`,
      )

    const expiry =
      new Date(
        `${expiryDate}T00:00:00`,
      )

    return Math.ceil(
      (
        expiry.getTime() -
        today.getTime()
      ) /
      (
        1000 *
        60 *
        60 *
        24
      ),
    )
  }

  const getDocumentStatus = (
    expiryDate: string,
  ): ExpiringDocumentStatus => {
    const days =
      getDaysRemaining(
        expiryDate,
      )

    if (days < 0) {
      return 'Expired'
    }

    if (days <= 7) {
      return 'Critical'
    }

    if (days <= 30) {
      return 'Expiring Soon'
    }

    return 'Monitor'
  }

  /* =========================================================
     OPTIONS
  ========================================================= */

  const categoryOptions =
    computed(() => {
      return [
        ...new Set(
          documents.value.map(
            item =>
              item.category,
          ),
        ),
      ].sort()
    })

  const departmentOptions =
    computed(() => {
      return [
        ...new Set(
          documents.value.map(
            item =>
              item.department,
          ),
        ),
      ].sort()
    })

  const expiryWindowOptions = [
    'Expired',
    'Within 7 Days',
    'Within 30 Days',
    'Within 60 Days',
    'Within 90 Days',
  ]

  const statusOptions:
    ExpiringDocumentStatus[] = [
      'Expired',
      'Critical',
      'Expiring Soon',
      'Monitor',
    ]

  /* =========================================================
     FILTERED
  ========================================================= */

  const filteredDocuments =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return documents.value.filter(
        item => {
          const days =
            getDaysRemaining(
              item.expiryDate,
            )

          const documentStatus =
            getDocumentStatus(
              item.expiryDate,
            )

          const matchesSearch =
            !keyword ||
            item.employeeName
              .toLowerCase()
              .includes(keyword) ||
            item.employeeNumber
              .toLowerCase()
              .includes(keyword) ||
            item.documentName
              .toLowerCase()
              .includes(keyword) ||
            (
              item.documentNumber ??
              ''
            )
              .toLowerCase()
              .includes(keyword)

          const matchesCategory =
            !category.value ||
            item.category ===
              category.value

          const matchesDepartment =
            !department.value ||
            item.department ===
              department.value

          const matchesStatus =
            !status.value ||
            documentStatus ===
              status.value

          let matchesWindow =
            true

          if (
            expiryWindow.value ===
            'Expired'
          ) {
            matchesWindow =
              days < 0
          }

          if (
            expiryWindow.value ===
            'Within 7 Days'
          ) {
            matchesWindow =
              days >= 0 &&
              days <= 7
          }

          if (
            expiryWindow.value ===
            'Within 30 Days'
          ) {
            matchesWindow =
              days >= 0 &&
              days <= 30
          }

          if (
            expiryWindow.value ===
            'Within 60 Days'
          ) {
            matchesWindow =
              days >= 0 &&
              days <= 60
          }

          if (
            expiryWindow.value ===
            'Within 90 Days'
          ) {
            matchesWindow =
              days >= 0 &&
              days <= 90
          }

          return (
            matchesSearch &&
            matchesCategory &&
            matchesDepartment &&
            matchesStatus &&
            matchesWindow
          )
        },
      )
    })

  /* =========================================================
     STATS
  ========================================================= */

  const stats =
    computed(() => {
      const data =
        documents.value

      return {
        expiringDocuments:
          data.length,

        expired:
          data.filter(
            item =>
              getDaysRemaining(
                item.expiryDate,
              ) < 0,
          ).length,

        critical:
          data.filter(
            item => {
              const days =
                getDaysRemaining(
                  item.expiryDate,
                )

              return (
                days >= 0 &&
                days <= 7
              )
            },
          ).length,

        within30Days:
          data.filter(
            item => {
              const days =
                getDaysRemaining(
                  item.expiryDate,
                )

              return (
                days >= 0 &&
                days <= 30
              )
            },
          ).length,
      }
    })

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages =
    computed(() => {
      return Math.max(
        1,
        Math.ceil(
          filteredDocuments
            .value.length /
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

      return filteredDocuments
        .value
        .slice(
          start,
          start +
            perPage.value,
        )
    })

  const showingFrom =
    computed(() => {
      if (
        filteredDocuments
          .value.length === 0
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

        filteredDocuments
          .value.length,
      )
    })

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value = ''
    category.value = ''
    department.value = ''
    expiryWindow.value = ''
    status.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      category,
      department,
      expiryWindow,
      status,
    ],
    () => {
      currentPage.value = 1
    },
  )

  watch(
    totalPages,
    value => {
      if (
        currentPage.value >
        value
      ) {
        currentPage.value =
          value
      }
    },
  )

  return {
    documents,

    search,
    category,
    department,
    expiryWindow,
    status,

    currentPage,

    filteredDocuments,
    paginatedDocuments,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    categoryOptions,
    departmentOptions,
    expiryWindowOptions,
    statusOptions,

    getDaysRemaining,
    getDocumentStatus,

    resetFilters,
  }
}