<template>
  <div class="screen active" id="s-bands">

    <MatchmakingRadar
      v-if="showRadar"
      :message="radarMessage"
      :auto-stop="true"
      :duration="10000"
      @done="onRadarDone"
    />

    <template v-else>
      <div class="onboard-header">
        <div class="mini-logo"><i class="ti ti-music"></i></div>
        <span class="mini-brand">BandJam</span>
      </div>
      <h2 class="screen-title">Band</h2>
      <p class="screen-subtitle">Band yang sudah mengundangmu atau yang sedang kamu kelola.</p>
      <div class="scroll-body">
        <div v-if="loading" class="center-state">
          <div class="spinner"></div>
          <span>Memuat band...</span>
        </div>
        <div v-else-if="error" class="form-error">{{ error }}</div>
        <div v-else-if="bands.length === 0" class="center-state">
          <i class="ti ti-music" style="font-size:32px; color: var(--text-dim);"></i>
          <span>Belum ada band yang terhubung denganmu.</span>
          <span style="font-size:11px;">Band akan muncul di sini saat ada yang mengundangmu untuk jamming.</span>
        </div>
        <div v-for="band in bands" :key="band.id" class="band-card" @click="openChat(band)">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="band-card-title">{{ band.nama }}</div>
              <div class="band-card-sub">
                {{ Array.isArray(band.genre) ? band.genre.join(', ') : band.genre }} · {{ band.kota }}
                <span v-if="band.kecamatan">, {{ band.kecamatan }}</span>
              </div>
            </div>
            <span v-if="band.unread_count > 0" class="badge">{{ band.unread_count }}</span>
          </div>
          <div v-if="band.invited_role" style="margin-top:8px; font-size:11px; color: var(--red);">
            Diundang sebagai: {{ band.invited_role }}
          </div>
          <div v-if="band.rehersal_place" style="margin-top:6px; font-size:11px; color: var(--text-dim);">
            <i class="ti ti-map-pin"></i> {{ band.rehersal_place }}
          </div>
        </div>
      </div>
    </template>

    <BottomNav />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useBandsStore } from '../stores/bands'
import BottomNav from '../components/BottomNav.vue'
import MatchmakingRadar from '../components/MatchmakingRadar.vue'

const router = useRouter()
const auth = useAuthStore()
const store = useBandsStore()

const loading = ref(true)
const error = ref('')
const bands = ref([])
const showRadar = ref(false)
const radarMessage = ref('Sedang mencari band untukmu')
const radarShownOnce = ref(false)

const RADAR_KEY = 'bandjam_matchmaking_shown'

onMounted(async () => {
  const firstTime = !localStorage.getItem(RADAR_KEY)

  if (firstTime) {
    // First time after signup — show radar before fetching
    radarMessage.value = 'Sedang mencari band untukmu'
    showRadar.value = true
    localStorage.setItem(RADAR_KEY, '1')
    return
  }

  await fetchBands()
})

async function fetchBands() {
  loading.value = true
  error.value = ''
  try {
    await store.fetchBands()
    bands.value = store.bands

    // No match found — show radar again
    // if (bands.value.length === 0) {
    //   radarMessage.value = 'Mencari ulang band yang cocok untukmu'
    //   showRadar.value = true
    //   return
    // }
    if (bands.value.length === 0 && !radarShownOnce.value) {
      radarMessage.value = 'Mencari ulang band yang cocok untukmu'
      showRadar.value = true
      radarShownOnce.value = true
      return
    }

  } catch {
    error.value = store.error || 'Gagal memuat band.'
  } finally {
    loading.value = false
  }
}

async function onRadarDone() {
  showRadar.value = false
  await fetchBands()
}

function openChat(band) {
  router.push(`/chats/${band.id}`)
}
</script>