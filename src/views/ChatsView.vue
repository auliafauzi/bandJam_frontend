<template>
  <div class="screen active" id="s-chats">

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
      <h2 class="screen-title">Chats</h2>
      <p class="screen-subtitle">
        {{ isAdmin ? 'Kelola percakapan semua band.' : 'Percakapan dengan band-band yang mengundangmu.' }}
      </p>

      <div class="scroll-body">
        <div v-if="loading" class="center-state">
          <div class="spinner"></div>
          <span>Memuat chat...</span>
        </div>

        <div v-else-if="error" class="form-error">{{ error }}</div>

        <template v-else-if="isAdmin">
          ...
        </template>

        <template v-else>
          ...
        </template>
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

const isAdmin = computed(() => auth.user?.is_superuser)
const loading = ref(true)
const error = ref('')
const bands = ref([])
const showRadar = ref(false)
const radarMessage = ref('Sedang mencari band untukmu')
const radarShownOnce = ref(false)

const RADAR_KEY = 'bandjam_matchmaking_shown'

onMounted(async () => {
  if (isAdmin.value) {
    await fetchBands()
    return
  }

  const firstTime = !localStorage.getItem(RADAR_KEY)
  if (firstTime) {
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
    if (isAdmin.value) {
      bands.value = store.bands
    } else {
      bands.value = store.bands.filter((b) => b.conversation_id)

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
    }
  } catch {
    error.value = store.error || 'Gagal memuat chat.'
  } finally {
    loading.value = false
  }
}

async function onRadarDone() {
  showRadar.value = false
  await fetchBands()
}

function statusLabel(status) {
  const labels = {
    pending: 'Menunggu',
    accepted: 'Tertarik',
    declined: 'Tidak tertarik',
    negotiating: 'Diskusi',
  }
  return labels[status] || status
}

function statusStyle(status) {
  const colors = {
    pending: 'color: var(--text-dim)',
    accepted: 'color: #5fe0a3',
    declined: 'color: var(--red)',
    negotiating: 'color: #e0a35f',
  }
  return colors[status] || ''
}

function openChat(band) {
  router.push(`/chats/${band.id}`)
}

function openAdminChat(band, conv) {
  router.push(`/chats/${band.id}/${conv.id}`)
}
</script>