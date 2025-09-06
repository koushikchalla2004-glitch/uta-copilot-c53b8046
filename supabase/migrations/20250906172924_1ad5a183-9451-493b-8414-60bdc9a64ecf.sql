-- Create real-time campus activity tables

-- Shuttle/Bus tracking
CREATE TABLE public.shuttle_tracking (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  route_name TEXT NOT NULL,
  vehicle_id TEXT NOT NULL,
  current_location POINT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  next_stop TEXT,
  eta_minutes INTEGER,
  capacity_status TEXT CHECK (capacity_status IN ('low', 'medium', 'high')),
  is_active BOOLEAN DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Live campus alerts (emergency, weather, etc.)
CREATE TABLE public.live_alerts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  alert_type TEXT CHECK (alert_type IN ('emergency', 'weather', 'maintenance', 'traffic', 'event')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  affected_areas TEXT[],
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Real-time facility occupancy
CREATE TABLE public.facility_occupancy (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  building_id BIGINT REFERENCES buildings(id),
  facility_name TEXT NOT NULL,
  facility_type TEXT CHECK (facility_type IN ('library', 'gym', 'lab', 'computer_lab', 'study_room', 'parking_garage')),
  current_occupancy INTEGER DEFAULT 0,
  max_capacity INTEGER NOT NULL,
  occupancy_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN max_capacity > 0 THEN (current_occupancy::decimal / max_capacity::decimal) * 100
      ELSE 0 
    END
  ) STORED,
  status TEXT CHECK (status IN ('open', 'closed', 'maintenance')) DEFAULT 'open',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Live parking availability
CREATE TABLE public.parking_availability (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  lot_name TEXT NOT NULL,
  lot_code TEXT,
  total_spaces INTEGER NOT NULL,
  available_spaces INTEGER DEFAULT 0,
  reserved_spaces INTEGER DEFAULT 0,
  permit_type TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_open BOOLEAN DEFAULT true,
  hourly_rate DECIMAL(4,2),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Real-time wait times (dining, services)
CREATE TABLE public.service_wait_times (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  location_name TEXT NOT NULL,
  service_type TEXT CHECK (service_type IN ('dining', 'registrar', 'financial_aid', 'library_checkout', 'bus_stop')),
  estimated_wait_minutes INTEGER DEFAULT 0,
  queue_length INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('open', 'closed', 'busy', 'slow')) DEFAULT 'open',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.shuttle_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_occupancy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_wait_times ENABLE ROW LEVEL SECURITY;

-- Create public read policies
CREATE POLICY "Public can read shuttle tracking" ON public.shuttle_tracking FOR SELECT USING (true);
CREATE POLICY "Public can read live alerts" ON public.live_alerts FOR SELECT USING (true);
CREATE POLICY "Public can read facility occupancy" ON public.facility_occupancy FOR SELECT USING (true);
CREATE POLICY "Public can read parking availability" ON public.parking_availability FOR SELECT USING (true);
CREATE POLICY "Public can read service wait times" ON public.service_wait_times FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX idx_shuttle_tracking_active ON shuttle_tracking(is_active, last_updated);
CREATE INDEX idx_live_alerts_active ON live_alerts(is_active, severity, created_at);
CREATE INDEX idx_facility_occupancy_building ON facility_occupancy(building_id, facility_type);
CREATE INDEX idx_parking_availability_open ON parking_availability(is_open, last_updated);
CREATE INDEX idx_service_wait_times_type ON service_wait_times(service_type, status);

-- Set up automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_live_alerts_updated_at
  BEFORE UPDATE ON live_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add sample data for testing
INSERT INTO shuttle_tracking (route_name, vehicle_id, lat, lng, next_stop, eta_minutes, capacity_status) VALUES
('Campus Loop', 'BUS001', 32.7300, -97.1150, 'Student Union', 5, 'medium'),
('Research Shuttle', 'BUS002', 32.7280, -97.1180, 'Engineering Building', 3, 'low'),
('Residence Hall Express', 'BUS003', 32.7320, -97.1120, 'Dining Hall', 8, 'high');

INSERT INTO live_alerts (alert_type, severity, title, message, affected_areas, expires_at) VALUES
('weather', 'medium', 'Severe Weather Watch', 'Thunderstorm warning in effect until 6 PM. Seek shelter if outdoors.', ARRAY['campus_wide'], now() + interval '4 hours'),
('maintenance', 'low', 'Library WiFi Maintenance', 'Intermittent WiFi issues in Central Library floors 3-4.', ARRAY['central_library'], now() + interval '2 hours');

INSERT INTO facility_occupancy (building_id, facility_name, facility_type, current_occupancy, max_capacity) VALUES
(1, 'Central Library Study Area', 'library', 45, 120),
(1, 'Computer Lab A', 'computer_lab', 12, 30),
(2, 'Recreation Center', 'gym', 78, 150);

INSERT INTO parking_availability (lot_name, lot_code, total_spaces, available_spaces, permit_type, lat, lng, hourly_rate) VALUES
('Lot 31 (Student)', 'LOT31', 450, 67, 'student', 32.7285, -97.1165, 3.00),
('Lot 38 (Visitor)', 'LOT38', 120, 23, 'visitor', 32.7315, -97.1145, 5.00),
('Cooper Street Garage', 'CSG', 800, 234, 'all', 32.7295, -97.1175, 4.50);

INSERT INTO service_wait_times (location_name, service_type, estimated_wait_minutes, queue_length) VALUES
('Chick-fil-A', 'dining', 12, 8),
('Starbucks', 'dining', 5, 3),
('Registrar Office', 'registrar', 25, 6),
('Financial Aid Office', 'financial_aid', 15, 4);