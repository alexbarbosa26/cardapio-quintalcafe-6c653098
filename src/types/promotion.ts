export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  badge_text: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}
