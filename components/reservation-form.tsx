"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Room, Reservation } from "@/lib/types"

interface ReservationFormProps {
  rooms: Room[]
  onSuccess?: () => void
}

export function ReservationForm({ rooms, onSuccess }: ReservationFormProps) {
  const [selectedRoom, setSelectedRoom] = useState<string>("")
  const [personName, setPersonName] = useState("")
  const [email, setEmail] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [existingReservations, setExistingReservations] = useState<Reservation[]>([])

  const supabase = createClient()

  // Buscar reservas existentes quando a sala e data são selecionadas
  useEffect(() => {
    async function fetchReservations() {
      if (!selectedRoom || !date) {
        setExistingReservations([])
        return
      }

      const startOfDay = `${date}T00:00:00`
      const endOfDay = `${date}T23:59:59`

      const { data } = await supabase
        .from("reservations")
        .select("*")
        .eq("room_id", selectedRoom)
        .gte("start_time", startOfDay)
        .lte("start_time", endOfDay)
        .order("start_time")

      if (data) {
        setExistingReservations(data)
      }
    }

    fetchReservations()
  }, [selectedRoom, date, supabase])

  const checkTimeConflict = () => {
    if (!startTime || !endTime || !date) return false

    const newStart = new Date(`${date}T${startTime}`)
    const newEnd = new Date(`${date}T${endTime}`)

    for (const reservation of existingReservations) {
      const existingStart = new Date(reservation.start_time)
      const existingEnd = new Date(reservation.end_time)

      // Verifica sobreposição
      if (newStart < existingEnd && newEnd > existingStart) {
        return true
      }
    }

    return false
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!selectedRoom || !personName || !date || !startTime || !endTime || !reason) {
      setError("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    if (startTime >= endTime) {
      setError("O horário de término deve ser após o horário de início.")
      return
    }

    if (checkTimeConflict()) {
      setError("Este horário já está reservado. Por favor, escolha outro horário.")
      return
    }

    setLoading(true)

    try {
      // Criar data no horário local do Brasil
      const localStartDateTime = new Date(`${date}T${startTime}:00-03:00`)
      const localEndDateTime = new Date(`${date}T${endTime}:00-03:00`)
      
      // Converter para UTC/ISO string
      const startDateTimeUTC = localStartDateTime.toISOString()
      const endDateTimeUTC = localEndDateTime.toISOString()

      const { error: insertError } = await supabase.from("reservations").insert({
        room_id: selectedRoom,
        person_name: personName,
        email: email || null,
        start_time: startDateTimeUTC,
        end_time: endDateTimeUTC,
        reason: reason,
      })

      if (insertError) {
        throw insertError
      }

      setSuccess(true)
      setPersonName("")
      setEmail("")
      setDate("")
      setStartTime("")
      setEndTime("")
      setReason("")
      setSelectedRoom("")

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error("Erro ao criar reserva:", err)
      setError("Erro ao criar reserva. Por favor, tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const hasConflict = checkTimeConflict()

  return (
    <Card className="w-full max-w-2xl mx-auto animate-zoom-in">
      <CardHeader>
        <CardTitle className="text-2xl">Nova Reserva</CardTitle>
        <CardDescription>
          Preencha os dados para reservar uma sala
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="room">Sala *</Label>
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger id="room">
                <SelectValue placeholder="Selecione uma sala" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="personName">Seu Nome *</Label>
            <Input
              id="personName"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Digite seu nome"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="startTime">Horário Início *</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="endTime">Horário Término *</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {hasConflict && (
            <p className="text-sm text-destructive">
              Este horário conflita com uma reserva existente.
            </p>
          )}

          {existingReservations.length > 0 && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium mb-2">Reservas existentes neste dia:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {existingReservations.map((res) => (
                  <li key={res.id}>
                    {new Date(res.start_time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} -{" "}
                    {new Date(res.end_time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} ({res.person_name})
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="reason">Motivo da Reserva *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo da reserva"
              rows={3}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {success && (
            <p className="text-sm text-green-600">
              Reserva criada com sucesso!
            </p>
          )}

          <Button type="submit" disabled={loading || hasConflict} className="w-full">
            {loading ? <Spinner className="mr-2" /> : null}
            {loading ? "Reservando..." : "Fazer Reserva"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
