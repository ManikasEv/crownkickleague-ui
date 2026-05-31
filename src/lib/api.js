export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  let body
  try {
    body = await response.json()
  } catch {
    body = null
  }

  return { response, body }
}
