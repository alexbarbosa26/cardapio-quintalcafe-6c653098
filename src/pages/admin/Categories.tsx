import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/useCategories';
import { Category } from '@/types/menu';
import { Plus, Pencil, Trash2, Loader2, LayoutGrid } from 'lucide-react';

export default function Categories() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    display_order: 0,
  });

  const openCreateDialog = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', display_order: categories?.length || 0 });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      display_order: category.display_order,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCategory) {
      await updateCategory.mutateAsync({
        id: editingCategory.id,
        ...formData,
      });
    } else {
      await createCategory.mutateAsync(formData);
    }

    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deletingCategory) {
      await deleteCategory.mutateAsync(deletingCategory.id);
      setIsDeleteDialogOpen(false);
      setDeletingCategory(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title="Categorias"
        description="Gerencie as categorias do seu cardápio"
      />

      <div className="flex-1 p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            {categories?.length || 0} categorias cadastradas
          </p>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Categoria
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : categories?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <LayoutGrid className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhuma categoria
            </h3>
            <p className="text-muted-foreground mb-4">
              Comece criando sua primeira categoria
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Categoria
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {categories?.map((category, index) => (
              <div
                key={category.id}
                className="admin-card flex items-center justify-between animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      #{category.display_order + 1}
                    </span>
                    <h3 className="font-medium text-foreground">{category.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {category.item_count} {category.item_count === 1 ? 'item' : 'itens'}
                    </span>
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mt-1 ml-12">
                      {category.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(category)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteDialog(category)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Atualize as informações da categoria'
                : 'Adicione uma nova categoria ao cardápio'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da categoria *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Pratos Principais"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Uma breve descrição da categoria"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Ordem de exibição</Label>
              <Input
                id="order"
                type="number"
                min={0}
                value={formData.display_order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    display_order: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createCategory.isPending || updateCategory.isPending}
              >
                {(createCategory.isPending || updateCategory.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingCategory ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Ao excluir a categoria "{deletingCategory?.name}", todos os itens
              vinculados também serão excluídos. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCategory.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
