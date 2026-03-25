-- Criar extensão btree_gist primeiro (necessária para EXCLUDE constraint)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Criar tabela de salas
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir as salas Ex e Sempre Viva
INSERT INTO rooms (name, description) VALUES 
  ('Sala Ex', 'Sala de reuniões Ex'),
  ('Sala Sempre Viva', 'Sala de reuniões Sempre Viva')
ON CONFLICT (name) DO NOTHING;

-- Criar tabela de reservas
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  email TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índice para melhorar performance de consultas por sala e tempo
CREATE INDEX IF NOT EXISTS idx_reservations_room_time ON reservations (room_id, start_time, end_time);

-- Habilitar RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Políticas para rooms - permitir leitura pública
DROP POLICY IF EXISTS "rooms_select_all" ON rooms;
CREATE POLICY "rooms_select_all" ON rooms FOR SELECT USING (true);

-- Políticas para reservations - permitir leitura pública
DROP POLICY IF EXISTS "reservations_select_all" ON reservations;
CREATE POLICY "reservations_select_all" ON reservations FOR SELECT USING (true);

-- Políticas para reservations - permitir inserção pública
DROP POLICY IF EXISTS "reservations_insert_all" ON reservations;
CREATE POLICY "reservations_insert_all" ON reservations FOR INSERT WITH CHECK (true);

-- Políticas para reservations - permitir update para todos
DROP POLICY IF EXISTS "reservations_update_all" ON reservations;
CREATE POLICY "reservations_update_all" ON reservations FOR UPDATE USING (true);

-- Políticas para reservations - permitir delete para todos
DROP POLICY IF EXISTS "reservations_delete_all" ON reservations;
CREATE POLICY "reservations_delete_all" ON reservations FOR DELETE USING (true);
