
<script setup lang="ts">
import { UsersRound, Wallet, AlertTriangle, CircleX } from 'lucide-vue-next'
import type { LeaveBalanceStats } from '~/types/leaveBalance'

defineProps<{ stats: LeaveBalanceStats }>()

const format = (value: number) =>
  Number(value.toFixed(2)).toLocaleString()
</script>

<template>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon blue"><UsersRound :size="19" /></div>
      <div>
        <strong>{{ stats.employeesWithCredits }}</strong>
        <p>Employees with Leave Credits</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon green"><Wallet :size="19" /></div>
      <div>
        <strong>{{ format(stats.remainingCredits) }}</strong>
        <p>Combined Remaining Leave Credits</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon orange"><AlertTriangle :size="19" /></div>
      <div>
        <strong>{{ stats.lowBalance }}</strong>
        <p>Employees Running Low on Credits</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon purple"><CircleX :size="19" /></div>
      <div>
        <strong>{{ stats.noCredits }}</strong>
        <p>Employees with No Recorded Credits Left</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:15px}
.stat-card{display:flex;align-items:center;gap:14px;min-height:94px;padding:17px;border:1px solid var(--border,#29364b);border-radius:12px;background:var(--bg-card,#141e2d)}
.stat-icon{width:42px;height:42px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border-radius:10px}
.blue{background:#172e57;color:#3b82f6}
.green{background:#103b2d;color:#10b981}
.orange{background:#483416;color:#f59e0b}
.purple{background:#302052;color:#a78bfa}
.stat-card strong{display:block;color:var(--text-primary,#fff);font-size:22px;font-weight:700;line-height:1.2}
.stat-card p{margin:5px 0 0;color:var(--text-muted,#94a3b8);font-size:10px}
@media(max-width:1100px){.stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:600px){.stats-grid{grid-template-columns:1fr}}
</style>
