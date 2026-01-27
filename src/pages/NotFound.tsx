import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChefHat, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
          <ChefHat className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">
          404
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          Página não encontrada
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to="/cardapio">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ver Cardápio
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/login">
              Área Administrativa
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
