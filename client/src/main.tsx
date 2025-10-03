import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register enhanced service worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Register the enhanced service worker
      const registration = await navigator.serviceWorker.register('/sw-enhanced.js');
      console.log('✅ ServiceWorker registered:', registration.scope);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available, show update notification
              if (confirm('Nova versão disponível! Atualizar agora?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        }
      });

      // Handle controller change (after update)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      // Register for background sync if supported
      if ('sync' in window.ServiceWorkerRegistration.prototype) {
        (registration as any).sync?.register('background-sync').catch(console.warn);
      }

    } catch (error) {
      console.warn('❌ ServiceWorker registration failed:', error);
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
