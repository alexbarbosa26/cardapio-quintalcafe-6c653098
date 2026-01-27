export interface Category {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface MenuItemWithCategory extends MenuItem {
  categories?: Category;
}
