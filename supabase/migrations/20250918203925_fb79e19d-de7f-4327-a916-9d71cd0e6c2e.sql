-- Enable RLS on all existing tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products_services ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create policies for empresas table
CREATE POLICY "Users can view their own company" 
ON public.empresas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own company" 
ON public.empresas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company" 
ON public.empresas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for clientes table
CREATE POLICY "Users can view all clients" 
ON public.clientes 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.empresas WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage clients" 
ON public.clientes 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.empresas WHERE user_id = auth.uid()));

-- Create policies for areas table
CREATE POLICY "Authenticated users can view areas" 
ON public.areas 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can manage areas" 
ON public.areas 
FOR ALL 
TO authenticated 
USING (true);

-- Create policies for products_services table
CREATE POLICY "Authenticated users can view products_services" 
ON public.products_services 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can manage products_services" 
ON public.products_services 
FOR ALL 
TO authenticated 
USING (true);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'name',
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();