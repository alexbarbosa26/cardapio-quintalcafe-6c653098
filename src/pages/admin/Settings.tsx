import { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useRestaurantSettings, useUpdateRestaurantSettings, useUploadLogo, WeeklyHours } from '@/hooks/useRestaurantSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Loader2, Upload, QrCode, Download, ImageIcon, Phone, MapPin, Instagram, Facebook, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import defaultLogo from '@/assets/logo.png';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
] as const;

const DEFAULT_HOURS: WeeklyHours = {
  monday: { open: '08:00', close: '18:00', closed: false },
  tuesday: { open: '08:00', close: '18:00', closed: false },
  wednesday: { open: '08:00', close: '18:00', closed: false },
  thursday: { open: '08:00', close: '18:00', closed: false },
  friday: { open: '08:00', close: '18:00', closed: false },
  saturday: { open: '08:00', close: '14:00', closed: false },
  sunday: { open: '', close: '', closed: true },
};

export default function Settings() {
  const { data: settings, isLoading } = useRestaurantSettings();
  const updateSettings = useUpdateRestaurantSettings();
  const uploadLogo = useUploadLogo();
  
  const [name, setName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#5a7a5a');
  const [secondaryColor, setSecondaryColor] = useState('#c4423b');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [openingHours, setOpeningHours] = useState<WeeklyHours>(DEFAULT_HOURS);
  
  const publicMenuUrl = `${window.location.origin}/cardapio`;

  useEffect(() => {
    if (settings) {
      setName(settings.name);
      setPrimaryColor(settings.primary_color || '#5a7a5a');
      setSecondaryColor(settings.secondary_color || '#c4423b');
      setPhone(settings.phone || '');
      setAddress(settings.address || '');
      setInstagram(settings.instagram || '');
      setFacebook(settings.facebook || '');
      setWhatsapp(settings.whatsapp || '');
      setOpeningHours(settings.opening_hours || DEFAULT_HOURS);
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
        phone: phone || null,
        address: address || null,
        instagram: instagram || null,
        facebook: facebook || null,
        whatsapp: whatsapp || null,
        opening_hours: openingHours,
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

  const updateDayHours = (day: keyof WeeklyHours, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      }
    }));
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
        <div className="grid gap-6 lg:grid-cols-2">
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

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Informações de Contato
              </CardTitle>
              <CardDescription>
                Adicione formas de contato para seus clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telefone
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="5511999999999 (apenas números com DDD)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Endereço
                </Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua Exemplo, 123 - Bairro, Cidade - UF"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@seurestaurante"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook" className="flex items-center gap-2">
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Label>
                <Input
                  id="facebook"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/seurestaurante"
                />
              </div>
            </CardContent>
          </Card>

          {/* Opening Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Horário de Funcionamento
              </CardTitle>
              <CardDescription>
                Configure os horários de abertura e fechamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {DAYS_OF_WEEK.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-28 text-sm font-medium">{label}</div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!openingHours[key].closed}
                      onCheckedChange={(checked) => updateDayHours(key, 'closed', !checked)}
                    />
                    <span className="text-xs text-muted-foreground w-14">
                      {openingHours[key].closed ? 'Fechado' : 'Aberto'}
                    </span>
                  </div>
                  {!openingHours[key].closed && (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={openingHours[key].open}
                        onChange={(e) => updateDayHours(key, 'open', e.target.value)}
                        className="w-24 h-8 text-sm"
                      />
                      <span className="text-muted-foreground">às</span>
                      <Input
                        type="time"
                        value={openingHours[key].close}
                        onChange={(e) => updateDayHours(key, 'close', e.target.value)}
                        className="w-24 h-8 text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={updateSettings.isPending}
            size="lg"
            className="min-w-[200px]"
          >
            {updateSettings.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Todas as Configurações'
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
