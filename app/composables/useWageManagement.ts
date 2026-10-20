import type {
  CompensationHistoryRecord,
  WageAdjustmentRecord,
  WageComplianceRecord,
  WageOrder,
} from '~/types/wageManagement'

export const useWageManagement = () => {

  const wageOrders =
    useState<WageOrder[]>(
      'wage-management-orders',
      () => [
        {
          id: 1,
          code: 'NCR-WO-2026-01',
          title: 'NCR Minimum Wage Adjustment',
          region: 'NCR',
          classification: 'Non-Agriculture',
          oldMinimumRate: 700,
          newMinimumRate: 750,
          increaseAmount: 50,
          effectiveDate: '2026-07-25',
          tranche: 'Tranche 1',
          source: 'DOLE / RTWPB',
          status: 'Active',
        },
        {
          id: 2,
          code: 'NCR-WO-2026-01-T2',
          title: 'NCR Minimum Wage Adjustment',
          region: 'NCR',
          classification: 'Non-Agriculture',
          oldMinimumRate: 750,
          newMinimumRate: 780,
          increaseAmount: 30,
          effectiveDate: '2027-01-01',
          tranche: 'Tranche 2',
          source: 'DOLE / RTWPB',
          status: 'Scheduled',
        },
        {
          id: 3,
          code: 'R4A-WO-2026-01',
          title: 'CALABARZON Wage Adjustment',
          region: 'Region IV-A',
          classification: 'Non-Agriculture',
          oldMinimumRate: 560,
          newMinimumRate: 600,
          increaseAmount: 40,
          effectiveDate: '2026-08-01',
          tranche: 'Single Tranche',
          source: 'DOLE / RTWPB',
          status: 'Active',
        },
        {
          id: 4,
          code: 'R3-WO-2026-01',
          title: 'Central Luzon Wage Adjustment',
          region: 'Region III',
          classification: 'Non-Agriculture',
          oldMinimumRate: 520,
          newMinimumRate: 560,
          increaseAmount: 40,
          effectiveDate: '2026-09-01',
          tranche: 'Single Tranche',
          source: 'DOLE / RTWPB',
          status: 'Active',
        },
      ],
    )

  /* =========================================================
     WAGE ADJUSTMENTS
  ========================================================= */

  const wageAdjustments =
    useState<WageAdjustmentRecord[]>(
      'wage-management-adjustments',
      () => [
        {
          id: 1,

          employeeId: 1,
          employeeNumber: 'EMP-001',
          employeeName: 'Juan Dela Cruz',

          department: 'Operations',
          position: 'Driver',
          region: 'NCR',

          currentRate: 720,
          newMinimumRate: 750,

          requiredIncrease: 30,
          proposedRate: 750,

          result: 'Required',

          distortionRisk: false,

          wageOrderCode: 'NCR-WO-2026-01',
          effectiveDate: '2026-07-25',

          status: 'Pending Approval',
        },
        {
          id: 2,

          employeeId: 3,
          employeeNumber: 'EMP-003',
          employeeName: 'Pedro Reyes',

          department: 'Finance',
          position: 'Finance Staff',
          region: 'NCR',

          currentRate: 750,
          newMinimumRate: 750,

          requiredIncrease: 0,
          proposedRate: 750,

          result: 'Compliant',

          distortionRisk: false,

          wageOrderCode: 'NCR-WO-2026-01',
          effectiveDate: '2026-07-25',

          status: 'Effective',
        },
        {
          id: 3,

          employeeId: 4,
          employeeNumber: 'EMP-004',
          employeeName: 'Ana Garcia',

          department: 'Operations',
          position: 'Operations Staff',
          region: 'NCR',

          currentRate: 730,
          newMinimumRate: 750,

          requiredIncrease: 20,
          proposedRate: 750,

          result: 'Required',

          distortionRisk: false,

          wageOrderCode: 'NCR-WO-2026-01',
          effectiveDate: '2026-07-25',

          status: 'Approved',
        },
        {
        id: 4,

        employeeId: 6,
        employeeNumber: 'EMP-006',
        employeeName: 'Angela Flores',

        department: 'Finance',
        position: 'Finance Officer',
        region: 'NCR',

        currentRate: 740,
        newMinimumRate: 750,

        requiredIncrease: 10,
        proposedRate: 750,

        result: 'Required',

        distortionRisk: false,

        wageOrderCode: 'NCR-WO-2026-01',
        effectiveDate: '2026-07-25',

        status: 'For Review',
      },
        {
          id: 5,

          employeeId: 7,
          employeeNumber: 'EMP-007',
          employeeName: 'Mark Lopez',

          department: 'Information Technology',
          position: 'IT Support',
          region: 'NCR',

          currentRate: 900,
          newMinimumRate: 750,

          requiredIncrease: 0,
          proposedRate: 900,

          result: 'Compliant',

          distortionRisk: false,

          wageOrderCode: 'NCR-WO-2026-01',
          effectiveDate: '2026-07-25',

          status: 'Effective',
        },
        {
          id: 6,

          employeeId: 8,
          employeeNumber: 'EMP-008',
          employeeName: 'Jenny Ramos',

          department: 'Human Resources',
          position: 'Senior HR Staff',
          region: 'NCR',

          currentRate: 755,
          newMinimumRate: 750,

          requiredIncrease: 0,
          proposedRate: 755,

          result: 'Distortion Review',

          distortionRisk: true,

          wageOrderCode: 'NCR-WO-2026-01',
          effectiveDate: '2026-07-25',

          status: 'For Review',
        },
        {
          id: 7,

          employeeId: 11,
          employeeNumber: 'EMP-011',
          employeeName: 'Leo Martinez',

          department: 'Operations',
          position: 'Driver',
          region: 'NCR',

          currentRate: 700,
          newMinimumRate: 750,

          requiredIncrease: 50,
          proposedRate: 750,

          result: 'Required',

          distortionRisk: false,

          wageOrderCode: 'NCR-WO-2026-01',
          effectiveDate: '2026-07-25',

          status: 'Scheduled',
        },
        {
          id: 8,

          employeeId: 12,
          employeeNumber: 'EMP-012',
          employeeName: 'Claire Villanueva',

          department: 'Operations',
          position: 'Operations Coordinator',
          region: 'NCR',

          currentRate: 980,
          newMinimumRate: 750,

          requiredIncrease: 0,
          proposedRate: 980,

          result: 'Compliant',

          distortionRisk: false,

          wageOrderCode: 'NCR-WO-2026-01',
          effectiveDate: '2026-07-25',

          status: 'Effective',
        },
      ],
    )

  /* =========================================================
     COMPENSATION HISTORY
  ========================================================= */

  const compensationHistory =
    useState<CompensationHistoryRecord[]>(
      'employee-compensation-history',
      () => [
        {
          id: 1,

          employeeId: 1,
          employeeNumber: 'EMP-001',
          employeeName: 'Juan Dela Cruz',

          oldRate: 680,
          newRate: 700,

          salaryType: 'Daily',

          reason: 'Annual Increase',

          effectiveDate: '2025-01-01',

          approvedBy: 'HR Manager',
        },
        {
          id: 2,

          employeeId: 1,
          employeeNumber: 'EMP-001',
          employeeName: 'Juan Dela Cruz',

          oldRate: 700,
          newRate: 720,

          salaryType: 'Daily',

          reason: 'Merit Increase',

          effectiveDate: '2026-01-01',

          approvedBy: 'General Manager',
        },
        {
          id: 3,

          employeeId: 1,
          employeeNumber: 'EMP-001',
          employeeName: 'Juan Dela Cruz',

          oldRate: 720,
          newRate: 750,

          salaryType: 'Daily',

          reason: 'Government Wage Order',

          effectiveDate: '2026-07-25',

          wageOrderCode: 'NCR-WO-2026-01',

          approvedBy: 'HR Manager',

          remarks:
            'Minimum wage compliance adjustment.',
        },
        {
          id: 4,

          employeeId: 3,
          employeeNumber: 'EMP-003',
          employeeName: 'Pedro Reyes',

          oldRate: 680,
          newRate: 710,

          salaryType: 'Daily',

          reason: 'Regularization',

          effectiveDate: '2025-09-16',

          approvedBy: 'Finance Manager',
        },
        {
          id: 5,

          employeeId: 3,
          employeeNumber: 'EMP-003',
          employeeName: 'Pedro Reyes',

          oldRate: 710,
          newRate: 750,

          salaryType: 'Daily',

          reason: 'Government Wage Order',

          effectiveDate: '2026-07-25',

          wageOrderCode: 'NCR-WO-2026-01',

          approvedBy: 'HR Manager',
        },
        {
          id: 6,

          employeeId: 8,
          employeeNumber: 'EMP-008',
          employeeName: 'Jenny Ramos',

          oldRate: 700,
          newRate: 755,

          salaryType: 'Daily',

          reason: 'Promotion',

          effectiveDate: '2026-01-01',

          approvedBy: 'General Manager',
        },
      ],
    )

  /* =========================================================
     COMPLIANCE
  ========================================================= */

  const complianceRecords =
    computed<WageComplianceRecord[]>(
      () => {
        return wageAdjustments.value.map(
          item => {
            let status:
              WageComplianceRecord['status']

            if (
              item.distortionRisk
            ) {
              status =
                'Distortion Review'
            } else if (
              item.currentRate <
              item.newMinimumRate
            ) {
              status =
                item.status ===
                  'Effective'
                  ? 'Compliant'
                  : 'Pending Adjustment'
            } else {
              status =
                'Compliant'
            }

            return {
              id: item.id,

              employeeId:
                item.employeeId,

              employeeNumber:
                item.employeeNumber,

              employeeName:
                item.employeeName,

              department:
                item.department,

              position:
                item.position,

              region:
                item.region,

              currentRate:
                item.currentRate,

              requiredMinimum:
                item.newMinimumRate,

              variance:
                item.currentRate -
                item.newMinimumRate,

              wageOrderCode:
                item.wageOrderCode,

              distortionRisk:
                item.distortionRisk,

              status,
            }
          },
        )
      },
    )

  const activeWageOrder =
    computed(() => {
      return (
        wageOrders.value.find(
          item =>
            item.status ===
              'Active' &&
            item.region === 'NCR',
        ) || null
      )
    })

  const getCompensationHistory =
    (
      employeeId:
        string | number,
    ) => {
      return compensationHistory.value
        .filter(
          item =>
            String(
              item.employeeId,
            ) ===
            String(employeeId),
        )
        .sort(
          (
            a,
            b,
          ) =>
            new Date(
              b.effectiveDate,
            ).getTime() -
            new Date(
              a.effectiveDate,
            ).getTime(),
        )
    }

  return {
    wageOrders,
    wageAdjustments,
    compensationHistory,
    complianceRecords,
    activeWageOrder,

    getCompensationHistory,
  }
}