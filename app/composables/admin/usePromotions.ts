import type {
  PromotionRecord,
  PromotionStatus,
  PromotionType,
} from '~/types/promotion'

export const usePromotions = () => {
  const records =
    useState<PromotionRecord[]>(
      'employee-lifecycle-promotions',
      () => [
        {
          id: 1,

          promotionNumber:
            'PRO-2026-001',

          employeeId: 7,
          employeeNumber:
            'EMP-007',

          employeeName:
            'Mark Lopez',

          department:
            'Information Technology',

          currentPosition:
            'IT Support',

          newPosition:
            'Senior IT Support',

          currentGrade:
            'G5',

          newGrade:
            'G6',

          currentSalary:
            32000,

          newSalary:
            38000,

          salaryIncrease:
            6000,

          increasePercentage:
            18.75,

          promotionType:
            'Position Promotion',

          recommendedBy:
            'IT Manager',

          approvedBy:
            'Maria Santos',

          recommendationDate:
            '2026-10-01',

          effectiveDate:
            '2026-10-16',

          reason:
            'Strong technical performance and increased responsibilities.',

          status:
            'Scheduled',

          remarks:
            'Promotion effective next payroll period.',

          createdAt:
            '2026-10-01T09:00:00',

          updatedAt:
            '2026-10-07T14:00:00',
        },

        {
          id: 2,

          promotionNumber:
            'PRO-2026-002',

          employeeId: 8,
          employeeNumber:
            'EMP-008',

          employeeName:
            'Jenny Ramos',

          department:
            'Human Resources',

          currentPosition:
            'HR Staff',

          newPosition:
            'HR Officer',

          currentGrade:
            'G4',

          newGrade:
            'G5',

          currentSalary:
            28500,

          newSalary:
            33000,

          salaryIncrease:
            4500,

          increasePercentage:
            15.79,

          promotionType:
            'Position Promotion',

          recommendedBy:
            'Maria Santos',

          approvedBy:
            'General Manager',

          recommendationDate:
            '2026-09-20',

          effectiveDate:
            '2026-10-01',

          reason:
            'Promotion based on performance and expanded HR responsibilities.',

          status:
            'Effective',

          remarks:
            'Promotion already reflected in employee profile.',

          createdAt:
            '2026-09-20T08:30:00',

          updatedAt:
            '2026-10-01T08:00:00',
        },

        {
          id: 3,

          promotionNumber:
            'PRO-2026-003',

          employeeId: 5,
          employeeNumber:
            'EMP-005',

          employeeName:
            'Carlo Mendoza',

          department:
            'Information Technology',

          currentPosition:
            'Software Developer',

          newPosition:
            'Senior Software Developer',

          currentGrade:
            'G6',

          newGrade:
            'G7',

          currentSalary:
            42000,

          newSalary:
            50000,

          salaryIncrease:
            8000,

          increasePercentage:
            19.05,

          promotionType:
            'Position Promotion',

          recommendedBy:
            'IT Manager',

          recommendationDate:
            '2026-10-04',

          effectiveDate:
            '2026-11-01',

          reason:
            'Consistently exceeds technical performance targets.',

          status:
            'Pending Approval',

          remarks:
            'For management approval.',

          createdAt:
            '2026-10-04T10:00:00',

          updatedAt:
            '2026-10-07T11:00:00',
        },

        {
          id: 4,

          promotionNumber:
            'PRO-2026-004',

          employeeId: 10,
          employeeNumber:
            'EMP-010',

          employeeName:
            'Grace Navarro',

          department:
            'Human Resources',

          currentPosition:
            'HR Staff',

          newPosition:
            'Recruitment Coordinator',

          currentGrade:
            'G4',

          newGrade:
            'G5',

          currentSalary:
            28000,

          newSalary:
            32500,

          salaryIncrease:
            4500,

          increasePercentage:
            16.07,

          promotionType:
            'Leadership Promotion',

          recommendedBy:
            'Maria Santos',

          recommendationDate:
            '2026-10-06',

          effectiveDate:
            '2026-11-01',

          reason:
            'Employee will lead recruitment coordination activities.',

          status:
            'For Review',

          createdAt:
            '2026-10-06T09:00:00',

          updatedAt:
            '2026-10-07T09:30:00',
        },

        {
          id: 5,

          promotionNumber:
            'PRO-2026-005',

          employeeId: 9,
          employeeNumber:
            'EMP-009',

          employeeName:
            'Robert Castillo',

          department:
            'Finance',

          currentPosition:
            'Finance Officer',

          newPosition:
            'Senior Finance Officer',

          currentGrade:
            'G6',

          newGrade:
            'G7',

          currentSalary:
            39000,

          newSalary:
            46000,

          salaryIncrease:
            7000,

          increasePercentage:
            17.95,

          promotionType:
            'Grade Promotion',

          recommendedBy:
            'Finance Manager',

          approvedBy:
            'General Manager',

          recommendationDate:
            '2026-09-15',

          effectiveDate:
            '2026-10-01',

          reason:
            'Grade advancement based on tenure and performance.',

          status:
            'Effective',

          remarks:
            'Completed and reflected in payroll.',

          createdAt:
            '2026-09-15T08:00:00',

          updatedAt:
            '2026-10-01T08:00:00',
        },

        {
          id: 6,

          promotionNumber:
            'PRO-2026-006',

          employeeId: 6,
          employeeNumber:
            'EMP-006',

          employeeName:
            'Angela Flores',

          department:
            'Billing',

          currentPosition:
            'Billing Staff',

          newPosition:
            'Billing Specialist',

          currentGrade:
            'G4',

          newGrade:
            'G5',

          currentSalary:
            27500,

          newSalary:
            31500,

          salaryIncrease:
            4000,

          increasePercentage:
            14.55,

          promotionType:
            'Position Promotion',

          recommendedBy:
            'Billing Supervisor',

          recommendationDate:
            '2026-10-07',

          effectiveDate:
            '2026-11-15',

          reason:
            'Proposed promotion based on billing accuracy and productivity.',

          status:
            'Draft',

          createdAt:
            '2026-10-07T11:30:00',

          updatedAt:
            '2026-10-07T11:30:00',
        },

        {
          id: 7,

          promotionNumber:
            'PRO-2026-007',

          employeeId: 12,
          employeeNumber:
            'EMP-012',

          employeeName:
            'Claire Villanueva',

          department:
            'Operations',

          currentPosition:
            'Operations Coordinator',

          newPosition:
            'Senior Operations Coordinator',

          currentGrade:
            'G5',

          newGrade:
            'G6',

          currentSalary:
            34000,

          newSalary:
            40000,

          salaryIncrease:
            6000,

          increasePercentage:
            17.65,

          promotionType:
            'Leadership Promotion',

          recommendedBy:
            'Operations Manager',

          recommendationDate:
            '2026-10-03',

          effectiveDate:
            '2026-11-01',

          reason:
            'Recommended for senior coordination role.',

          status:
            'Rejected',

          remarks:
            'Promotion deferred due to current organizational restructuring.',

          createdAt:
            '2026-10-03T08:45:00',

          updatedAt:
            '2026-10-07T15:10:00',
        },

        {
          id: 8,

          promotionNumber:
            'PRO-2026-008',

          employeeId: 4,
          employeeNumber:
            'EMP-004',

          employeeName:
            'Ana Garcia',

          department:
            'Operations',

          currentPosition:
            'Operations Staff',

          newPosition:
            'Operations Specialist',

          currentGrade:
            'G4',

          newGrade:
            'G5',

          currentSalary:
            29000,

          newSalary:
            33500,

          salaryIncrease:
            4500,

          increasePercentage:
            15.52,

          promotionType:
            'Position Promotion',

          recommendedBy:
            'Operations Manager',

          approvedBy:
            'Maria Santos',

          recommendationDate:
            '2026-10-02',

          effectiveDate:
            '2026-10-20',

          reason:
            'Promotion recommended after strong operational performance.',

          status:
            'Approved',

          createdAt:
            '2026-10-02T13:00:00',

          updatedAt:
            '2026-10-07T14:30:00',
        },

        {
          id: 9,

          promotionNumber:
            'PRO-2026-009',

          employeeId: 2,
          employeeNumber:
            'EMP-002',

          employeeName:
            'Maria Santos',

          department:
            'Human Resources',

          currentPosition:
            'HR Administrator',

          newPosition:
            'HR Manager',

          currentGrade:
            'G7',

          newGrade:
            'G8',

          currentSalary:
            52000,

          newSalary:
            62000,

          salaryIncrease:
            10000,

          increasePercentage:
            19.23,

          promotionType:
            'Leadership Promotion',

          recommendedBy:
            'General Manager',

          recommendationDate:
            '2026-10-05',

          effectiveDate:
            '2026-11-01',

          reason:
            'Proposed leadership promotion based on HR management responsibilities.',

          status:
            'Pending Approval',

          createdAt:
            '2026-10-05T10:15:00',

          updatedAt:
            '2026-10-07T16:00:00',
        },

        {
          id: 10,

          promotionNumber:
            'PRO-2026-010',

          employeeId: 3,
          employeeNumber:
            'EMP-003',

          employeeName:
            'Pedro Reyes',

          department:
            'Finance',

          currentPosition:
            'Finance Staff',

          newPosition:
            'Finance Officer',

          currentGrade:
            'G4',

          newGrade:
            'G5',

          currentSalary:
            30000,

          newSalary:
            35000,

          salaryIncrease:
            5000,

          increasePercentage:
            16.67,

          promotionType:
            'Salary Promotion',

          recommendedBy:
            'Finance Manager',

          recommendationDate:
            '2026-10-06',

          effectiveDate:
            '2026-11-10',

          reason:
            'Salary and grade advancement due to increased duties.',

          status:
            'For Review',

          createdAt:
            '2026-10-06T14:00:00',

          updatedAt:
            '2026-10-07T13:20:00',
        },
      ],
    )

  const search =
    ref('')

  const department =
    ref('')

  const promotionType =
    ref('')

  const status =
    ref('')

  const currentPage =
    ref(1)

  const perPage =
    ref(6)

  const departmentOptions =
    computed(() => {
      return [
        ...new Set(
          records.value.map(
            item =>
              item.department,
          ),
        ),
      ].sort()
    })

  const promotionTypeOptions:
    PromotionType[] = [
      'Position Promotion',
      'Grade Promotion',
      'Salary Promotion',
      'Leadership Promotion',
    ]

  const statusOptions:
    PromotionStatus[] = [
      'Draft',
      'For Review',
      'Pending Approval',
      'Approved',
      'Scheduled',
      'Effective',
      'Rejected',
      'Cancelled',
    ]

  const filteredRecords =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return records.value.filter(
        item => {
          const matchesSearch =
            !keyword ||
            item.promotionNumber
              .toLowerCase()
              .includes(keyword) ||
            item.employeeName
              .toLowerCase()
              .includes(keyword) ||
            item.employeeNumber
              .toLowerCase()
              .includes(keyword) ||
            item.currentPosition
              .toLowerCase()
              .includes(keyword) ||
            item.newPosition
              .toLowerCase()
              .includes(keyword)

          const matchesDepartment =
            !department.value ||
            item.department ===
              department.value

          const matchesType =
            !promotionType.value ||
            item.promotionType ===
              promotionType.value

          const matchesStatus =
            !status.value ||
            item.status ===
              status.value

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesType &&
            matchesStatus
          )
        },
      )
    })

  const stats =
    computed(() => {
      const data =
        records.value

      return {
        total:
          data.length,

        pending:
          data.filter(
            item =>
              item.status ===
                'For Review' ||
              item.status ===
                'Pending Approval',
          ).length,

        approved:
          data.filter(
            item =>
              item.status ===
                'Approved' ||
              item.status ===
                'Scheduled',
          ).length,

        effective:
          data.filter(
            item =>
              item.status ===
              'Effective',
          ).length,
      }
    })

  const totalPages =
    computed(() => {
      return Math.max(
        1,
        Math.ceil(
          filteredRecords
            .value.length /
            perPage.value,
        ),
      )
    })

  const paginatedRecords =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredRecords
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
        filteredRecords
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

        filteredRecords
          .value.length,
      )
    })

  const resetFilters = () => {
    search.value = ''
    department.value = ''
    promotionType.value = ''
    status.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      department,
      promotionType,
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
    records,

    search,
    department,
    promotionType,
    status,

    currentPage,

    filteredRecords,
    paginatedRecords,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    departmentOptions,
    promotionTypeOptions,
    statusOptions,

    resetFilters,
  }
}