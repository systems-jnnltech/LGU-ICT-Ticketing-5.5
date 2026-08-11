const fs = require('fs');

let schema = fs.readFileSync('supabase_schema.sql', 'utf-8');

if (!schema.includes('public.user_invitations')) {
  // Add table definition
  schema = schema.replace(
    `CREATE TABLE public.departments (`,
    `CREATE TABLE public.user_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role public.user_role NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.departments (`
  );

  // Add RLS
  schema = schema.replace(
    `ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;`
  );

  // Add Policy
  schema = schema.replace(
    `-- Departments`,
    `-- Invitations
CREATE POLICY "Admins can manage invitations" ON public.user_invitations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'system_admin')
);

-- Departments`
  );

  // Replace handle_new_user body
  const oldTriggerStart = `AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    new.id,
    COALESCE(new.email, ''),
    COALESCE(
      new.raw_user_meta_data->>'full_name', 
      split_part(new.email, '@', 1),
      'New User'
    ),
    -- Automatically assign system_admin to your email, others become employee
    CASE WHEN new.email = 'systems@malungon.gov.ph' THEN 'system_admin'::public.user_role ELSE 'employee'::public.user_role END,
    'active'::public.user_status
  );
  RETURN new;
EXCEPTION`;

  const newTriggerStart = `AS $$
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
EXCEPTION`;

  schema = schema.replace(oldTriggerStart, newTriggerStart);
  
  fs.writeFileSync('supabase_schema.sql', schema);
  console.log('supabase_schema.sql patched');
}
