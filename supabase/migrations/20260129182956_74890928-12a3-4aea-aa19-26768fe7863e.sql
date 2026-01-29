-- Create junction table for promotion-item links
CREATE TABLE public.promotion_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(promotion_id, menu_item_id)
);

-- Enable Row Level Security
ALTER TABLE public.promotion_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage promotion items"
ON public.promotion_items
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view promotion items"
ON public.promotion_items
FOR SELECT
USING (true);

-- Add indexes for better query performance
CREATE INDEX idx_promotion_items_promotion_id ON public.promotion_items(promotion_id);
CREATE INDEX idx_promotion_items_menu_item_id ON public.promotion_items(menu_item_id);