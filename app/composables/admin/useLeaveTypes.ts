import type {
  LeaveType,
  LeaveTypeCategory,
  LeaveTypeStatus,
} from '~/types/leaveType'

export const useLeaveTypes = () => {
  /* =========================================================
     MOCK DATA
  ========================================================= */

  const leaveTypes =
    useState<LeaveType[]>(
      'leave-types',
      () => [
        {
          id: 1,

          code: 'VL',

          name:
            'Vacation Leave',

          category:
            'Company Leave',

          description:
            'Leave credits used for personal vacation, planned rest or personal appointments.',

          defaultCredits: 15,

          creditUnit:
            'Days',

          isPaid: true,

          requiresApproval: true,

          carryOverAllowed: true,

          maxCarryOver: 5,

          minimumDays: 1,

          maximumDays: 10,

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-01-05T09:00:00',

          updatedAt:
            '2026-09-20T10:30:00',
        },

        {
          id: 2,

          code: 'SL',

          name:
            'Sick Leave',

          category:
            'Company Leave',

          description:
            'Leave credits intended for employee illness, medical recovery or health-related absence.',

          defaultCredits: 15,

          creditUnit:
            'Days',

          isPaid: true,

          requiresApproval: true,

          carryOverAllowed: true,

          maxCarryOver: 5,

          minimumDays: 1,

          maximumDays: 15,

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-01-05T09:10:00',

          updatedAt:
            '2026-09-20T10:35:00',
        },

        {
          id: 3,

          code: 'EL',

          name:
            'Emergency Leave',

          category:
            'Company Leave',

          description:
            'Leave used for urgent or unexpected personal and family emergencies.',

          defaultCredits: 5,

          creditUnit:
            'Days',

          isPaid: true,

          requiresApproval: true,

          carryOverAllowed: false,

          maxCarryOver: 0,

          minimumDays: 1,

          maximumDays: 3,

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-01-05T09:20:00',

          updatedAt:
            '2026-09-18T14:10:00',
        },

        {
          id: 4,

          code: 'ML',

          name:
            'Maternity Leave',

          category:
            'Statutory Leave',

          description:
            'Leave category for qualified employees taking maternity-related leave.',

          defaultCredits: 0,

          creditUnit:
            'Days',

          isPaid: true,

          requiresApproval: true,

          carryOverAllowed: false,

          maxCarryOver: 0,

          minimumDays: 1,

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-01-05T09:30:00',

          updatedAt:
            '2026-08-15T09:45:00',
        },

        {
          id: 5,

          code: 'PL',

          name:
            'Paternity Leave',

          category:
            'Statutory Leave',

          description:
            'Leave category for qualified employees taking paternity-related leave.',

          defaultCredits: 0,

          creditUnit:
            'Days',

          isPaid: true,

          requiresApproval: true,

          carryOverAllowed: false,

          maxCarryOver: 0,

          minimumDays: 1,

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-01-05T09:40:00',

          updatedAt:
            '2026-08-15T09:50:00',
        },

        {
          id: 6,

          code: 'BL',

          name:
            'Bereavement Leave',

          category:
            'Special Leave',

          description:
            'Leave granted when an employee experiences the death of an immediate family member.',

          defaultCredits: 3,

          creditUnit:
            'Days',

          isPaid: true,

          requiresApproval: true,

          carryOverAllowed: false,

          maxCarryOver: 0,

          minimumDays: 1,

          maximumDays: 3,

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-02-01T10:00:00',

          updatedAt:
            '2026-09-01T11:00:00',
        },

        {
          id: 7,

          code: 'SPL',

          name:
            'Special Leave',

          category:
            'Special Leave',

          description:
            'Company-approved leave for special circumstances subject to HR validation.',

          defaultCredits: 3,

          creditUnit:
            'Days',

          isPaid: true,

          requiresApproval: true,

          carryOverAllowed: false,

          maxCarryOver: 0,

          minimumDays: 1,

          maximumDays: 3,

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-02-10T13:30:00',

          updatedAt:
            '2026-09-01T11:15:00',
        },

        {
          id: 8,

          code: 'UL',

          name:
            'Unpaid Leave',

          category:
            'Company Leave',

          description:
            'Leave without pay for approved absences when paid leave credits are unavailable or not applicable.',

          defaultCredits: 0,

          creditUnit:
            'Days',

          isPaid: false,

          requiresApproval: true,

          carryOverAllowed: false,

          maxCarryOver: 0,

          minimumDays: 1,

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-03-01T08:30:00',

          updatedAt:
            '2026-09-03T10:20:00',
        },

        {
          id: 9,

          code: 'OLD-SL',

          name:
            'Legacy Special Leave',

          category:
            'Special Leave',

          description:
            'Previous special leave type retained for historical leave records.',

          defaultCredits: 2,

          creditUnit:
            'Days',

          isPaid: true,

          requiresApproval: true,

          carryOverAllowed: false,

          maxCarryOver: 0,

          minimumDays: 1,

          maximumDays: 2,

          status:
            'Inactive',

          createdBy:
            'Maria Santos',

          createdAt:
            '2025-01-01T08:00:00',

          updatedAt:
            '2026-01-01T08:00:00',
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

  const payStatus =
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
     OPTIONS
  ========================================================= */

  const categoryOptions:
    LeaveTypeCategory[] = [
      'Company Leave',
      'Statutory Leave',
      'Special Leave',
    ]

  const payStatusOptions = [
    'Paid',
    'Unpaid',
  ]

  const statusOptions:
    LeaveTypeStatus[] = [
      'Active',
      'Inactive',
    ]

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredLeaveTypes =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return leaveTypes.value.filter(
        item => {
          const matchesSearch =
            !keyword ||
            item.code
              .toLowerCase()
              .includes(keyword) ||
            item.name
              .toLowerCase()
              .includes(keyword) ||
            item.description
              .toLowerCase()
              .includes(keyword)

          const matchesCategory =
            !category.value ||
            item.category ===
              category.value

          const matchesPayStatus =
            !payStatus.value ||
            (
              payStatus.value ===
                'Paid' &&
              item.isPaid
            ) ||
            (
              payStatus.value ===
                'Unpaid' &&
              !item.isPaid
            )

          const matchesStatus =
            !status.value ||
            item.status ===
              status.value

          return (
            matchesSearch &&
            matchesCategory &&
            matchesPayStatus &&
            matchesStatus
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
        filteredLeaveTypes.value

      return {
        totalTypes:
          data.length,

        activeTypes:
          data.filter(
            item =>
              item.status ===
              'Active',
          ).length,

        paidTypes:
          data.filter(
            item =>
              item.isPaid &&
              item.status ===
                'Active',
          ).length,

        inactiveTypes:
          data.filter(
            item =>
              item.status ===
              'Inactive',
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
          filteredLeaveTypes
            .value.length /
            perPage.value,
        ),
      )
    })

  const paginatedLeaveTypes =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredLeaveTypes
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
        filteredLeaveTypes
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

        filteredLeaveTypes
          .value.length,
      )
    })

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value = ''
    category.value = ''
    payStatus.value = ''
    status.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      category,
      payStatus,
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
    leaveTypes,

    search,
    category,
    payStatus,
    status,

    currentPage,

    filteredLeaveTypes,
    paginatedLeaveTypes,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    categoryOptions,
    payStatusOptions,
    statusOptions,

    resetFilters,
  }
}