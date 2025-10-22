import React, { useCallback, useEffect, useMemo, useState } from "react"
import MapCanvas from "./components/MapCanvas"
import PinModal from "./components/PinModal"
import type { NewPin, Pin, UpdatePin } from "./types"
import * as api from "./api/client"

type Props = {
  userId?: number
  csrfToken?: string
  styleUrl?: string
}

export default function App({ userId, csrfToken, styleUrl = "/api/map/style" }: Props) {
  const [pins, setPins] = useState<Pin[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<null | { mode: "add"; lng: number; lat: number } | { mode: "edit"; pin: Pin }>(null)
  const [title, setTitle] = useState("")

  useEffect(() => {
    api.getPins().then(({ data }) => {
      const enriched = data.map((p) => ({ ...p, is_owner: userId != null && p.user_id === userId }))
      setPins(enriched)
    }).finally(() => setLoading(false))
  }, [userId])

  const onMapClick = useCallback((lng: number, lat: number) => {
    setTitle("")
    setModal({ mode: "add", lng, lat })
  }, [])

  const onEdit = useCallback((pin: Pin) => {
    setTitle(pin.title)
    setModal({ mode: "edit", pin })
  }, [])

  const onDelete = useCallback(async (pin: Pin) => {
    if (!confirm("Are you sure you want to delete this pin?")) return
    await api.deletePin(csrfToken, pin.id)
    setPins((prev) => prev.filter((p) => p.id !== pin.id))
    setModal(null)
  }, [csrfToken])

  const onSave = useCallback(async () => {
    if (!modal) return
    if (modal.mode === "add") {
      const payload: NewPin = { title, latitude: modal.lat, longitude: modal.lng }
      const { data } = await api.createPin(csrfToken, payload)
      const enriched = { ...data, is_owner: userId != null && data.user_id === userId }
      setPins((prev) => [...prev, enriched])
      setModal(null)
    } else {
      const changes: UpdatePin = { title }
      const { data } = await api.updatePin(csrfToken, modal.pin.id, changes)
      setPins((prev) => prev.map((p) => p.id === data.id ? { ...p, title: data.title } : p))
      setModal(null)
    }
  }, [modal, title, csrfToken, userId])

  const canDelete = useMemo(() => modal && modal.mode === "edit" && modal.pin.is_owner, [modal]) as boolean | undefined

  return (
    <div className="w-full h-[100vh]">
      {!loading && (
        <MapCanvas
          styleUrl={styleUrl}
          pins={pins}
          onMapClick={onMapClick}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
      {modal && (
        <PinModal
          title={title}
          setTitle={setTitle}
          mode={modal.mode}
          onCancel={() => setModal(null)}
          onSave={onSave}
          onDelete={modal.mode === "edit" ? () => onDelete(modal.pin) : undefined}
          canDelete={canDelete}
        />
      )}
    </div>
  )
}


