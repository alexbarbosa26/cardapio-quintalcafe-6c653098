import { useState, useEffect } from "react";
import { Download, Share, MoreVertical, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true
    );

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setIsInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  if (isStandalone || isInstalled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <img src={logo} alt="Quintal Café" className="w-24 h-24 mb-6 rounded-2xl" />
        <h1 className="text-2xl font-bold text-foreground mb-2">App instalado! ✅</h1>
        <p className="text-muted-foreground mb-6">
          O Quintal Café já está na sua tela inicial.
        </p>
        <Button onClick={() => (window.location.href = "/cardapio")} className="w-full max-w-xs">
          Abrir Cardápio
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <img src={logo} alt="Quintal Café" className="w-28 h-28 mb-6 rounded-2xl shadow-lg" />
      <h1 className="text-2xl font-bold text-foreground mb-2 text-center">
        Instale o Quintal Café
      </h1>
      <p className="text-muted-foreground text-center mb-8 max-w-sm">
        Tenha nosso cardápio sempre à mão, com acesso rápido direto da tela inicial do seu celular.
      </p>

      {isIOS ? (
        <div className="w-full max-w-sm bg-card rounded-xl border p-5 space-y-4">
          <h2 className="font-semibold text-foreground text-center">Como instalar no iPhone/iPad</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">1</div>
              <p className="text-sm text-foreground">
                Toque no botão <Share className="inline w-4 h-4 text-primary" /> <strong>Compartilhar</strong> na barra do Safari
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">2</div>
              <p className="text-sm text-foreground">
                Role para baixo e toque em <Plus className="inline w-4 h-4 text-primary" /> <strong>Adicionar à Tela de Início</strong>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">3</div>
              <p className="text-sm text-foreground">
                Toque em <strong>Adicionar</strong> para confirmar
              </p>
            </div>
          </div>
        </div>
      ) : deferredPrompt ? (
        <Button onClick={handleInstall} size="lg" className="w-full max-w-xs gap-2">
          <Download className="w-5 h-5" />
          Instalar App
        </Button>
      ) : (
        <div className="w-full max-w-sm bg-card rounded-xl border p-5 space-y-4">
          <h2 className="font-semibold text-foreground text-center">Como instalar no Android</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">1</div>
              <p className="text-sm text-foreground">
                Toque no menu <MoreVertical className="inline w-4 h-4 text-primary" /> do navegador
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">2</div>
              <p className="text-sm text-foreground">
                Selecione <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      <a
        href="/cardapio"
        className="mt-6 text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
      >
        Continuar no navegador <ChevronRight className="w-4 h-4" />
      </a>
    </div>
  );
};

export default Install;
