<script setup lang="ts">
import { computed } from 'vue'
import {
  ArrowLeft,
  Car,
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldCheck,
  Truck,
  UserRound,
} from 'lucide-vue-next'
import { driverInventory } from '../../../data/drivers'

const route = useRoute()
const router = useRouter()

const driverId = Number(route.params.id)
const driver = computed(() => driverInventory.find(item => item.id === driverId) ?? driverInventory[0])

const occupancyPercent = computed(() => {
  const currentDriver = driver.value
  if (!currentDriver?.capacity) return 0
  return Math.round((currentDriver.seatsUsed / currentDriver.capacity) * 100)
})
</script>

<template>
  <section class="driver-profile-page">
    <PageHeader
      title="Driver Profile"
      :description="`${driver?.name || 'Driver'} overview, inventory status, and assignment details.`"
    >
      <AppButton variant="secondary" :icon="ArrowLeft" @click="router.back()">
        Back
      </AppButton>
    </PageHeader>

    <div class="profile-layout">
      <div class="summary-card primary">
        <div class="avatar">{{ driver?.name?.charAt(0) || 'D' }}</div>
        <div>
          <span class="eyebrow">Driver</span>
          <h2>{{ driver?.name }}</h2>
          <p>{{ driver?.route }} · {{ driver?.status }}</p>
        </div>
      </div>

      <div class="mini-stat">
        <div class="mini-icon blue"><Truck :size="16" /></div>
        <div>
          <span>Vehicle</span>
          <strong>{{ driver?.vehicle }}</strong>
        </div>
      </div>

      <div class="mini-stat">
        <div class="mini-icon green"><CheckCircle2 :size="16" /></div>
        <div>
          <span>Seat Usage</span>
          <strong>{{ occupancyPercent }}%</strong>
        </div>
      </div>

      <div class="mini-stat">
        <div class="mini-icon orange"><Clock3 :size="16" /></div>
        <div>
          <span>Next Available</span>
          <strong>{{ driver?.nextAvailable }}</strong>
        </div>
      </div>
    </div>

    <div class="detail-grid">
      <div class="details-card">
        <div class="panel-header">
          <h3>Driver Details</h3>
        </div>

        <dl class="detail-list">
          <div><dt>Employee ID</dt><dd>#{{ driver?.employeeId || 'N/A' }}</dd></div>
          <div><dt>Driver Code</dt><dd>{{ driver?.driverCode || 'N/A' }}</dd></div>
          <div><dt>License No.</dt><dd>{{ driver?.licenseNo || 'N/A' }}</dd></div>
          <div><dt>Expiry Date</dt><dd>{{ driver?.expiryDate || 'N/A' }}</dd></div>
          <div><dt>Phone</dt><dd>{{ driver?.phone || 'N/A' }}</dd></div>
          <div><dt>Email</dt><dd>{{ driver?.email || 'N/A' }}</dd></div>
        </dl>
      </div>

      <div class="details-card">
        <div class="panel-header">
          <h3>Assignment</h3>
        </div>

        <div class="assignment-box">
          <div class="assignment-row"><UserRound :size="15" /><span>Route</span><strong>{{ driver?.route }}</strong></div>
          <div class="assignment-row"><Car :size="15" /><span>Vehicle</span><strong>{{ driver?.vehicle }}</strong></div>
          <div class="assignment-row"><MapPin :size="15" /><span>Last Location</span><strong>{{ driver?.lastLocation }}</strong></div>
          <div class="assignment-row"><ShieldCheck :size="15" /><span>Availability</span><strong>{{ driver?.availabilityWindow }}</strong></div>
          <div class="assignment-row"><Truck :size="15" /><span>Assigned Trip</span><strong>{{ driver?.assignedTrip }}</strong></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.driver-profile-page {
  width: 100%;
  max-width: 1660px;
  margin: 0 auto;
}

.profile-layout {
  display: grid;
  grid-template-columns: 1.7fr 1fr 1fr 1fr;
  gap: 14px;
  margin-bottom: 18px;
}

.summary-card,
.mini-stat,
.details-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
}

.summary-card.primary {
  background: linear-gradient(180deg, rgba(59,130,246,0.10), var(--bg-card));
}

.avatar {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--primary), #88b5ff);
  color: white;
  font-weight: 800;
}

.eyebrow {
  display: block;
  color: var(--text-secondary);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.summary-card h2 {
  margin: 4px 0;
  font-size: 22px;
}

.summary-card p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 11px;
}

.mini-stat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
}

.mini-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 10px;
}

.mini-icon.blue { background: rgba(59,130,246,0.12); color: var(--primary); }
.mini-icon.green { background: rgba(34,197,94,0.12); color: #34d399; }
.mini-icon.orange { background: rgba(245,158,11,0.12); color: #fbbf24; }

.mini-stat span {
  display: block;
  color: var(--text-secondary);
  font-size: 10px;
}

.mini-stat strong {
  display: block;
  margin-top: 4px;
  font-size: 16px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.panel-header {
  padding: 18px 18px 14px;
  border-bottom: 1px solid var(--border-soft);
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
}

.detail-list {
  margin: 0;
  padding: 18px;
  display: grid;
  gap: 12px;
}

.detail-list div {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-soft);
}

.detail-list dt {
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
}

.detail-list dd {
  margin: 0;
  font-size: 12px;
  text-align: right;
}

.assignment-box {
  padding: 18px;
  display: grid;
  gap: 12px;
}

.assignment-row {
  display: grid;
  grid-template-columns: 15px 110px 1fr;
  align-items: center;
  gap: 10px;
  color: var(--text-secondary);
  font-size: 11px;
}

.assignment-row strong {
  justify-self: end;
  text-align: right;
  color: var(--text-primary);
}

@media (max-width: 1080px) {
  .profile-layout {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 780px) {
  .detail-grid,
  .profile-layout {
    grid-template-columns: 1fr;
  }
}
</style>
