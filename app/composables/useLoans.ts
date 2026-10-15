import type {
  LoanFormData,
  LoanPayment,
  LoanRecord,
  LoanStatus,
  LoanType,
} from '~/types/loan'

export const useLoans = () => {
  const {
    employees,
  } = useEmployees()

  /* =========================================================
     MOCK LOANS
  ========================================================= */

  const loans =
    useState<LoanRecord[]>(
      'payroll-loans',
      () => [
        {
          id: 1,

          loanNumber:
            'LN-2026-001',

          employeeId: 1,

          employeeNumber:
            'EMP-001',

          employeeName:
            'Juan Dela Cruz',

          department:
            'Operations',

          position:
            'Driver',

          loanType:
            'Salary Loan',

          principalAmount:
            30000,

          monthlyDeduction:
            2500,

          totalPaid:
            10000,

          outstandingBalance:
            20000,

          startDate:
            '2026-05-01',

          endDate:
            '2027-04-30',

          status:
            'Active',

          remarks:
            'Employee salary loan payable through payroll deduction.',

          requestedBy:
            'Juan Dela Cruz',

          requestedAt:
            '2026-04-25T09:15:00',

          approvedBy:
            'Maria Santos',

          approvedAt:
            '2026-04-26T10:30:00',

          approvalNotes:
            'Approved subject to monthly payroll deduction.',

          activatedBy:
            'Maria Santos',

          activatedAt:
            '2026-05-01T08:00:00',
        },

        {
          id: 2,

          loanNumber:
            'LN-2026-002',

          employeeId: 7,

          employeeNumber:
            'EMP-007',

          employeeName:
            'Mark Lopez',

          department:
            'Operations',

          position:
            'Driver',

          loanType:
            'SSS Loan',

          principalAmount:
            20000,

          monthlyDeduction:
            2000,

          totalPaid:
            6000,

          outstandingBalance:
            14000,

          startDate:
            '2026-06-01',

          endDate:
            '2027-03-31',

          status:
            'Active',

          remarks:
            'SSS salary loan deduction.',

          requestedBy:
            'Mark Lopez',

          requestedAt:
            '2026-05-25T11:20:00',

          approvedBy:
            'Maria Santos',

          approvedAt:
            '2026-05-27T14:00:00',

          activatedBy:
            'Maria Santos',

          activatedAt:
            '2026-06-01T08:00:00',
        },

        {
          id: 3,

          loanNumber:
            'LN-2026-003',

          employeeId: 3,

          employeeNumber:
            'EMP-003',

          employeeName:
            'Pedro Reyes',

          department:
            'Finance',

          position:
            'Accountant',

          loanType:
            'Emergency Loan',

          principalAmount:
            15000,

          monthlyDeduction:
            3000,

          totalPaid:
            0,

          outstandingBalance:
            15000,

          startDate:
            '2026-09-30',

          endDate:
            '2027-02-28',

          status:
            'Pending',

          remarks:
            'Emergency financial assistance request.',

          attachment: {
            name:
              'emergency-request.pdf',
          },

          requestedBy:
            'Pedro Reyes',

          requestedAt:
            '2026-09-15T09:20:00',
        },

        {
          id: 4,

          loanNumber:
            'LN-2026-004',

          employeeId: 6,

          employeeNumber:
            'EMP-006',

          employeeName:
            'Angela Flores',

          department:
            'Billing',

          position:
            'Billing Officer',

          loanType:
            'Pag-IBIG Loan',

          principalAmount:
            25000,

          monthlyDeduction:
            2500,

          totalPaid:
            25000,

          outstandingBalance:
            0,

          startDate:
            '2025-11-01',

          endDate:
            '2026-08-31',

          status:
            'Completed',

          remarks:
            'Pag-IBIG loan fully deducted.',

          requestedBy:
            'Angela Flores',

          requestedAt:
            '2025-10-20T10:30:00',

          approvedBy:
            'Maria Santos',

          approvedAt:
            '2025-10-22T09:10:00',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-08-31T17:00:00',
        },

        {
          id: 5,

          loanNumber:
            'LN-2026-005',

          employeeId: 5,

          employeeNumber:
            'EMP-005',

          employeeName:
            'Carlo Mendoza',

          department:
            'Operations',

          position:
            'Driver',

          loanType:
            'Cash Advance',

          principalAmount:
            5000,

          monthlyDeduction:
            2500,

          totalPaid:
            0,

          outstandingBalance:
            5000,

          startDate:
            '2026-09-30',

          endDate:
            '2026-10-31',

          status:
            'Approved',

          remarks:
            'Approved cash advance.',

          requestedBy:
            'Carlo Mendoza',

          requestedAt:
            '2026-09-12T14:10:00',

          approvedBy:
            'Maria Santos',

          approvedAt:
            '2026-09-13T10:00:00',
        },

        {
          id: 6,

          loanNumber:
            'LN-2026-006',

          employeeId: 10,

          employeeNumber:
            'EMP-010',

          employeeName:
            'Grace Navarro',

          department:
            'Human Resources',

          position:
            'HR Assistant',

          loanType:
            'Company Loan',

          principalAmount:
            40000,

          monthlyDeduction:
            4000,

          totalPaid:
            0,

          outstandingBalance:
            40000,

          startDate:
            '2026-10-01',

          endDate:
            '2027-07-31',

          status:
            'Rejected',

          remarks:
            'Company loan application.',

          requestedBy:
            'Grace Navarro',

          requestedAt:
            '2026-09-08T09:00:00',

          rejectedBy:
            'Maria Santos',

          rejectedAt:
            '2026-09-09T13:30:00',

          rejectionReason:
            'Employee does not yet meet the required service period.',
        },

        {
          id: 7,

          loanNumber:
            'LN-2026-007',

          employeeId: 4,

          employeeNumber:
            'EMP-004',

          employeeName:
            'Ana Garcia',

          department:
            'Operations',

          position:
            'Dispatcher',

          loanType:
            'Salary Loan',

          principalAmount:
            12000,

          monthlyDeduction:
            2000,

          totalPaid:
            4000,

          outstandingBalance:
            8000,

          startDate:
            '2026-08-01',

          endDate:
            '2027-01-31',

          status:
            'Active',

          requestedBy:
            'Ana Garcia',

          requestedAt:
            '2026-07-20T10:00:00',

          approvedBy:
            'Maria Santos',

          approvedAt:
            '2026-07-21T08:40:00',

          activatedBy:
            'Maria Santos',

          activatedAt:
            '2026-08-01T08:00:00',
        },

        {
          id: 8,

          loanNumber:
            'LN-2026-008',

          employeeId: 11,

          employeeNumber:
            'EMP-011',

          employeeName:
            'Leo Martinez',

          department:
            'Operations',

          position:
            'Dispatcher',

          loanType:
            'Emergency Loan',

          principalAmount:
            10000,

          monthlyDeduction:
            2000,

          totalPaid:
            0,

          outstandingBalance:
            10000,

          startDate:
            '2026-10-01',

          endDate:
            '2027-02-28',

          status:
            'Pending',

          requestedBy:
            'Leo Martinez',

          requestedAt:
            '2026-09-16T08:15:00',
        },
      ],
    )

  /* =========================================================
     PAYMENT HISTORY
  ========================================================= */

  const loanPayments =
    useState<
      Record<
        number,
        LoanPayment[]
      >
    >(
      'loan-payment-history',
      () => ({
        1: [
          {
            id: 1,

            loanId: 1,

            payrollPeriod:
              'May 1–15, 2026',

            referenceNumber:
              'PAY-2026-0515-001',

            deductionAmount:
              2500,

            previousBalance:
              30000,

            remainingBalance:
              27500,

            datePosted:
              '2026-05-15',

            status:
              'Posted',
          },

          {
            id: 2,

            loanId: 1,

            payrollPeriod:
              'May 16–31, 2026',

            referenceNumber:
              'PAY-2026-0531-001',

            deductionAmount:
              2500,

            previousBalance:
              27500,

            remainingBalance:
              25000,

            datePosted:
              '2026-05-31',

            status:
              'Posted',
          },

          {
            id: 3,

            loanId: 1,

            payrollPeriod:
              'Jun 1–15, 2026',

            referenceNumber:
              'PAY-2026-0615-001',

            deductionAmount:
              2500,

            previousBalance:
              25000,

            remainingBalance:
              22500,

            datePosted:
              '2026-06-15',

            status:
              'Posted',
          },

          {
            id: 4,

            loanId: 1,

            payrollPeriod:
              'Jun 16–30, 2026',

            referenceNumber:
              'PAY-2026-0630-001',

            deductionAmount:
              2500,

            previousBalance:
              22500,

            remainingBalance:
              20000,

            datePosted:
              '2026-06-30',

            status:
              'Posted',
          },
        ],

        2: [
          {
            id: 5,

            loanId: 2,

            payrollPeriod:
              'Jun 1–15, 2026',

            referenceNumber:
              'PAY-2026-0615-007',

            deductionAmount:
              2000,

            previousBalance:
              20000,

            remainingBalance:
              18000,

            datePosted:
              '2026-06-15',

            status:
              'Posted',
          },

          {
            id: 6,

            loanId: 2,

            payrollPeriod:
              'Jun 16–30, 2026',

            referenceNumber:
              'PAY-2026-0630-007',

            deductionAmount:
              2000,

            previousBalance:
              18000,

            remainingBalance:
              16000,

            datePosted:
              '2026-06-30',

            status:
              'Posted',
          },

          {
            id: 7,

            loanId: 2,

            payrollPeriod:
              'Jul 1–15, 2026',

            referenceNumber:
              'PAY-2026-0715-007',

            deductionAmount:
              2000,

            previousBalance:
              16000,

            remainingBalance:
              14000,

            datePosted:
              '2026-07-15',

            status:
              'Posted',
          },
        ],

        4: [
          {
            id: 8,

            loanId: 4,

            payrollPeriod:
              'Aug 16–31, 2026',

            referenceNumber:
              'PAY-2026-0831-006',

            deductionAmount:
              2500,

            previousBalance:
              2500,

            remainingBalance:
              0,

            datePosted:
              '2026-08-31',

            status:
              'Posted',
          },
        ],

        7: [
          {
            id: 9,

            loanId: 7,

            payrollPeriod:
              'Aug 1–15, 2026',

            referenceNumber:
              'PAY-2026-0815-004',

            deductionAmount:
              2000,

            previousBalance:
              12000,

            remainingBalance:
              10000,

            datePosted:
              '2026-08-15',

            status:
              'Posted',
          },

          {
            id: 10,

            loanId: 7,

            payrollPeriod:
              'Aug 16–31, 2026',

            referenceNumber:
              'PAY-2026-0831-004',

            deductionAmount:
              2000,

            previousBalance:
              10000,

            remainingBalance:
              8000,

            datePosted:
              '2026-08-31',

            status:
              'Posted',
          },
        ],
      }),
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const loanType =
    ref('')

  const department =
    ref('')

  const status =
    ref('')

  const dateFrom =
    ref('')

  const dateTo =
    ref('')

  /* =========================================================
     PAGINATION
  ========================================================= */

  const currentPage =
    ref(1)

  const perPage =
    ref(6)

  /* =========================================================
     OPTIONS
  ========================================================= */

  const loanTypeOptions:
    LoanType[] = [
      'Salary Loan',
      'SSS Loan',
      'Pag-IBIG Loan',
      'Company Loan',
      'Cash Advance',
      'Emergency Loan',
      'Other',
    ]

  const statusOptions:
    LoanStatus[] = [
      'Pending',
      'Approved',
      'Active',
      'Completed',
      'Rejected',
      'Cancelled',
    ]

  const departmentOptions =
    computed(() => {
      return [
        ...new Set(
          loans.value.map(
            loan =>
              loan.department,
          ),
        ),
      ].sort()
    })

  /* =========================================================
     FILTERED
  ========================================================= */

  const filteredLoans =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return loans.value.filter(
        loan => {
          const matchesSearch =
            !keyword ||
            loan.loanNumber
              .toLowerCase()
              .includes(keyword) ||
            loan.employeeName
              .toLowerCase()
              .includes(keyword) ||
            loan.employeeNumber
              .toLowerCase()
              .includes(keyword)

          const matchesType =
            !loanType.value ||
            loan.loanType ===
              loanType.value

          const matchesDepartment =
            !department.value ||
            loan.department ===
              department.value

          const matchesStatus =
            !status.value ||
            loan.status ===
              status.value

          const matchesFrom =
            !dateFrom.value ||
            loan.startDate >=
              dateFrom.value

          const matchesTo =
            !dateTo.value ||
            loan.startDate <=
              dateTo.value

          return (
            matchesSearch &&
            matchesType &&
            matchesDepartment &&
            matchesStatus &&
            matchesFrom &&
            matchesTo
          )
        },
      )
    })

  /* =========================================================
     STATS
  ========================================================= */

  const stats =
    computed(() => {
      return {
        active:
          loans.value.filter(
            loan =>
              loan.status ===
              'Active',
          ).length,

        pending:
          loans.value.filter(
            loan =>
              loan.status ===
              'Pending',
          ).length,

        outstanding:
          loans.value
            .filter(
              loan =>
                loan.status ===
                  'Active' ||
                loan.status ===
                  'Approved',
            )
            .reduce(
              (
                total,
                loan,
              ) =>
                total +
                loan.outstandingBalance,
              0,
            ),

        completed:
          loans.value.filter(
            loan =>
              loan.status ===
              'Completed',
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
          filteredLoans
            .value.length /
            perPage.value,
        ),
      )
    })

  const paginatedLoans =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredLoans
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
        !filteredLoans
          .value.length
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

        filteredLoans
          .value.length,
      )
    })

  /* =========================================================
     CREATE
  ========================================================= */

  const createLoan = (
    data:
      LoanFormData,
  ) => {
    if (
      data.employeeId ===
        null ||
      data.principalAmount ===
        null ||
      data.monthlyDeduction ===
        null
    ) {
      return null
    }

    const employee =
      employees.value.find(
        item =>
          item.id ===
          data.employeeId,
      )

    if (!employee) {
      return null
    }

    const nextId =
      loans.value.length
        ? Math.max(
            ...loans.value.map(
              loan =>
                loan.id,
            ),
          ) + 1
        : 1

    const employeeName =
      [
        employee.firstName,
        employee.middleName,
        employee.lastName,
      ]
        .filter(Boolean)
        .join(' ')

    const year =
      new Date()
        .getFullYear()

    const loan:
      LoanRecord = {
        id:
          nextId,

        loanNumber:
          `LN-${year}-${String(
            nextId,
          ).padStart(
            3,
            '0',
          )}`,

        employeeId:
          employee.id,

        employeeNumber:
          employee.employeeNumber,

        employeeName,

        department:
          employee.department,

        position:
          employee.position,

        loanType:
          data.loanType,

        principalAmount:
          data.principalAmount,

        monthlyDeduction:
          data.monthlyDeduction,

        totalPaid:
          0,

        outstandingBalance:
          data.principalAmount,

        startDate:
          data.startDate,

        endDate:
          data.endDate,

        status:
          'Pending',

        remarks:
          data.remarks ||
          undefined,

        attachment:
          data.attachmentName
            ? {
                name:
                  data.attachmentName,
              }
            : undefined,

        requestedBy:
          employeeName,

        requestedAt:
          new Date()
            .toISOString(),
      }

    loans.value.unshift(
      loan,
    )

    return loan
  }

  /* =========================================================
     UPDATE
  ========================================================= */

  const updateLoan = (
    id: number,

    data:
      LoanFormData,
  ) => {
    const loan =
      loans.value.find(
        item =>
          item.id === id,
      )

    if (
      !loan ||
      data.employeeId ===
        null ||
      data.principalAmount ===
        null ||
      data.monthlyDeduction ===
        null
    ) {
      return null
    }

    const employee =
      employees.value.find(
        item =>
          item.id ===
          data.employeeId,
      )

    if (!employee) {
      return null
    }

    loan.employeeId =
      employee.id

    loan.employeeNumber =
      employee.employeeNumber

    loan.employeeName =
      [
        employee.firstName,
        employee.middleName,
        employee.lastName,
      ]
        .filter(Boolean)
        .join(' ')

    loan.department =
      employee.department

    loan.position =
      employee.position

    loan.loanType =
      data.loanType

    loan.principalAmount =
      data.principalAmount

    loan.monthlyDeduction =
      data.monthlyDeduction

    loan.outstandingBalance =
      Math.max(
        0,
        data.principalAmount -
          loan.totalPaid,
      )

    loan.startDate =
      data.startDate

    loan.endDate =
      data.endDate

    loan.remarks =
      data.remarks ||
      undefined

    loan.attachment =
      data.attachmentName
        ? {
            name:
              data.attachmentName,
          }
        : undefined

    return loan
  }

  /* =========================================================
     APPROVE
  ========================================================= */

  const approveLoan = (
    id: number,

    notes?: string,
  ) => {
    const loan =
      loans.value.find(
        item =>
          item.id === id,
      )

    if (!loan) {
      return null
    }

    loan.status =
      'Approved'

    loan.approvedBy =
      'Maria Santos'

    loan.approvedAt =
      new Date()
        .toISOString()

    loan.approvalNotes =
      notes ||
      undefined

    return loan
  }

  /* =========================================================
     REJECT
  ========================================================= */

  const rejectLoan = (
    id: number,

    reason: string,
  ) => {
    const loan =
      loans.value.find(
        item =>
          item.id === id,
      )

    if (!loan) {
      return null
    }

    loan.status =
      'Rejected'

    loan.rejectedBy =
      'Maria Santos'

    loan.rejectedAt =
      new Date()
        .toISOString()

    loan.rejectionReason =
      reason

    return loan
  }

  /* =========================================================
     ACTIVATE
  ========================================================= */

  const activateLoan = (
    id: number,
  ) => {
    const loan =
      loans.value.find(
        item =>
          item.id === id,
      )

    if (!loan) {
      return null
    }

    loan.status =
      'Active'

    loan.activatedBy =
      'Maria Santos'

    loan.activatedAt =
      new Date()
        .toISOString()

    return loan
  }

  /* =========================================================
     COMPLETE
  ========================================================= */

  const completeLoan = (
    id: number,
  ) => {
    const loan =
      loans.value.find(
        item =>
          item.id === id,
      )

    if (!loan) {
      return null
    }

    loan.status =
      'Completed'

    loan.totalPaid =
      loan.principalAmount

    loan.outstandingBalance =
      0

    loan.completedBy =
      'Maria Santos'

    loan.completedAt =
      new Date()
        .toISOString()

    return loan
  }

  /* =========================================================
     CANCEL
  ========================================================= */

  const cancelLoan = (
    id: number,

    reason: string,
  ) => {
    const loan =
      loans.value.find(
        item =>
          item.id === id,
      )

    if (!loan) {
      return null
    }

    loan.status =
      'Cancelled'

    loan.cancelledBy =
      'Maria Santos'

    loan.cancelledAt =
      new Date()
        .toISOString()

    loan.cancellationReason =
      reason

    return loan
  }

  /* =========================================================
     PAYMENTS
  ========================================================= */

  const getLoanPayments = (
    loanId: number,
  ) => {
    return (
      loanPayments.value[
        loanId
      ] ?? []
    )
  }

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value =
      ''

    loanType.value =
      ''

    department.value =
      ''

    status.value =
      ''

    dateFrom.value =
      ''

    dateTo.value =
      ''

    currentPage.value =
      1
  }

  watch(
    [
      search,
      loanType,
      department,
      status,
      dateFrom,
      dateTo,
    ],
    () => {
      currentPage.value =
        1
    },
  )

  watch(
    totalPages,
    () => {
      if (
        currentPage.value >
        totalPages.value
      ) {
        currentPage.value =
          totalPages.value
      }
    },
  )

  return {
    loans,

    loanPayments,

    search,
    loanType,
    department,
    status,
    dateFrom,
    dateTo,

    currentPage,
    perPage,

    filteredLoans,
    paginatedLoans,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    loanTypeOptions,
    statusOptions,
    departmentOptions,

    createLoan,
    updateLoan,

    approveLoan,
    rejectLoan,
    activateLoan,
    completeLoan,
    cancelLoan,

    getLoanPayments,

    resetFilters,
  }
}