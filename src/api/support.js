import http from './http'

export const supportApi = {
  start(topic) {
    return http.post('/api/conversations/support/start/', { topic })
  },
  get(convId) {
    return http.get(`/api/conversations/support/${convId}/`)
  },
  send(convId, text) {
    return http.post(`/api/conversations/support/${convId}/`, { text })
  },
  list() {
    return http.get('/api/conversations/support/')
  },
  listUser() {
    return http.get('/api/conversations/support/mine/')
  },
}