export type Pin = {
  id: number
  title: string
  latitude: number
  longitude: number
  user_id?: number
  is_owner?: boolean
}

export type NewPin = {
  title: string
  latitude: number
  longitude: number
}

export type UpdatePin = {
  title: string
}


