import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PromotionViewStats {
  promotion_id: string;
  promotion_title: string;
  view_count: number;
}

export function usePromotionViewStats() {
  return useQuery({
    queryKey: ['promotion-view-stats'],
    queryFn: async (): Promise<PromotionViewStats[]> => {
      // First get all promotions
      const { data: promotions, error: promoError } = await supabase
        .from('promotions')
        .select('id, title');

      if (promoError) throw promoError;

      // Then get view counts
      const { data: views, error: viewsError } = await supabase
        .from('promotion_views')
        .select('promotion_id');

      if (viewsError) throw viewsError;

      // Count views per promotion
      const viewCounts = new Map<string, number>();
      views?.forEach(view => {
        const count = viewCounts.get(view.promotion_id) || 0;
        viewCounts.set(view.promotion_id, count + 1);
      });

      // Combine data
      return promotions?.map(promo => ({
        promotion_id: promo.id,
        promotion_title: promo.title,
        view_count: viewCounts.get(promo.id) || 0,
      })) || [];
    },
  });
}

export function useRecordPromotionView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promotionId: string) => {
      const { error } = await supabase
        .from('promotion_views')
        .insert({
          promotion_id: promotionId,
          user_agent: navigator.userAgent,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotion-view-stats'] });
    },
  });
}
