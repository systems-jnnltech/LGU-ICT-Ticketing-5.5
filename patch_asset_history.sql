CREATE TABLE IF NOT EXISTS public.asset_history (
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

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
