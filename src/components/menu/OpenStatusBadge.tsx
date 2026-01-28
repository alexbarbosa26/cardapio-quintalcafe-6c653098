import { WeeklyHours } from '@/hooks/useRestaurantSettings';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface OpenStatusBadgeProps {
  openingHours: WeeklyHours | null;
}

const DAY_MAP: Record<number, keyof WeeklyHours> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

function isRestaurantOpen(openingHours: WeeklyHours | null): boolean {
  if (!openingHours) return false;

  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const dayKey = DAY_MAP[dayOfWeek];
  const todayHours = openingHours[dayKey];
  
  if (!todayHours || todayHours.closed) return false;
  
  const { open, close } = todayHours;
  
  // Handle case where close time is after midnight
  if (close < open) {
    return currentTime >= open || currentTime <= close;
  }
  
  return currentTime >= open && currentTime <= close;
}

export function OpenStatusBadge({ openingHours }: OpenStatusBadgeProps) {
  const isOpen = isRestaurantOpen(openingHours);

  return (
    <Badge 
      variant={isOpen ? 'default' : 'secondary'}
      className={`gap-1.5 ${isOpen ? 'bg-green-600 hover:bg-green-700' : 'bg-destructive hover:bg-destructive/90'}`}
    >
      <Clock className="w-3 h-3" />
      {isOpen ? 'Aberto agora' : 'Fechado'}
    </Badge>
  );
}
