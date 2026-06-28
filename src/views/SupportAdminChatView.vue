<template>
  <div class="screen active" id="s-support-admin-chat">
    <!-- Header -->
    <div class="onboard-header">
      <button class="btn-ghost" style="padding:8px 10px; border:none;" @click="$router.push('/chats')">
        <i class="ti ti-arrow-left"></i>
      </button>
      <div class="mini-logo"><i class="ti ti-music"></i></div>
      <span class="mini-brand">{{ topicLabel(conversation?.topic) }}</span>
    </div>

    <!-- User info banner -->
    <div v-if="conversation" style="padding: 4px 20px 8px; flex-shrink:0;">
      <span style="font-size:11px; color: var(--text-dim);">
        {{ conversation.user_nama || conversation.user_email }}
      </span>
    </div>

    <div class="scroll-body" ref="scrollEl">
      <div v-if="loading" class="center-state">
        <div class="spinner"></div>
        <span>Memuat percakapan...</span>
      </div>

      <div v-else-if="error" class="form-error">{{ error }}</div>

      <div v-else-if="!conversation?.messages?.length" class="center-state">
        <i class="ti ti-message-circle" style="font-size:32px; color: var(--text-dim);"></i>
        <span>Belum ada pesan.</span>
      </div>

      <div
        v-for="msg in conversation?.messages"
        :key="msg.id"
        class="msg-row"
        :class="{ mine: !msg.from_user }"
      >
        <div class="msg-bubble">
          <div v-if="msg.from_user" style="font-size:10px; color: var(--text-dim); margin-bottom:3px;">
            {{ conversation.user_nama || conversation.user_email }}
          </div>
          {{ msg.text }}
          <div class="msg-time">{{ formatTime(msg.created_at) }}</div>
        </div>
      </div>
    </div>

    <!-- Chat input — always available for superadmin -->
    <div
      v-if="!loading"
      style="display:flex; gap:8px; padding: 0 20px 16px; flex-shrink:0;"
    >
      <input
        v-model="draft"
        type="text"
        placeholder="Tulis pesan..."
        @keyup.enter="send"
      >
      <button
        class="btn-primary"
        style="width:auto; padding: 12px 18px;"
        :disabled="sending || !draft.trim()"
        @click="send"
      >
        <i class="ti ti-send"></i>
      </button>
    </div>

    <BottomNav />
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { supportApi } from '../api/support'
import BottomNav from '../components/BottomNav.vue'

const route = useRoute()
const convId = route.params.convId

const loading = ref(true)
const sending = ref(false)
const error = ref('')
const draft = ref('')
const conversation = ref(null)
const scrollEl = ref(null)

const TOPIC_LABELS = {
  investor: 'Be our investor',
  donate: 'Donate',
  join_team: 'Join our team',
  add_studio: 'Add studio to our database',
  additional_player: 'Be our additional player',
}

function topicLabel(topic) {
  return TOPIC_LABELS[topic] || topic
}

function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  try {
    const { data } = await supportApi.get(convId)
    conversation.value = data
    await scrollToBottom()
  } catch {
    error.value = 'Gagal memuat percakapan.'
  } finally {
    loading.value = false
  }
})

async function scrollToBottom() {
  await nextTick()
  if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight
}

async function send() {
  const text = draft.value.trim()
  if (!text) return
  sending.value = true
  try {
    const { data } = await supportApi.send(convId, text)
    conversation.value = data
    draft.value = ''
    await scrollToBottom()
  } catch {
    error.value = 'Gagal mengirim pesan.'
  } finally {
    sending.value = false
  }
}
</script>