import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem, MenuItemWithCategory } from '@/types/menu';
import { toast } from '@/hooks/use-toast';

export function useMenuItems(activeOnly: boolean = false) {
  return useQuery({
    queryKey: ['menu-items', activeOnly],
    queryFn: async (): Promise<MenuItemWithCategory[]> => {
      let query = supabase
        .from('menu_items')
        .select('*, categories(*)')
        .order('name', { ascending: true });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at' | 'category'>) => {
      const { data, error } = await supabase
        .from('menu_items')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Item criado!',
        description: 'O item foi adicionado ao cardápio.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...item }: Partial<MenuItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('menu_items')
        .update(item)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast({
        title: 'Item atualizado!',
        description: 'As alterações foram salvas.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Item excluído!',
        description: 'O item foi removido do cardápio.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error } = await supabase.storage
        .from('menu-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(fileName);

      return publicUrl;
    },
    onError: (error) => {
      toast({
        title: 'Erro ao fazer upload',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
