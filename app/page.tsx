import { createClient } from "@/lib/supabase/server"
import { ReservationForm } from "@/components/reservation-form"
import { ReservationsList } from "@/components/reservations-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Settings } from "lucide-react"

export default async function Home() {
  const supabase = await createClient()
  
  const { data: rooms } = await supabase
    .from("rooms")
    .select("*")
    .order("name")

  return (
    <main className="min-h-screen bg-background w-full">
      <header className="border-b bg-card w-full">
        <div className="min-w-full container mx-auto px-4 py-4 flex items-center justify-between bg-blue-800">
          <div>
            <h1 className="text-2xl font-bold text-white">Sistema de Reservas | Grupo Crivialli</h1>
            <p className="text-sm text-muted-foreground text-white">Reserve uma sala de reunião</p>
          </div>
          <Link href="/admin">
            <Button className="bg-white hover:bg-gray-300 cursor-pointer" variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 bg-blue-500/50 min-h-screen min-w-full">
        <Tabs defaultValue="reservar" className="w-full rounded-3xl p-5 min-h-screen">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-gray-700">
            <TabsTrigger className="text-white" value="reservar">Fazer Reserva</TabsTrigger>
            <TabsTrigger className="text-white" value="ver">Ver Reservas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reservar" className="mt-0">
            <ReservationForm rooms={rooms || []} />
          </TabsContent>
          
          <TabsContent value="ver" className="mt-0">
            <ReservationsList rooms={rooms || []} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
