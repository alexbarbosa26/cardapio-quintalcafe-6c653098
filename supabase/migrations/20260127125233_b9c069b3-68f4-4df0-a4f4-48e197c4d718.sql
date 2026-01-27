-- Add contact and operating hours fields to restaurant_settings
ALTER TABLE public.restaurant_settings
ADD COLUMN phone TEXT,
ADD COLUMN address TEXT,
ADD COLUMN instagram TEXT,
ADD COLUMN facebook TEXT,
ADD COLUMN whatsapp TEXT,
ADD COLUMN opening_hours JSONB DEFAULT '{"monday": {"open": "08:00", "close": "18:00", "closed": false}, "tuesday": {"open": "08:00", "close": "18:00", "closed": false}, "wednesday": {"open": "08:00", "close": "18:00", "closed": false}, "thursday": {"open": "08:00", "close": "18:00", "closed": false}, "friday": {"open": "08:00", "close": "18:00", "closed": false}, "saturday": {"open": "08:00", "close": "14:00", "closed": false}, "sunday": {"open": "", "close": "", "closed": true}}'::jsonb;