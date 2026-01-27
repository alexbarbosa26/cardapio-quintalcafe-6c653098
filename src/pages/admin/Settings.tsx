import { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useRestaurantSettings, useUpdateRestaurantSettings, useUploadLogo } from '@/hooks/useRestaurantSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, QrCode, Download, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import defaultLogo from '@/assets/logo.png';

export default function Settings() {
  const { data: settings, isLoading } = useRestaurantSettings();
  const updateSettings = useUpdateRestaurantSettings();
  const uploadLogo = useUploadLogo();
  
  const [name, setName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#5a7a5a');
  const [secondaryColor, setSecondaryColor] = useState('#c4423b');
  
  const publicMenuUrl = `${window.location.origin}/cardapio`;

  useEffect(() => {
    if (settings) {
      setName(settings.name);
      setPrimaryColor(settings.primary_color || '#5a7a5a');
      setSecondaryColor(settings.secondary_color || '#c4423b');
    }
  }, [settings]);

  const handleSave = async () => {
    if (!settings?.id) return;
    
    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        name,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      });
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings?.id) return;

    try {
      await uploadLogo.mutateAsync({ file, settingsId: settings.id });
      toast.success('Logo atualizada com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer upload da logo');
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx?.drawImage(img, 0, 0, 512, 512);
      
      const link = document.createElement('a');
      link.download = 'qrcode-cardapio.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const logoUrl = settings?.logo_url || defaultLogo;

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader 
        title="Configurações" 
        description="Personalize seu restaurante" 
      />
      
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Restaurant Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Restaurante</CardTitle>
              <CardDescription>Configure o nome e a identidade visual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Restaurante</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do seu restaurante"
                />
              </div>

              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl border border-border overflow-hidden bg-muted flex items-center justify-center">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="logo-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
                        <Upload className="w-4 h-4" />
                        {uploadLogo.isPending ? 'Enviando...' : 'Alterar Logo'}
                      </div>
                    </Label>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                      disabled={uploadLogo.isPending}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#5a7a5a"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#c4423b"
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSave} 
                disabled={updateSettings.isPending}
                className="w-full"
              >
                {updateSettings.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Configurações'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                QR Code do Cardápio
              </CardTitle>
              <CardDescription>
                Imprima e coloque nas mesas para acesso rápido
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center p-6 bg-white rounded-xl border border-border">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={publicMenuUrl}
                  size={200}
                  level="H"
                  includeMargin
                  imageSettings={{
                    src: logoUrl,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
                <p className="mt-4 text-sm text-muted-foreground text-center break-all">
                  {publicMenuUrl}
                </p>
              </div>

              <Button 
                onClick={handleDownloadQR}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar QR Code
              </Button>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium text-sm mb-2">Dica de uso:</h4>
                <p className="text-sm text-muted-foreground">
                  Imprima o QR Code em tamanho adequado (mínimo 3x3cm) e 
                  coloque em locais visíveis como mesas, balcão ou vitrine.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
