import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Login from "./pages/Login";
import PublicMenu from "./pages/PublicMenu";
import AdminLayout from "./layouts/AdminLayout";
import Categories from "./pages/admin/Categories";
import MenuItems from "./pages/admin/MenuItems";
import MenuPreview from "./pages/admin/MenuPreview";
import Settings from "./pages/admin/Settings";
import Promotions from "./pages/admin/Promotions";
import PromotionReports from "./pages/admin/PromotionReports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/cardapio" replace />} />
            <Route path="/cardapio" element={<PublicMenu />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/categorias" replace />} />
              <Route path="categorias" element={<Categories />} />
              <Route path="itens" element={<MenuItems />} />
              <Route path="promocoes" element={<Promotions />} />
              <Route path="promocoes/relatorios" element={<PromotionReports />} />
              <Route path="preview" element={<MenuPreview />} />
              <Route path="configuracoes" element={<Settings />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
