<script setup lang="ts">
import { Building2, UserRound, Users, BriefcaseBusiness } from 'lucide-vue-next'
import type { Department } from '~/types/department'

defineProps<{
  departments: Department[]
  getEmployeeCount: (department: string) => number
  getPositionCount: (department: string) => number
}>()
const emit = defineEmits<{ (e: 'edit', item: Department): void }>()
</script>

<template>
  <div class="department-table-card">
    <div class="table-heading"><h3>Department Directory</h3><p>Manage organizational departments, department heads and workforce assignments.</p></div>
    <div v-if="departments.length" class="table-scroll">
      <table class="department-table">
        <thead><tr><th>Department</th><th>Code</th><th>Department Head</th><th>Employees</th><th>Positions</th><th>Status</th><th class="action-column" /></tr></thead>
        <tbody>
          <tr v-for="department in departments" :key="department.id">
            <td><div class="department-cell"><div class="department-icon"><Building2 :size="17" /></div><div class="department-info"><strong>{{ department.name }}</strong><span>{{ department.description || 'No description provided' }}</span></div></div></td>
            <td><span class="department-code">{{ department.code }}</span></td>
            <td><div v-if="department.head" class="head-cell"><UserRound :size="14" /><span>{{ department.head }}</span></div><span v-else class="not-assigned">Not assigned</span></td>
            <td><div class="count-cell"><Users :size="14" /><strong>{{ getEmployeeCount(department.name) }}</strong></div></td>
            <td><div class="count-cell"><BriefcaseBusiness :size="14" /><strong>{{ getPositionCount(department.name) }}</strong></div></td>
            <td><StatusBadge :status="department.status" /></td>
            <td class="action-column"><DepartmentActions :department="department" :employee-count="getEmployeeCount(department.name)" :position-count="getPositionCount(department.name)" @edit="emit('edit', $event)" /></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="empty-state"><div class="empty-icon"><Building2 :size="24" /></div><strong>No departments found</strong><p>Try changing the search or status filter.</p></div>
  </div>
</template>

<style scoped>
.department-table-card{position:relative;border:1px solid var(--border);border-radius:11px;background:var(--bg-card);box-shadow:var(--shadow)}.table-heading{padding:15px 17px;border-bottom:1px solid var(--border-soft)}.table-heading h3{margin:0;color:var(--text-primary);font-size:13px;font-weight:700}.table-heading p{margin:4px 0 0;color:var(--text-muted);font-size:9px}.table-scroll{overflow-x:auto}.department-table{width:100%;min-width:1000px;border-collapse:collapse}.department-table th{padding:11px 14px;border-bottom:1px solid var(--border);background:var(--bg-card-soft);color:var(--text-secondary);font-size:9px;font-weight:650;text-align:left;text-transform:uppercase;letter-spacing:.35px}.department-table td{padding:12px 14px;border-bottom:1px solid var(--border-soft);color:var(--text-secondary);font-size:10px}.department-table tbody tr:last-child td{border-bottom:0}.department-table tbody tr:hover{background:var(--bg-card-soft)}.department-cell{display:flex;align-items:center;gap:10px}.department-icon{display:flex;width:36px;height:36px;flex-shrink:0;align-items:center;justify-content:center;border-radius:9px;background:var(--primary-soft);color:var(--primary)}.department-info{min-width:0}.department-info strong,.department-info span{display:block}.department-info strong{color:var(--text-primary);font-size:10px;font-weight:650}.department-info span{overflow:hidden;max-width:290px;margin-top:3px;color:var(--text-muted);font-size:8px;white-space:nowrap;text-overflow:ellipsis}.department-code{color:var(--primary);font-weight:650}.head-cell{display:flex;align-items:center;gap:6px;color:var(--text-primary)}.not-assigned{color:var(--orange);font-size:9px;font-weight:600}.count-cell{display:inline-flex;align-items:center;gap:6px;color:var(--text-secondary)}.count-cell strong{color:var(--text-primary)}.action-column{width:45px;text-align:right!important}.empty-state{display:flex;min-height:260px;flex-direction:column;align-items:center;justify-content:center;padding:30px;text-align:center}.empty-icon{display:flex;width:48px;height:48px;align-items:center;justify-content:center;margin-bottom:12px;border-radius:12px;background:var(--primary-soft);color:var(--primary)}.empty-state strong{color:var(--text-primary);font-size:13px}.empty-state p{margin:5px 0 0;color:var(--text-muted);font-size:10px}
</style>
