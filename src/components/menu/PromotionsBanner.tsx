import { useState, useEffect, useCallback } from 'react';
import { usePromotions } from '@/hooks/usePromotions';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';
import { cn } from '@/lib/utils';

export function PromotionsBanner() {
  const { data: promotions, isLoading } = usePromotions(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const nextPromotion = useCallback(() => {
    if (!promotions?.length) return;
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
  }, [promotions?.length]);

  const prevPromotion = useCallback(() => {
    if (!promotions?.length) return;
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
  }, [promotions?.length]);

  // Auto-rotate promotions every 5 seconds
  useEffect(() => {
    if (!promotions?.length || promotions.length <= 1) return;

    const interval = setInterval(() => {
      nextPromotion();
    }, 5000);

    return () => clearInterval(interval);
  }, [promotions?.length, nextPromotion]);

  if (isLoading || !promotions?.length) {
    return null;
  }

  const currentPromotion = promotions[currentIndex];

  return (
    <div className="relative overflow-hidden">
      {/* Collapsed Banner */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full bg-gradient-to-r from-promotion to-amber-500 text-promotion-foreground",
          "px-4 py-3 flex items-center justify-between gap-3",
          "transition-all duration-300 hover:from-amber-500 hover:to-promotion",
          "shadow-sm"
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Sparkles className="w-4 h-4 flex-shrink-0 animate-pulse" />
          <span className="px-2 py-0.5 bg-white/30 rounded-full text-xs font-medium flex-shrink-0">
            {currentPromotion.badge_text}
          </span>
          <span className="font-medium truncate">{currentPromotion.title}</span>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {currentPromotion.end_date && (
            <CountdownTimer 
              endDate={currentPromotion.end_date} 
              className="hidden sm:flex bg-white/20 px-2 py-0.5 rounded-full"
            />
          )}
          
          {promotions.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevPromotion();
                }}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Promoção anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs opacity-75">
                {currentIndex + 1}/{promotions.length}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextPromotion();
                }}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Próxima promoção"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </button>

      {/* Expanded Content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out bg-gradient-to-b from-promotion/10 to-transparent",
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-4 space-y-3">
          {currentPromotion.end_date && (
            <div className="flex items-center gap-2 text-sm text-promotion-foreground">
              <span className="font-medium">Termina em:</span>
              <CountdownTimer endDate={currentPromotion.end_date} className="text-promotion" />
            </div>
          )}
          {currentPromotion.image_url && (
            <div className="relative w-full aspect-[3/1] rounded-lg overflow-hidden">
              <img
                src={currentPromotion.image_url}
                alt={currentPromotion.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {currentPromotion.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentPromotion.description}
            </p>
          )}
        </div>
      </div>

      {/* Progress Indicator for multiple promotions */}
      {promotions.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-promotion/20">
          <div
            className="h-full bg-promotion/60 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / promotions.length) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
