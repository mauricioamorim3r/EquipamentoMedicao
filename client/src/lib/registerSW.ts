// Registro do Service Worker

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker não é suportado neste navegador');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service Worker registrado com sucesso:', registration.scope);

    // Verifica atualizações
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('Nova versão do Service Worker encontrada');

      newWorker?.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('Nova versão disponível - recarregue a página');

          // Notifica o usuário sobre a atualização
          if (confirm('Nova versão disponível! Deseja atualizar agora?')) {
            window.location.reload();
          }
        }
      });
    });

    // Verifica atualizações periodicamente (a cada hora)
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);

  } catch (error) {
    console.error('Erro ao registrar Service Worker:', error);
  }
}

// Verifica se está online/offline
export function setupOnlineStatusListeners() {
  window.addEventListener('online', () => {
    console.log('Aplicação online');
    showNotification('Você está online novamente!', 'success');
  });

  window.addEventListener('offline', () => {
    console.log('Aplicação offline');
    showNotification('Você está offline. Algumas funcionalidades podem não estar disponíveis.', 'warning');
  });
}

function showNotification(message: string, type: 'success' | 'warning') {
  // Implementar toast notification aqui
  console.log(`[${type.toUpperCase()}] ${message}`);
}

// PWA Install Prompt
let deferredPrompt: any = null;

export function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Previne o prompt automático
    e.preventDefault();
    deferredPrompt = e;

    console.log('PWA pode ser instalado');
    // Mostrar botão de instalação customizado
    showInstallButton();
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA instalado com sucesso');
    deferredPrompt = null;
  });
}

export async function promptInstall() {
  if (!deferredPrompt) {
    console.log('Prompt de instalação não disponível');
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;

  console.log(`Usuário ${outcome === 'accepted' ? 'aceitou' : 'recusou'} a instalação`);
  deferredPrompt = null;

  return outcome === 'accepted';
}

function showInstallButton() {
  // Implementar UI para botão de instalação
  console.log('Exibir botão de instalação do PWA');
}
