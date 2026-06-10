const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

export async function apiGet<T>(
  path: string,
  token: string,
): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    let message = `API request failed with status ${response.status}`

    try {
      const body = (await response.json()) as { message?: string }
      message = body.message ?? message
    } catch {
      // Keep the generic status message if the response is not JSON.
    }

    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export async function apiPost<T>(
  path: string,
  token: string,
  payload: unknown,
): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let message = `API request failed with status ${response.status}`

    try {
      const body = (await response.json()) as { message?: string }
      message = body.message ?? message
    } catch {
      // Keep the generic status message if the response is not JSON.
    }

    throw new Error(message)
  }

  return response.json() as Promise<T>
}
