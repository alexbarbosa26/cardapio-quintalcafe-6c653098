import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface PromotionItem {
  id: string;
  promotion_id: string;
  menu_item_id: string;
  discount_type: string | null;
  discount_value: number | null;
  created_at: string;
}

export interface PromotionItemWithPromo extends PromotionItem {
  promotions: {
    id: string;
    title: string;
    badge_text: string | null;
    is_active: boolean;
    start_date: string | null;
    end_date: string | null;
  } | null;
}

export function usePromotionItems(promotionId?: string) {
  return useQuery({
    queryKey: ['promotion-items', promotionId],
    queryFn: async (): Promise<PromotionItem[]> => {
      let query = supabase.from('promotion_items').select('*');
      
      if (promotionId) {
        query = query.eq('promotion_id', promotionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!promotionId || promotionId === undefined,
  });
}

export function useItemPromotions(menuItemId?: string) {
  return useQuery({
    queryKey: ['item-promotions', menuItemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotion_items')
        .select(`
          *,
          promotions:promotion_id (
            id,
            title,
            badge_text,
            is_active,
            start_date,
            end_date
          )
        `)
        .eq('menu_item_id', menuItemId!);

      if (error) throw error;
      return data;
    },
    enabled: !!menuItemId,
  });
}

export function useAllActivePromotionItems() {
  return useQuery({
    queryKey: ['all-active-promotion-items'],
    queryFn: async (): Promise<PromotionItemWithPromo[]> => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('promotion_items')
        .select(`
          id,
          promotion_id,
          menu_item_id,
          discount_type,
          discount_value,
          created_at,
          promotions:promotion_id (
            id,
            title,
            badge_text,
            is_active,
            start_date,
            end_date
          )
        `);

      if (error) throw error;
      
      // Filter to only active promotions within date range
      return (data as PromotionItemWithPromo[]).filter(item => {
        const promo = item.promotions;
        if (!promo?.is_active) return false;
        if (promo.start_date && promo.start_date > today) return false;
        if (promo.end_date && promo.end_date < today) return false;
        return true;
      });
    },
  });
}

export function useLinkPromotionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      promotionId, 
      menuItemId,
      discountType,
      discountValue 
    }: { 
      promotionId: string; 
      menuItemId: string;
      discountType?: string;
      discountValue?: number;
    }) => {
      const { data, error } = await supabase
        .from('promotion_items')
        .insert({ 
          promotion_id: promotionId, 
          menu_item_id: menuItemId,
          discount_type: discountType || null,
          discount_value: discountValue || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotion-items'] });
      queryClient.invalidateQueries({ queryKey: ['all-active-promotion-items'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao vincular item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdatePromotionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id,
      discountType,
      discountValue 
    }: { 
      id: string;
      discountType?: string | null;
      discountValue?: number | null;
    }) => {
      const { data, error } = await supabase
        .from('promotion_items')
        .update({ 
          discount_type: discountType,
          discount_value: discountValue
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotion-items'] });
      queryClient.invalidateQueries({ queryKey: ['all-active-promotion-items'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar desconto',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUnlinkPromotionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ promotionId, menuItemId }: { promotionId: string; menuItemId: string }) => {
      const { error } = await supabase
        .from('promotion_items')
        .delete()
        .eq('promotion_id', promotionId)
        .eq('menu_item_id', menuItemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotion-items'] });
      queryClient.invalidateQueries({ queryKey: ['all-active-promotion-items'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao desvincular item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
