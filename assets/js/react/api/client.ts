import type { NewPin, Pin, UpdatePin } from "../types"

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export function getPins(): Promise<{ data: Pin[] }> {
  return jsonFetch("/api/pins")
}

export function createPin(csrf: string | undefined, pin: NewPin): Promise<{ data: Pin }> {
  return jsonFetch("/api/pins", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "x-csrf-token": csrf } : {}),
    },
    body: JSON.stringify({ pin }),
    credentials: "same-origin",
  })
}

export function updatePin(csrf: string | undefined, id: number, changes: UpdatePin): Promise<{ data: Pin }> {
  return jsonFetch(`/api/pins/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "x-csrf-token": csrf } : {}),
    },
    body: JSON.stringify({ pin: changes }),
    credentials: "same-origin",
  })
}

export async function deletePin(csrf: string | undefined, id: number): Promise<void> {
  await jsonFetch(`/api/pins/${id}`, {
    method: "DELETE",
    headers: {
      ...(csrf ? { "x-csrf-token": csrf } : {}),
    },
    credentials: "same-origin",
  })
}


