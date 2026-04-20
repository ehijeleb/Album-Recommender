const BASE = import.meta.env.VITE_API_URL || ''
export const BACKEND = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001'

export default BASE

export function authFetch(url, options = {}) {
  const token = localStorage.getItem('spotify_token')
  return fetch(`${BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
}
