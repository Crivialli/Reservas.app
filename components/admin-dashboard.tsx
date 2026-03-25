"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Empty } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Room, Reservation } from "@/lib/types"
import { CalendarDays, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface AdminDashboardProps {
  rooms: Room[]
}

export function AdminDashboard({ rooms }: AdminDashboardProps) {
  const [selectedRoom, setSelectedRoom] = useState<string>("all")
  const [reservations, setReservations] = useState<(Reservation & { room: Room })[]>([])
  const [loading, setLoading] = useState(true)
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [deletingReservation, setDeletingReservation] = useState<Reservation | null>(null)
  const [saving, setSaving] = useState(false)

  // Form states for editing
  const [editPersonName, setEditPersonName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editDate, setEditDate] = useState("")
  const [editStartTime, setEditStartTime] = useState("")
  const [editEndTime, setEditEndTime] = useState("")
  const [editReason, setEditReason] = useState("")
  const [editRoomId, setEditRoomId] = useState("")

  const supabase = createClient()

  const fetchReservations = useCallback(async () => {
    setLoading(true)
    
    let query = supabase
      .from("reservations")
      .select("*, room:rooms(*)")
      .order("start_time", { ascending: false })

    if (selectedRoom !== "all") {
      query = query.eq("room_id", selectedRoom)
    }

    const { data, error } = await query

    if (error) {
      console.error("Erro ao buscar reservas:", error)
      toast.error("Erro ao carregar reservas")
    } else {
      setReservations(data || [])
    }
    
    setLoading(false)
  }, [selectedRoom, supabase])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  const openEditDialog = (reservation: Reservation) => {
    setEditingReservation(reservation)
    setEditPersonName(reservation.person_name)
    setEditEmail(reservation.email || "")
    setEditReason(reservation.reason)
    setEditRoomId(reservation.room_id)
    
    const startDate = new Date(reservation.start_time)
    const endDate = new Date(reservation.end_time)
    
    setEditDate(startDate.toISOString().split("T")[0])
    setEditStartTime(startDate.toTimeString().slice(0, 5))
    setEditEndTime(endDate.toTimeString().slice(0, 5))
  }

  const handleUpdate = async () => {
    if (!editingReservation) return

    if (editStartTime >= editEndTime) {
      toast.error("O horário de término deve ser após o horário de início.")
      return
    }

    setSaving(true)

    try {
      const startDateTime = `${editDate}T${editStartTime}:00`
      const endDateTime = `${editDate}T${editEndTime}:00`

      const { error } = await supabase
        .from("reservations")
        .update({
          room_id: editRoomId,
          person_name: editPersonName,
          email: editEmail || null,
          start_time: startDateTime,
          end_time: endDateTime,
          reason: editReason,
        })
        .eq("id", editingReservation.id)

      if (error) throw error

      toast.success("Reserva atualizada com sucesso!")
      setEditingReservation(null)
      fetchReservations()
    } catch (error) {
      console.error("Erro ao atualizar reserva:", error)
      toast.error("Erro ao atualizar reserva")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingReservation) return

    setSaving(true)

    try {
      const { error } = await supabase
        .from("reservations")
        .delete()
        .eq("id", deletingReservation.id)

      if (error) throw error

      toast.success("Reserva excluída com sucesso!")
      setDeletingReservation(null)
      fetchReservations()
    } catch (error) {
      console.error("Erro ao excluir reserva:", error)
      toast.error("Erro ao excluir reserva")
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isPast = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl">Gerenciar Reservas</CardTitle>
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
              <Spinner className="mr-2" />
              <p className="text-muted-foreground">Carregando reservas...</p>
            </div>
          ) : reservations.length === 0 ? (
            <Empty
              icon={CalendarDays}
              title="Nenhuma reserva encontrada"
              description="Não há reservas registradas."
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
                    <TableHead>E-mail</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
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
                      <TableCell className="text-muted-foreground">{reservation.email || "-"}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{reservation.reason}</TableCell>
                      <TableCell>
                        {isPast(reservation.end_time) ? (
                          <Badge variant="outline" className="text-muted-foreground">Passado</Badge>
                        ) : (
                          <Badge variant="default">Ativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(reservation)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingReservation(reservation)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingReservation} onOpenChange={() => setEditingReservation(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Reserva</DialogTitle>
            <DialogDescription>
              Altere as informações da reserva
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-room">Sala</Label>
              <Select value={editRoomId} onValueChange={setEditRoomId}>
                <SelectTrigger id="edit-room">
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
              <Label htmlFor="edit-person">Nome</Label>
              <Input
                id="edit-person"
                value={editPersonName}
                onChange={(e) => setEditPersonName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-email">E-mail</Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-date">Data</Label>
              <Input
                id="edit-date"
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-start">Início</Label>
                <Input
                  id="edit-start"
                  type="time"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-end">Término</Label>
                <Input
                  id="edit-end"
                  type="time"
                  value={editEndTime}
                  onChange={(e) => setEditEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-reason">Motivo</Label>
              <Textarea
                id="edit-reason"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingReservation(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving ? <Spinner className="mr-2" /> : null}
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingReservation} onOpenChange={() => setDeletingReservation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Reserva</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a reserva de{" "}
              <strong>{deletingReservation?.person_name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={saving}>
              {saving ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
