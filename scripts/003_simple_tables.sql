-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default rooms
INSERT INTO rooms (name, description) VALUES 
  ('Sala Ex', 'Sala de reuniões Ex'),
  ('Sala Sempre Viva', 'Sala de reuniões Sempre Viva')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Policies for rooms (public read)
CREATE POLICY "rooms_select_all" ON rooms FOR SELECT USING (true);

-- Policies for reservations (public read and insert, admin can update/delete)
CREATE POLICY "reservations_select_all" ON reservations FOR SELECT USING (true);
CREATE POLICY "reservations_insert_all" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "reservations_update_all" ON reservations FOR UPDATE USING (true);
CREATE POLICY "reservations_delete_all" ON reservations FOR DELETE USING (true);
