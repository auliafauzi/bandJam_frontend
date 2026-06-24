import http from './http'

export const optionsApi = {
  genres() {
    return http.get('/api/bands/genres/')
  },
  instruments() {
    return http.get('/api/bands/instruments/')
  },
}