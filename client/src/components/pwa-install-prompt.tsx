import { useState, useEffect } from 'react';
import { usePWA, useDeviceInfo } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PWAInstallPrompt() {
  const { isInstallable, promptInstall } = usePWA();
  const { isMobile, isIOS } = useDeviceInfo();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Auto-show após 10 segundos se não foi dispensado
  const [showAutoPrompt, setShowAutoPrompt] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Mostra prompt após 10 segundos
    const timer = setTimeout(() => {
      if (isInstallable && !isDismissed) {
        setShowAutoPrompt(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [isInstallable, isDismissed]);

  const handleInstall = async () => {
    setIsInstalling(true);
    const result = await promptInstall();

    if (result.accepted) {
      setShowAutoPrompt(false);
    }

    setIsInstalling(false);
  };

  const handleDismiss = () => {
    setShowAutoPrompt(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Não mostra se:
  // 1. Não é instalável
  // 2. Foi dispensado
  // 3. Não passou 10 segundos
  if (!isInstallable || isDismissed || !showAutoPrompt) {
    return null;
  }

  // Instruções específicas para iOS
  if (isIOS) {
    return (
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-in slide-in-from-bottom-5">
        <Card className="shadow-lg border-2 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Instalar SGM</CardTitle>
                  <CardDescription className="text-xs">
                    Acesse o app offline
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 -mr-2 -mt-1"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-3 text-sm space-y-2">
            <p className="text-muted-foreground">
              Para instalar no iOS:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
              <li>Toque no botão de compartilhar (⬆️)</li>
              <li>Role e selecione "Adicionar à Tela de Início"</li>
              <li>Toque em "Adicionar"</li>
            </ol>
          </CardContent>
          <CardFooter className="pt-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleDismiss}
            >
              Entendi
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Prompt padrão (Android/Desktop)
  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-in slide-in-from-bottom-5">
      <Card className="shadow-lg border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {isMobile ? (
                  <Smartphone className="w-5 h-5 text-primary" />
                ) : (
                  <Monitor className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <CardTitle className="text-base">Instalar SGM</CardTitle>
                <CardDescription className="text-xs">
                  Use offline e acesse rapidamente
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mr-2 -mt-1"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary" />
              <span className="text-xs">Funciona offline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary" />
              <span className="text-xs">Acesso rápido na tela inicial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary" />
              <span className="text-xs">Atualizações automáticas</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="gap-2 pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="flex-1"
          >
            Agora não
          </Button>
          <Button
            size="sm"
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex-1"
          >
            {isInstalling ? (
              <>Instalando...</>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Instalar
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Banner simples no topo (alternativa)
export function PWAInstallBanner() {
  const { isInstallable, promptInstall } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('pwa-banner-dismissed');
    if (dismissed) setIsDismissed(true);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
  };

  if (!isInstallable || isDismissed) return null;

  return (
    <div className="bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between gap-3 md:hidden">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Download className="w-4 h-4 flex-shrink-0" />
        <span className="text-xs truncate">Instale o app SGM</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          size="sm"
          variant="secondary"
          className="h-7 text-xs"
          onClick={promptInstall}
        >
          Instalar
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={handleDismiss}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
