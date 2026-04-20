const BASE = import.meta.env.VITE_API_URL || ''

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
