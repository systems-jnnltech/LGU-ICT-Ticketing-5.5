-- ==========================================
-- LGU ICT Help Desk - Supabase Schema
-- ==========================================

-- 1. Drop existing objects to allow clean re-runs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

DROP TABLE IF EXISTS public.ticket_comments CASCADE;
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.assets CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;

DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.user_status CASCADE;

-- 2. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Custom Types
CREATE TYPE public.user_role AS ENUM ('system_admin', 'ict_support', 'employee');
CREATE TYPE public.user_status AS ENUM ('active', 'inactive', 'suspended');

-- 4. Tables
CREATE TABLE public.user_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role public.user_role NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  acronym TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role public.user_role DEFAULT 'employee'::public.user_role NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  status public.user_status DEFAULT 'active'::public.user_status NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  equipment_type TEXT NOT NULL,
  property_number TEXT,
  inventory_number TEXT,
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  hostname TEXT,
  processor TEXT,
  memory TEXT,
  disk_storage TEXT,
  assigned_to TEXT,
  exact_location TEXT,
  operating_system TEXT,
  microsoft_office TEXT,
  condition TEXT DEFAULT 'Excellent',
  operational_status TEXT DEFAULT 'Operational',
  acquisition_cost DECIMAL(12,2),
  date_acquired DATE,
  date_audited DATE,
  audited_by TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'Open' NOT NULL,
  priority TEXT DEFAULT 'Medium' NOT NULL,
  category TEXT NOT NULL,
  reported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.ticket_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Row Level Security (RLS)
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;

-- Grants for authenticated users
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 6. RLS Policies

-- Invitations
CREATE POLICY "Admins can manage invitations" ON public.user_invitations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'system_admin')
);

-- Departments
CREATE POLICY "Departments are viewable by everyone" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Admins can insert departments" ON public.departments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'system_admin')
);
CREATE POLICY "Admins can update departments" ON public.departments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'system_admin')
);
CREATE POLICY "Admins can delete departments" ON public.departments FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'system_admin')
);

-- Profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'system_admin')
);

-- Assets
CREATE POLICY "Assets viewable by everyone" ON public.assets FOR SELECT USING (true);
CREATE POLICY "Assets insert" ON public.assets FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('system_admin', 'ict_support'))
);
CREATE POLICY "Assets update" ON public.assets FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('system_admin', 'ict_support'))
);

-- Tickets
CREATE POLICY "Tickets visibility" ON public.tickets FOR SELECT USING (
  auth.uid() = reported_by OR 
  auth.uid() = assigned_to OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('system_admin', 'ict_support'))
);
CREATE POLICY "Employees can create tickets" ON public.tickets FOR INSERT WITH CHECK (auth.uid() = reported_by);
CREATE POLICY "Ticket updates" ON public.tickets FOR UPDATE USING (
  auth.uid() = reported_by OR 
  auth.uid() = assigned_to OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('system_admin', 'ict_support'))
);

-- Comments
CREATE POLICY "Comments viewable" ON public.ticket_comments FOR SELECT USING (true);
CREATE POLICY "Comments insert" ON public.ticket_comments FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE TABLE public.asset_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  changes TEXT NOT NULL,
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.asset_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Asset history viewable" ON public.asset_history FOR SELECT USING (true);
CREATE POLICY "Asset history insert" ON public.asset_history FOR INSERT WITH CHECK (auth.uid() = performed_by);

-- 7. Triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Auth Trigger for Profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $
DECLARE
  invited_role public.user_role;
  invited_dept UUID;
BEGIN
  -- Check if they were invited
  SELECT role, department_id INTO invited_role, invited_dept 
  FROM public.user_invitations 
  WHERE email = new.email;

  INSERT INTO public.profiles (id, email, full_name, role, department_id, status)
  VALUES (
    new.id,
    COALESCE(new.email, ''),
    COALESCE(
      new.raw_user_meta_data->>'full_name', 
      split_part(new.email, '@', 1),
      'New User'
    ),
    COALESCE(invited_role, CASE WHEN new.email = 'systems@malungon.gov.ph' THEN 'system_admin'::public.user_role ELSE 'employee'::public.user_role END),
    invited_dept,
    'active'::public.user_status
  );
  
  -- Delete the invitation after use
  DELETE FROM public.user_invitations WHERE email = new.email;
  
  RETURN new;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Initial Seed Data
INSERT INTO public.departments (name, acronym, email) VALUES 
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

-- 10. Reload PostgREST schema cache to resolve 404 errors after dropping/recreating tables
NOTIFY pgrst, 'reload schema';
