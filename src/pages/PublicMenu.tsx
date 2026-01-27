import { useRef, useEffect, useState } from 'react';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useCategories } from '@/hooks/useCategories';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';
import { Loader2, ImageIcon, ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';
import defaultLogo from '@/assets/logo.png';

export default function PublicMenu() {
  const {
    data: items,
    isLoading: loadingItems
  } = useMenuItems(true);
  const {
    data: categories,
    isLoading: loadingCategories
  } = useCategories();
  const { data: settings } = useRestaurantSettings();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const navRef = useRef<HTMLDivElement>(null);
  const isLoading = loadingItems || loadingCategories;

  const logoUrl = settings?.logo_url || defaultLogo;
  const restaurantName = settings?.name || 'Quintal Café e Doceria';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Filter categories that have active items
  const activeCategories = categories?.filter(cat => items?.some(item => item.category_id === cat.id));

  // Group items by category
  const groupedItems = activeCategories?.map(cat => ({
    ...cat,
    items: items?.filter(item => item.category_id === cat.id) || []
  }));

  // Scroll to category
  const scrollToCategory = (categoryId: string) => {
    const element = sectionRefs.current.get(categoryId);
    if (element) {
      const offset = 80; // Account for sticky nav
      const top = element.offsetTop - offset;
      window.scrollTo({
        top,
        behavior: 'smooth'
      });
    }
  };

  // Track active category on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      let currentCategory: string | null = null;
      sectionRefs.current.forEach((element, categoryId) => {
        if (element.offsetTop <= scrollPosition) {
          currentCategory = categoryId;
        }
      });
      setActiveCategory(currentCategory);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [groupedItems]);

  // Set initial active category
  useEffect(() => {
    if (activeCategories?.length && !activeCategory) {
      setActiveCategory(activeCategories[0].id);
    }
  }, [activeCategories, activeCategory]);
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center border border-border">
              <img src={logoUrl} alt={restaurantName} className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">
              {restaurantName}
            </h1>
          </div>
        </div>

        {/* Category Navigation */}
        {activeCategories && activeCategories.length > 0 && <div ref={navRef} className="overflow-x-auto scrollbar-hide border-t border-border">
            <div className="flex gap-2 px-4 py-3 min-w-max">
              {activeCategories.map(category => <button key={category.id} onClick={() => scrollToCategory(category.id)} className={cn('category-chip whitespace-nowrap', activeCategory === category.id ? 'category-chip-active' : 'category-chip-inactive')}>
                  {category.name}
                </button>)}
            </div>
          </div>}
      </header>

      {/* Menu Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {!groupedItems?.length ? <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <ChefHat className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-2">
              Cardápio em breve
            </h2>
            <p className="text-muted-foreground">
              Estamos preparando delícias para você!
            </p>
          </div> : <div className="space-y-10">
            {groupedItems.map((category, catIndex) => <section key={category.id} ref={el => {
          if (el) sectionRefs.current.set(category.id, el);
        }} className="animate-fade-in" style={{
          animationDelay: `${catIndex * 100}ms`
        }}>
                <div className="mb-5">
                  <h2 className="text-2xl font-display font-bold text-[#c4423b]">
                    {category.name}
                  </h2>
                  {category.description && <p className="text-muted-foreground mt-1">
                      {category.description}
                    </p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {category.items.map((item, itemIndex) => <article key={item.id} className="menu-card p-4 flex gap-4 animate-fade-in" style={{
              animationDelay: `${catIndex * 100 + itemIndex * 50}ms`
            }}>
                      {item.image_url ? <img src={item.image_url} alt={item.name} className="w-24 h-24 md:w-28 md:h-28 rounded-xl object-cover flex-shrink-0" loading="lazy" /> : <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="w-10 h-10 text-muted-foreground" />
                        </div>}

                      <div className="flex-1 min-w-0 flex flex-col">
                        <h3 className="font-semibold text-foreground text-lg">
                          {item.name}
                        </h3>
                        {item.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2 flex-1">
                            {item.description}
                          </p>}
                        <p className="text-xl font-bold mt-2 text-[#65221f]">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </article>)}
                </div>
              </section>)}
          </div>}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6 text-center">
        <p className="text-sm text-muted-foreground">Cardápio Digital • Powered by {restaurantName}</p>
      </footer>
    </div>;
}