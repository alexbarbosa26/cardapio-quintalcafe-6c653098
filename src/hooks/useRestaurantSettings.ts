import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface OpeningHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface WeeklyHours {
  monday: OpeningHours;
  tuesday: OpeningHours;
  wednesday: OpeningHours;
  thursday: OpeningHours;
  friday: OpeningHours;
  saturday: OpeningHours;
  sunday: OpeningHours;
  [key: string]: OpeningHours;
}

export interface RestaurantSettings {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  phone: string | null;
  address: string | null;
  instagram: string | null;
  facebook: string | null;
  whatsapp: string | null;
  opening_hours: WeeklyHours | null;
  created_at: string;
  updated_at: string;
}

export function useRestaurantSettings() {
  return useQuery({
    queryKey: ['restaurant-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*')
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        opening_hours: data.opening_hours as unknown as WeeklyHours | null,
      } as RestaurantSettings;
    },
  });
}

export function useUpdateRestaurantSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: Partial<RestaurantSettings> & { id: string }) => {
      const { opening_hours, ...rest } = settings;
      
      const updateData = {
        ...rest,
        ...(opening_hours !== undefined && { opening_hours: opening_hours as unknown as Json }),
      };
      
      const { data, error } = await supabase
        .from('restaurant_settings')
        .update(updateData)
        .eq('id', settings.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-settings'] });
    },
  });
}

export function useUploadLogo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ file, settingsId }: { file: File; settingsId: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `restaurant/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath);
      
      const { error: updateError } = await supabase
        .from('restaurant_settings')
        .update({ logo_url: publicUrl })
        .eq('id', settingsId);
      
      if (updateError) throw updateError;
      
      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-settings'] });
    },
  });
}
