-- Run this in your Supabase SQL Editor

-- 1. Create custom types
CREATE TYPE user_role AS ENUM ('Department User', 'Admin', 'ICT Support');
CREATE TYPE ticket_priority AS ENUM ('Critical', 'High', 'Medium', 'Low');
CREATE TYPE ticket_status AS ENUM ('NEW', 'ASSIGNED', 'IN PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED');
CREATE TYPE asset_condition AS ENUM ('Excellent', 'Good', 'Fair', 'Poor', 'Damaged', 'For Repair', 'Unserviceable');
CREATE TYPE asset_status AS ENUM ('Operational', 'Under Maintenance', 'Non-Operational', 'For Replacement', 'Retired', 'Lost / Missing');

-- 2. Create tables
CREATE TABLE offices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    acronym TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role user_role DEFAULT 'Department User' NOT NULL,
    office_id UUID REFERENCES offices(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    office_id UUID REFERENCES offices(id) ON DELETE RESTRICT,
    equipment_type TEXT NOT NULL,
    property_number TEXT NOT NULL UNIQUE,
    inventory_number TEXT,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    serial_number TEXT,
    assigned_to TEXT,
    condition asset_condition NOT NULL,
    operational_status asset_status NOT NULL,
    hostname TEXT,
    processor TEXT,
    memory TEXT,
    disk_storage TEXT,
    operating_system TEXT,
    microsoft_office TEXT,
    exact_location TEXT,
    acquisition_cost DECIMAL(12,2),
    date_acquired DATE,
    date_audited DATE,
    audited_by TEXT,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_number TEXT NOT NULL UNIQUE,
    requester_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    office_id UUID REFERENCES offices(id) ON DELETE RESTRICT NOT NULL,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT NOT NULL,
    priority ticket_priority NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status ticket_status DEFAULT 'NEW' NOT NULL,
    assigned_to_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ict_recommendation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE ticket_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE ticket_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
    status ticket_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Setup Row Level Security (RLS)
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_status_history ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read everything (simplified for initial setup)
CREATE POLICY "Allow authenticated read access on offices" ON offices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access on categories" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access on profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access on assets" ON assets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access on tickets" ON tickets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access on ticket_comments" ON ticket_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access on ticket_status_history" ON ticket_status_history FOR SELECT TO authenticated USING (true);

-- Allow specific inserts/updates
CREATE POLICY "Allow ICT/Admin insert assets" ON assets FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('Admin', 'ICT Support'))
);

CREATE POLICY "Allow ICT/Admin update assets" ON assets FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('Admin', 'ICT Support'))
);

CREATE POLICY "Allow any user to insert tickets" ON tickets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow ICT/Admin or owner to update tickets" ON tickets FOR UPDATE TO authenticated USING (
  requester_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('Admin', 'ICT Support'))
);

CREATE POLICY "Allow users to comment on tickets" ON ticket_comments FOR INSERT TO authenticated WITH CHECK (true);

-- 4. Initial Seed Data
INSERT INTO offices (name, acronym, email) VALUES 
('Mayor''s Office Administrative Section', 'MO-Admin', 'mo_admin@malungon.gov.ph'),
('Bureau of Fire Protection', 'BFP', 'fire@malungon.gov.ph'),
('Bids and Awards Committee', 'BAC', 'bac@malungon.gov.ph'),
('Bureau of Internal Revenue', 'BIR', 'bir@malungon.gov.ph'),
('Civil Security Unit', 'CSU', 'csu@malungon.gov.ph'),
('General Services Office', 'GSO', 'gso@malungon.gov.ph'),
('Local Disaster Risk Reduction and Management Office', 'LDRRMO', 'ldrrmo@malungon.gov.ph'),
('Liga ng mga Barangay', 'LB', 'liga@malungon.gov.ph'),
('Local Youth Development Office', 'LYDO', 'lydo@malungon.gov.ph'),
('Municipal Economic Enterprise Development Office', 'MEEDO', 'market@malungon.gov.ph'),
('Municipal Environment and Natural Resources Office', 'MENRO', 'menro@malungon.gov.ph'),
('Municipal Local Government Operations Office', 'MLGOO', 'mlgoo@malungon.gov.ph'),
('Municipal Social Welfare and Development Office', 'MSWDO', 'mswdo@malungon.gov.ph'),
('Municipal Accounting Office', 'ACCOUNTING', 'accounting@malungon.gov.ph'),
('Office of the Municipal Agriculturist', 'OMAG', 'agri@malungon.gov.ph'),
('Municipal Assessor''s Office', 'MASSO', 'assessor@malungon.gov.ph'),
('Municipal Budget Office', 'MBO', 'budget@malungon.gov.ph'),
('Municipal Civil Registrar Office', 'MCR', 'registrar@malungon.gov.ph'),
('Municipal Cooperative Development Office', 'MCDO', 'coop@malungon.gov.ph'),
('Municipal Engineering Office', 'MEO', 'engineer@malungon.gov.ph'),
('Municipal Health Office', 'MHO', 'health@malungon.gov.ph'),
('Municipal Information Office', 'MIO', 'info@malungon.gov.ph'),
('Municipal Treasurer''s Office', 'MTO', 'treasurer@malungon.gov.ph'),
('Municipal Tribal Council', 'MTC', 'tribal@malungon.gov.ph'),
('Municipal Nutrition Office', 'MNO', 'nutrition@malungon.gov.ph'),
('Office of the Mayor', 'OM', 'mayor@malungon.gov.ph'),
('Office of the Vice Mayor', 'OVM', 'vicemayor@malungon.gov.ph'),
('Business Permits and Licensing Office', 'BPLO', 'permits@malungon.gov.ph'),
('Human Resource Management Office', 'HRMO', 'hr@malungon.gov.ph'),
('Public Employment Service Office', 'PESO', 'peso@malungon.gov.ph'),
('Municipal Planning and Development Office', 'MPDO', 'planning@malungon.gov.ph'),
('Philippine National Police', 'PNP', 'pnp@malungon.gov.ph'),
('Sangguniang Bayan', 'SB', 'sb@malungon.gov.ph'),
('Municipal Tourism Office', 'MTO', 'tourism@malungon.gov.ph'),
('Systems Administrator', 'SYSTEMS', 'systems@malungon.gov.ph'),
('Web Administrator', 'WEBADMIN', 'webadmin@malungon.gov.ph');

INSERT INTO categories (name) VALUES 
('Hardware'),
('Software'),
('Network');

