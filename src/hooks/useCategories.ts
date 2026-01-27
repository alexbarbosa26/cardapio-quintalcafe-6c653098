import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/menu';
import { toast } from '@/hooks/use-toast';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Get item counts for each category
      const { data: itemCounts, error: countError } = await supabase
        .from('menu_items')
        .select('category_id');

      if (countError) throw countError;

      const countMap = itemCounts?.reduce((acc, item) => {
        acc[item.category_id] = (acc[item.category_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return categories.map(cat => ({
        ...cat,
        item_count: countMap[cat.id] || 0,
      }));
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'item_count'>) => {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Categoria criada!',
        description: 'A categoria foi adicionada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar categoria',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...category }: Partial<Category> & { id: string }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(category)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Categoria atualizada!',
        description: 'As alterações foram salvas.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar categoria',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast({
        title: 'Categoria excluída!',
        description: 'A categoria foi removida.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir categoria',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
