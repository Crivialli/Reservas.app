"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Empty } from "@/components/ui/empty"
import { Room, Reservation } from "@/lib/types"
import { CalendarDays } from "lucide-react"

interface ReservationsListProps {
  rooms: Room[]
}

export function ReservationsList({ rooms }: ReservationsListProps) {
  const [selectedRoom, setSelectedRoom] = useState<string>("all")
  const [reservations, setReservations] = useState<(Reservation & { room: Room })[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchReservations() {
      setLoading(true)
      
      let query = supabase
        .from("reservations")
        .select("*, room:rooms(*)")
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })

      if (selectedRoom !== "all") {
        query = query.eq("room_id", selectedRoom)
      }

      const { data, error } = await query

      if (error) {
        console.error("Erro ao buscar reservas:", error)
      } else {
        setReservations(data || [])
      }
      
      setLoading(false)
    }

    fetchReservations()
  }, [selectedRoom, supabase])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "America/Sao_Paulo" // Adiciona timezone
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo" // Adiciona timezone
    })
  }

  return (
    <Card className="w-full animate-fade-in-down">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Reservas</CardTitle>
            <CardDescription>
              Veja todas as reservas futuras
            </CardDescription>
          </div>
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por sala" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as salas</SelectItem>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Carregando reservas...</p>
          </div>
        ) : reservations.length === 0 ? (
          <Empty
            icon={CalendarDays}
            title="Nenhuma reserva encontrada"
            description="Não há reservas futuras para esta sala."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sala</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Pessoa</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      <Badge variant="secondary">{reservation.room?.name}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(reservation.start_time)}</TableCell>
                    <TableCell>
                      {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                    </TableCell>
                    <TableCell className="font-medium">{reservation.person_name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{reservation.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>

    
  )
}
