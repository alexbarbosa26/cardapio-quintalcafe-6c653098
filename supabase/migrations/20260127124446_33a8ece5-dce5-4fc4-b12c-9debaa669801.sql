-- Create restaurant settings table
CREATE TABLE public.restaurant_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Quintal Café e Doceria',
  logo_url TEXT,
  primary_color TEXT DEFAULT '#5a7a5a',
  secondary_color TEXT DEFAULT '#c4423b',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view settings
CREATE POLICY "Anyone can view restaurant settings"
ON public.restaurant_settings
FOR SELECT
USING (true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage restaurant settings"
ON public.restaurant_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.restaurant_settings (name, logo_url) 
VALUES ('Quintal Café e Doceria', NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_restaurant_settings_updated_at
BEFORE UPDATE ON public.restaurant_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();