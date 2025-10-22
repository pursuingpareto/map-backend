import React, { useEffect, useRef } from "react"
import maplibregl, { Map as MLMap, Marker, Popup } from "maplibre-gl"
import type { Pin } from "../types"

type Props = {
  styleUrl: string
  pins: Pin[]
  onMapClick: (lng: number, lat: number) => void
  onEdit: (pin: Pin) => void
  onDelete: (pin: Pin) => void
}

export default function MapCanvas({ styleUrl, pins, onMapClick, onEdit, onDelete }: Props) {
  const mapRef = useRef<MLMap | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const markersRef = useRef<Map<number, Marker>>(new Map())

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current) return
    let isMounted = true

    const init = async () => {
      const style = await fetch(styleUrl).then((r) => r.json())
      if (!isMounted) return
      const map = new maplibregl.Map({ container: containerRef.current!, style })
      mapRef.current = map
      map.on("click", (e) => {
        const el = e.originalEvent?.target as HTMLElement | undefined
        // ignore clicks on markers
        let cur: HTMLElement | null | undefined = el
        while (cur) {
          if (cur.classList?.contains("maplibregl-marker")) return
          cur = cur.parentElement
        }
        onMapClick(e.lngLat.lng, e.lngLat.lat)
      })
    }
    init()

    return () => {
      isMounted = false
      mapRef.current?.remove()
      mapRef.current = null
      markersRef.current.forEach((m) => m.remove())
      markersRef.current.clear()
    }
  }, [styleUrl, onMapClick])

  // Sync markers with pins
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const known = markersRef.current
    const nextIds = new Set(pins.map((p) => p.id))

    // remove stale
    for (const [id, marker] of known) {
      if (!nextIds.has(id)) {
        marker.remove()
        known.delete(id)
      }
    }

    // add/update
    pins.forEach((pin) => {
      let marker = known.get(pin.id)
      const popupHtml = `
        <div>
          <h3>${pin.title}</h3>
          ${pin.is_owner ? `<div style="margin-top: 0.5em;">
            <button id="edit-pin-${pin.id}" style="margin-right: 0.5em; padding: 0.3em 0.6em; background: #38a169; color: white; border: none; border-radius: 4px;">Edit</button>
            <button id="delete-pin-${pin.id}" style="padding: 0.3em 0.6em; background: #e53e3e; color: white; border: none; border-radius: 4px;">Delete</button>
          </div>` : ""}
        </div>`
      if (!marker) {
        const popup = new Popup().setHTML(popupHtml)
        marker = new Marker().setLngLat([pin.longitude, pin.latitude]).setPopup(popup).addTo(map)
        known.set(pin.id, marker)
        popup.on("open", () => {
          const editBtn = document.getElementById(`edit-pin-${pin.id}`)
          const delBtn = document.getElementById(`delete-pin-${pin.id}`)
          if (editBtn) editBtn.onclick = (e) => { e.stopPropagation(); onEdit(pin) }
          if (delBtn) delBtn.onclick = (e) => { e.stopPropagation(); onDelete(pin) }
        })
      } else {
        // update popup if title changed
        const popup = marker.getPopup()
        popup?.setHTML(popupHtml)
      }
    })
  }, [pins, onEdit, onDelete])

  return <div ref={containerRef} id="map" className="w-full h-[100vh]" />
}


