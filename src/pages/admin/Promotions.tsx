import { useState, useRef } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePromotions, useCreatePromotion, useUpdatePromotion, useDeletePromotion } from '@/hooks/usePromotions';
import { usePromotionItems, useLinkPromotionItem, useUnlinkPromotionItem, useUpdatePromotionItem } from '@/hooks/usePromotionItems';
import { useMenuItems, useUploadImage } from '@/hooks/useMenuItems';
import { Promotion } from '@/types/promotion';
import { Plus, Pencil, Trash2, Loader2, Tag, Upload, X, ImageIcon, Link2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Promotions() {
  const { data: promotions, isLoading } = usePromotions();
  const { data: menuItems } = useMenuItems();
  const createPromotion = useCreatePromotion();
  const updatePromotion = useUpdatePromotion();
  const deletePromotion = useDeletePromotion();
  const uploadImage = useUploadImage();
  const linkItem = useLinkPromotionItem();
  const unlinkItem = useUnlinkPromotionItem();
  const updatePromotionItem = useUpdatePromotionItem();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isItemsDialogOpen, setIsItemsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [deletingPromotion, setDeletingPromotion] = useState<Promotion | null>(null);
  const [linkingPromotion, setLinkingPromotion] = useState<Promotion | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: linkedItems, refetch: refetchLinkedItems } = usePromotionItems(linkingPromotion?.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    badge_text: 'Promoção',
    is_active: true,
    start_date: '',
    end_date: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      badge_text: 'Promoção',
      is_active: true,
      start_date: '',
      end_date: '',
    });
    setPreviewImage(null);
    setEditingPromotion(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      title: promotion.title,
      description: promotion.description || '',
      image_url: promotion.image_url || '',
      badge_text: promotion.badge_text || 'Promoção',
      is_active: promotion.is_active,
      start_date: promotion.start_date || '',
      end_date: promotion.end_date || '',
    });
    setPreviewImage(promotion.image_url);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (promotion: Promotion) => {
    setDeletingPromotion(promotion);
    setIsDeleteDialogOpen(true);
  };

  const openItemsDialog = (promotion: Promotion) => {
    setLinkingPromotion(promotion);
    setIsItemsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadImage.mutateAsync(file);
      setFormData({ ...formData, image_url: url });
      setPreviewImage(url);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image_url: '' });
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const promotionData = {
      title: formData.title,
      description: formData.description || null,
      image_url: formData.image_url || null,
      badge_text: formData.badge_text,
      is_active: formData.is_active,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    };

    if (editingPromotion) {
      await updatePromotion.mutateAsync({
        id: editingPromotion.id,
        ...promotionData,
      });
    } else {
      await createPromotion.mutateAsync(promotionData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (deletingPromotion) {
      await deletePromotion.mutateAsync(deletingPromotion.id);
      setIsDeleteDialogOpen(false);
      setDeletingPromotion(null);
    }
  };

  const handleToggleActive = async (promotion: Promotion) => {
    await updatePromotion.mutateAsync({
      id: promotion.id,
      is_active: !promotion.is_active,
    });
  };

  const handleToggleItem = async (menuItemId: string, isLinked: boolean) => {
    if (!linkingPromotion) return;

    if (isLinked) {
      await unlinkItem.mutateAsync({
        promotionId: linkingPromotion.id,
        menuItemId,
      });
    } else {
      await linkItem.mutateAsync({
        promotionId: linkingPromotion.id,
        menuItemId,
        discountType: 'percentage',
        discountValue: 0,
      });
    }
  };

  const handleUpdateDiscount = async (itemId: string, discountType: string, discountValue: number) => {
    await updatePromotionItem.mutateAsync({ id: itemId, discountType, discountValue });
  };

  const getCountdownText = (endDate: string) => {
    const days = differenceInDays(new Date(endDate), new Date());
    if (days < 0) return 'Expirada';
    if (days === 0) return 'Termina hoje';
    if (days === 1) return 'Termina amanhã';
    return `${days} dias restantes`;
  };

  const linkedItemIds = linkedItems?.map(item => item.menu_item_id) || [];

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title="Promoções"
        description="Gerencie promoções e destaques do cardápio"
      />

      <div className="flex-1 p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            {promotions?.length || 0} promoções cadastradas
          </p>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Promoção
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : promotions?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Tag className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhuma promoção cadastrada
            </h3>
            <p className="text-muted-foreground mb-4">
              Comece criando sua primeira promoção
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Promoção
            </Button>
          </div>
        ) : (
          <div className="admin-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Imagem</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Badge</TableHead>
                    <TableHead className="hidden md:table-cell">Período</TableHead>
                    <TableHead className="hidden sm:table-cell">Itens</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-32">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions?.map((promotion, index) => (
                    <TableRow
                      key={promotion.id}
                      className={cn(
                        !promotion.is_active && 'opacity-50',
                        'animate-fade-in'
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell>
                        {promotion.image_url ? (
                          <img
                            src={promotion.image_url}
                            alt={promotion.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{promotion.title}</p>
                          {promotion.end_date && (
                            <p className="text-xs text-muted-foreground">
                              {getCountdownText(promotion.end_date)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-promotion/20 text-promotion-foreground rounded-full text-xs font-medium">
                          {promotion.badge_text}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {promotion.start_date && promotion.end_date
                          ? `${format(new Date(promotion.start_date), 'dd/MM')} - ${format(new Date(promotion.end_date), 'dd/MM')}`
                          : promotion.start_date
                          ? `A partir de ${format(new Date(promotion.start_date), 'dd/MM')}`
                          : promotion.end_date
                          ? `Até ${format(new Date(promotion.end_date), 'dd/MM')}`
                          : 'Sem período'}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openItemsDialog(promotion)}
                          className="text-xs"
                        >
                          <Link2 className="w-3 h-3 mr-1" />
                          Vincular
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={promotion.is_active}
                          onCheckedChange={() => handleToggleActive(promotion)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(promotion)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(promotion)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPromotion ? 'Editar Promoção' : 'Nova Promoção'}
            </DialogTitle>
            <DialogDescription>
              {editingPromotion
                ? 'Atualize as informações da promoção'
                : 'Adicione uma nova promoção ao cardápio'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: 10% OFF em todos os pratos"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes da promoção..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="badge_text">Texto do Badge</Label>
              <Input
                id="badge_text"
                value={formData.badge_text}
                onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                placeholder="Ex: Promoção, Desconto, Novidade"
              />
              <p className="text-xs text-muted-foreground">
                Exibido em destaque nos itens vinculados
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Data Início</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Data Fim</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Imagem (opcional)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {previewImage ? (
                <div className="relative inline-block">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-32 h-32 rounded-lg object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 w-6 h-6"
                    onClick={removeImage}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full h-24 border-dashed"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-5 h-5" />
                      <span className="text-sm">Fazer upload de imagem</span>
                    </div>
                  )}
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <Label htmlFor="is_active" className="cursor-pointer">
                  Promoção ativa
                </Label>
                <p className="text-xs text-muted-foreground">
                  Promoções inativas não aparecem no cardápio
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
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
                disabled={createPromotion.isPending || updatePromotion.isPending}
              >
                {(createPromotion.isPending || updatePromotion.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingPromotion ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Link Items Dialog */}
      <Dialog open={isItemsDialogOpen} onOpenChange={setIsItemsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Vincular Itens à Promoção</DialogTitle>
            <DialogDescription>
              Selecione os itens e defina o desconto para "{linkingPromotion?.title}"
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {menuItems?.filter(item => item.is_active).map((item) => {
                const isLinked = linkedItemIds.includes(item.id);
                const linkedItem = linkedItems?.find(li => li.menu_item_id === item.id);
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "p-3 rounded-lg border transition-colors",
                      isLinked ? "border-primary/40 bg-primary/5" : "border-border hover:bg-muted"
                    )}
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => handleToggleItem(item.id, isLinked)}
                    >
                      <Checkbox
                        checked={isLinked}
                        onCheckedChange={() => handleToggleItem(item.id, isLinked)}
                      />
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.categories?.name} • {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>

                    {isLinked && linkedItem && (
                      <div className="mt-3 ml-8 flex items-center gap-2">
                        <select
                          className="text-xs border rounded px-2 py-1.5 bg-background"
                          value={linkedItem.discount_type || 'percentage'}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            handleUpdateDiscount(
                              linkedItem.id,
                              e.target.value,
                              linkedItem.discount_value || 0
                            );
                          }}
                        >
                          <option value="percentage">% Desconto</option>
                          <option value="fixed">R$ Desconto</option>
                        </select>
                        <Input
                          type="number"
                          min={0}
                          step={linkedItem.discount_type === 'percentage' ? 1 : 0.01}
                          className="w-24 h-8 text-xs"
                          placeholder="Valor"
                          value={linkedItem.discount_value || ''}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            handleUpdateDiscount(
                              linkedItem.id,
                              linkedItem.discount_type || 'percentage',
                              parseFloat(e.target.value) || 0
                            );
                          }}
                        />
                        {linkedItem.discount_value && linkedItem.discount_value > 0 && (
                          <span className="text-xs text-promotion font-medium whitespace-nowrap">
                            {linkedItem.discount_type === 'percentage'
                              ? `${formatPrice(item.price * (1 - (linkedItem.discount_value / 100)))}`
                              : `${formatPrice(Math.max(0, item.price - linkedItem.discount_value))}`
                            }
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button onClick={() => setIsItemsDialogOpen(false)}>
              Concluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir promoção?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deletingPromotion?.title}"? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePromotion.isPending && (
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
