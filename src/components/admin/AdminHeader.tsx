import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminHeaderProps {
  title: string;
  description?: string;
}

export function AdminHeader({ title, description }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <div>
            <h1 className="text-lg md:text-xl font-display font-semibold text-foreground">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground hidden md:block">
                {description}
              </p>
            )}
          </div>
        </div>

        <Button variant="outline" size="sm" asChild>
          <Link to="/cardapio" target="_blank">
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver Cardápio
          </Link>
        </Button>
      </div>
    </header>
  );
}
