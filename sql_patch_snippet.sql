CREATE TABLE public.user_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role public.user_role NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage invitations" ON public.user_invitations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'system_admin')
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
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
