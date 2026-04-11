CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time VARCHAR(5) NOT NULL,
  end_time VARCHAR(5) NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  price NUMERIC,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE event_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  spots_reserved INTEGER NOT NULL CHECK (spots_reserved > 0),
  created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE events
  ADD CONSTRAINT fk_events_store
  FOREIGN KEY (store_id) REFERENCES shops(id) ON DELETE CASCADE;

ALTER TABLE event_bookings
  ADD CONSTRAINT fk_event_bookings_event
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

CREATE INDEX idx_events_store_date ON events(store_id, date);
CREATE INDEX idx_event_bookings_event_id ON event_bookings(event_id);