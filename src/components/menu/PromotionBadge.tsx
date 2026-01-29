import { Tag } from 'lucide-react';

interface PromotionBadgeProps {
  text: string;
  className?: string;
}

export function PromotionBadge({ text, className = '' }: PromotionBadgeProps) {
  return (
    <span 
      className={`
        inline-flex items-center gap-1 
        px-2 py-0.5 
        bg-promotion text-promotion-foreground 
        rounded-full text-xs font-semibold 
        shadow-sm
        ${className}
      `}
    >
      <Tag className="w-3 h-3" />
      {text}
    </span>
  );
}
