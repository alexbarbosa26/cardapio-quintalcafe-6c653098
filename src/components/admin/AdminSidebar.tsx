import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { 
  LayoutGrid, 
  UtensilsCrossed, 
  Eye, 
  LogOut,
  Settings,
  Tag,
  BarChart3
} from 'lucide-react';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';
import defaultLogo from '@/assets/logo.png';

const menuItems = [
  {
    title: 'Categorias',
    url: '/admin/categorias',
    icon: LayoutGrid,
  },
  {
    title: 'Itens do Cardápio',
    url: '/admin/itens',
    icon: UtensilsCrossed,
  },
  {
    title: 'Promoções',
    url: '/admin/promocoes',
    icon: Tag,
  },
  {
    title: 'Relatórios',
    url: '/admin/promocoes/relatorios',
    icon: BarChart3,
  },
  {
    title: 'Visualizar Cardápio',
    url: '/admin/preview',
    icon: Eye,
  },
  {
    title: 'Configurações',
    url: '/admin/configuracoes',
    icon: Settings,
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { data: settings } = useRestaurantSettings();

  const isActive = (path: string) => {
    if (path === '/admin/categorias' && location.pathname === '/admin') {
      return true;
    }
    return location.pathname === path;
  };

  const logoUrl = settings?.logo_url || defaultLogo;
  const restaurantName = settings?.name || 'Cardápio Digital';

  return (
    <Sidebar className="border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex items-center justify-center border border-border">
            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-sidebar-foreground text-sm">
              {restaurantName}
            </h2>
            <p className="text-xs text-muted-foreground truncate max-w-[140px]">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                  >
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={signOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
