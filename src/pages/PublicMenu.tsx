import { useRef, useEffect, useState } from 'react';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useCategories } from '@/hooks/useCategories';
import { useRestaurantSettings, WeeklyHours } from '@/hooks/useRestaurantSettings';
import { Loader2, ImageIcon, ChefHat, Phone, MapPin, Clock, Instagram, Facebook } from 'lucide-react';
import { cn } from '@/lib/utils';
import defaultLogo from '@/assets/logo.png';
import { ItemDetailModal } from '@/components/menu/ItemDetailModal';
import { MenuItem } from '@/types/menu';

const DAY_NAMES: Record<string, string> = {
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sábado',
  sunday: 'Domingo'
};

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

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
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // Open item detail modal
  const openItemDetail = (item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // Navigate between items in modal
  const navigateItem = (direction: 'prev' | 'next') => {
    if (!selectedItem || !items) return;
    const currentIndex = items.findIndex(i => i.id === selectedItem.id);
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < items.length) {
      setSelectedItem(items[newIndex]);
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
                  <h2 className="text-2xl font-display font-bold text-[#65221f]">
                    {category.name}
                  </h2>
                  {category.description && <p className="text-muted-foreground mt-1">
                      {category.description}
                    </p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {category.items.map((item, itemIndex) => (
                    <article 
                      key={item.id} 
                      className="menu-card p-4 flex gap-4 animate-fade-in cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all" 
                      style={{ animationDelay: `${catIndex * 100 + itemIndex * 50}ms` }}
                      onClick={() => openItemDetail(item)}
                    >
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-24 h-24 md:w-28 md:h-28 rounded-xl object-cover flex-shrink-0" 
                          loading="lazy" 
                        />
                      ) : (
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="w-10 h-10 text-muted-foreground" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 flex flex-col">
                        <h3 className="font-semibold text-foreground text-lg">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2 flex-1">
                            {item.description}
                          </p>
                        )}
                        <p className="text-xl font-bold mt-2 text-[#65221f]">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>)}
          </div>}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-8 bg-card">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Contact Info */}
            <div className="space-y-3">
              <h3 className="font-display font-semibold text-foreground text-lg">Contato</h3>
              {settings?.phone && (
                <a href={`tel:${settings.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Phone className="w-4 h-4" />
                  <span>{settings.phone}</span>
                </a>
              )}
              {settings?.whatsapp && (
                <a 
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>WhatsApp</span>
                </a>
              )}
              {settings?.address && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{settings.address}</span>
                </div>
              )}
            </div>

            {/* Social Media */}
            <div className="space-y-3">
              <h3 className="font-display font-semibold text-foreground text-lg">Redes Sociais</h3>
              <div className="flex gap-3">
                {settings?.instagram && (
                  <a 
                    href={settings.instagram.startsWith('http') ? settings.instagram : `https://instagram.com/${settings.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {settings?.facebook && (
                  <a 
                    href={settings.facebook.startsWith('http') ? settings.facebook : `https://facebook.com/${settings.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
              </div>
              {!settings?.instagram && !settings?.facebook && (
                <p className="text-sm text-muted-foreground">Nenhuma rede social configurada</p>
              )}
            </div>

            {/* Opening Hours */}
            <div className="space-y-3">
              <h3 className="font-display font-semibold text-foreground text-lg flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horário de Funcionamento
              </h3>
              {settings?.opening_hours ? (
                <ul className="space-y-1 text-sm">
                  {DAY_ORDER.map(day => {
                    const hours = (settings.opening_hours as WeeklyHours)?.[day as keyof WeeklyHours];
                    if (!hours) return null;
                    return (
                      <li key={day} className="flex justify-between text-muted-foreground">
                        <span>{DAY_NAMES[day]}</span>
                        <span className={hours.closed ? 'text-destructive' : ''}>
                          {hours.closed ? 'Fechado' : `${hours.open} - ${hours.close}`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Horários não configurados</p>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">Cardápio Digital • {restaurantName}</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      {settings?.whatsapp && (
        <a
          href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform animate-fade-in"
          aria-label="Contato via WhatsApp"
        >
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      )}

      {/* Item Detail Modal */}
      <ItemDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
        items={items || []}
        onNavigate={navigateItem}
      />
    </div>;
}