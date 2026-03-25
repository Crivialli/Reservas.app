export interface Room {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Reservation {
  id: string
  room_id: string
  person_name: string
  email: string | null
  start_time: string
  end_time: string
  reason: string
  created_at: string
  room?: Room
}
