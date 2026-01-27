import { AdminHeader } from '@/components/admin/AdminHeader';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useCategories } from '@/hooks/useCategories';
import { Loader2, ImageIcon } from 'lucide-react';

export default function MenuPreview() {
  const { data: items, isLoading: loadingItems } = useMenuItems(true);
  const { data: categories, isLoading: loadingCategories } = useCategories();

  const isLoading = loadingItems || loadingCategories;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  // Group items by category
  const groupedItems = categories
    ?.filter((cat) => items?.some((item) => item.category_id === cat.id))
    .map((cat) => ({
      ...cat,
      items: items?.filter((item) => item.category_id === cat.id) || [],
    }));

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title="Visualizar Cardápio"
        description="Prévia de como os clientes verão o cardápio"
      />

      <div className="flex-1 p-4 md:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : groupedItems?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              Nenhum item ativo para exibir. Adicione itens e marque-os como ativos.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            {groupedItems?.map((category, catIndex) => (
              <section
                key={category.id}
                className="animate-fade-in"
                style={{ animationDelay: `${catIndex * 100}ms` }}
              >
                <div className="mb-4">
                  <h2 className="text-2xl font-display font-bold text-menu-category">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {category.items.map((item, itemIndex) => (
                    <div
                      key={item.id}
                      className="menu-card p-4 flex gap-4 animate-fade-in"
                      style={{ animationDelay: `${(catIndex * 100) + (itemIndex * 50)}ms` }}
                    >
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <p className="text-lg font-semibold text-menu-price mt-2">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
