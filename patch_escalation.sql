CREATE TABLE IF NOT EXISTS public.ticket_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
  action_number INT NOT NULL,
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_taken TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.ticket_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ticket_actions viewable by everyone" ON public.ticket_actions FOR SELECT USING (true);
CREATE POLICY "ict_support can insert actions" ON public.ticket_actions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('system_admin', 'ict_support'))
);

CREATE TABLE IF NOT EXISTS public.ticket_confirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
  attempt_number INT NOT NULL,
  confirmed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  result TEXT NOT NULL,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.ticket_confirmations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ticket_confirmations viewable by everyone" ON public.ticket_confirmations FOR SELECT USING (true);
CREATE POLICY "employees can insert confirmations" ON public.ticket_confirmations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.tickets WHERE tickets.id = ticket_id AND tickets.reported_by = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'system_admin')
);

CREATE TABLE IF NOT EXISTS public.external_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
  referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  service_provider TEXT NOT NULL,
  contact_person TEXT,
  contact_number TEXT,
  reference_number TEXT,
  date_referred DATE NOT NULL,
  expected_return_date DATE,
  estimated_cost DECIMAL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.external_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "external_referrals viewable by everyone" ON public.external_referrals FOR SELECT USING (true);
CREATE POLICY "ict_support can insert referrals" ON public.external_referrals FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('system_admin', 'ict_support'))
);

-- update ticket status ENUM (no enum, text type in public.tickets)
