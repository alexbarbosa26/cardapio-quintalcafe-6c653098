import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, ImageIcon } from 'lucide-react';
import { MenuItem } from '@/types/menu';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  items: MenuItem[];
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function ItemDetailModal({
  isOpen,
  onClose,
  item,
  items,
  onNavigate,
}: ItemDetailModalProps) {
  if (!item) return null;

  const currentIndex = items.findIndex(i => i.id === item.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < items.length - 1;

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => hasNext && onNavigate('next'),
    onSwipeRight: () => hasPrev && onNavigate('prev'),
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-card">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Navigation arrows */}
        {hasPrev && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
            onClick={() => onNavigate('prev')}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        )}
        {hasNext && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
            onClick={() => onNavigate('next')}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        )}

        <div className="flex flex-col" {...swipeHandlers}>
          {/* Image */}
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-64 sm:h-80 object-cover"
            />
          ) : (
            <div className="w-full h-64 sm:h-80 bg-muted flex items-center justify-center">
              <ImageIcon className="w-16 h-16 text-muted-foreground" />
            </div>
          )}

          {/* Content */}
          <div className="p-6 space-y-3">
            <h2 className="text-2xl font-display font-bold text-foreground">
              {item.name}
            </h2>
            
            {item.description && (
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            )}

            <p className="text-2xl font-bold text-[#65221f]">
              {formatPrice(item.price)}
            </p>

            {/* Pagination indicator */}
            <p className="text-sm text-muted-foreground text-center pt-2">
              {currentIndex + 1} de {items.length}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
