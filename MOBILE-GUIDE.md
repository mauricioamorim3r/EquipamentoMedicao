# 📱 Guia de Funcionalidades Mobile - SGM

Este guia documenta todos os componentes e funcionalidades mobile implementados no Sistema de Gestão Metrológica.

---

## 🎯 **Navegação Mobile**

### **1. Bottom Navigation Bar**
Barra de navegação inferior que aparece em dispositivos < 768px

**Localização:** `client/src/components/mobile-nav.tsx`

**Atalhos principais:**
- 🏠 Dashboard
- 🔧 Equipamentos
- 📅 Calibrações
- 🔔 Notificações
- ≡ Menu (acessa todas as funcionalidades)

**Uso automático:** Aparece automaticamente em telas mobile

---

### **2. Mobile Drawer (Menu Lateral)**
Menu completo acessível via botão hamburger (☰) no header

**Localização:** `client/src/components/mobile-drawer.tsx`

**Funcionalidades:**
- Menu organizado por categorias
- Scroll suave
- Fecha automaticamente ao selecionar item
- Perfil do usuário na parte inferior

**Como abrir:**
```tsx
// Já integrado no Header - clique no ícone ☰
```

---

### **3. Página de Menu Completo**
Página `/menu` com todos os links em cards touch-friendly

**Localização:** `client/src/pages/mobile-menu.tsx`

**Acesso:** Clique em "Menu" na bottom navigation

---

## 🔄 **Pull to Refresh**

### **Hook: usePullToRefresh**
**Localização:** `client/src/hooks/usePullToRefresh.ts`

**Uso:**
```tsx
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

function MyComponent() {
  const handleRefresh = async () => {
    // Lógica de atualização
    await refetch();
  };

  const { containerRef, isPulling, isRefreshing, pullDistance } =
    usePullToRefresh({
      onRefresh: handleRefresh,
      threshold: 80,        // Distância mínima para refresh (px)
      resistance: 2.5,      // Resistência ao puxar
      enabled: true         // Ativa/desativa
    });

  return (
    <div ref={containerRef} className="overflow-y-auto">
      {/* Conteúdo */}
    </div>
  );
}
```

### **Componente: PullToRefresh**
**Localização:** `client/src/components/pull-to-refresh.tsx`

**Uso simplificado:**
```tsx
import { PullToRefresh } from '@/components/pull-to-refresh';

function MyPage() {
  const handleRefresh = async () => {
    await refetchData();
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} className="h-full">
      {/* Conteúdo da página */}
    </PullToRefresh>
  );
}
```

---

## 🎴 **Mobile Cards (Substituem Tabelas)**

### **Componente: MobileCard**
**Localização:** `client/src/components/mobile-card.tsx`

**Uso genérico:**
```tsx
import { MobileCard } from '@/components/mobile-card';
import { Wrench } from 'lucide-react';

<MobileCard
  title="Equipamento 001"
  subtitle="NS: 12345"
  icon={Wrench}
  badge={{
    label: 'OK',
    variant: 'default',
    className: 'bg-green-500'
  }}
  fields={[
    { label: 'Tipo', value: 'Transmissor de Pressão' },
    { label: 'Localização', value: 'Plataforma A' },
    { label: 'Calibração', value: '15/05/2025' }
  ]}
  onClick={() => navigate('/equipamento/001')}
  actions={
    <>
      <Button size="sm">Editar</Button>
      <Button size="sm" variant="outline">Deletar</Button>
    </>
  }
/>
```

### **Componente: EquipmentMobileCard**
Card pré-configurado para equipamentos:

```tsx
import { EquipmentMobileCard } from '@/components/mobile-card';

<EquipmentMobileCard
  tag="302-AT-001"
  numeroSerie="12345"
  tipo="Transmissor de Pressão"
  status="ok" // ok | proximo | alerta | critico | vencido
  proximaCalibracao="15/05/2025"
  localizacao="Plataforma A"
  onClick={() => navigate('/equipamento/001')}
/>
```

---

## 💀 **Loading Skeletons Mobile**

### **Componentes de Skeleton**
**Localização:** `client/src/components/mobile-skeleton.tsx`

**Componentes disponíveis:**

1. **MobileCardSkeleton** - Skeleton de um card
```tsx
import { MobileCardSkeleton } from '@/components/mobile-skeleton';

<MobileCardSkeleton />
```

2. **MobileSkeletonList** - Lista de skeletons
```tsx
import { MobileSkeletonList } from '@/components/mobile-skeleton';

<MobileSkeletonList count={5} />
```

3. **TableCardsSkeleton** - Responsivo (table desktop, cards mobile)
```tsx
import { TableCardsSkeleton } from '@/components/mobile-skeleton';

{isLoading ? (
  <TableCardsSkeleton count={3} />
) : (
  // Conteúdo real
)}
```

4. **DashboardStatsSkeleton** - Cards de estatísticas
```tsx
import { DashboardStatsSkeleton } from '@/components/mobile-skeleton';

{isLoading ? <DashboardStatsSkeleton /> : <DashboardStats />}
```

---

## 👆 **Swipe Gestures**

### **Hook: useSwipe**
**Localização:** `client/src/hooks/useSwipe.ts`

**Uso - Detectar direções:**
```tsx
import { useSwipe } from '@/hooks/useSwipe';

function MyComponent() {
  const { elementRef, isSwiping } = useSwipe({
    onSwipeLeft: () => console.log('Swipe esquerda'),
    onSwipeRight: () => console.log('Swipe direita'),
    onSwipeUp: () => console.log('Swipe cima'),
    onSwipeDown: () => console.log('Swipe baixo'),
    threshold: 50,  // Distância mínima
    enabled: true
  });

  return <div ref={elementRef}>Conteúdo swipeable</div>;
}
```

### **Hook: useSwipeToDelete**
Efeito de deletar deslizando (estilo iOS):

```tsx
import { useSwipeToDelete } from '@/hooks/useSwipe';

function ListItem({ onDelete }) {
  const { elementRef, swipeDistance, showDeleteButton } =
    useSwipeToDelete({
      onDelete,
      threshold: 100
    });

  return (
    <div ref={elementRef}>
      {/* Item com efeito de swipe */}
    </div>
  );
}
```

### **Componente: SwipeableCard**
Card com swipe-to-delete integrado:

```tsx
import { SwipeableCard } from '@/components/swipeable-card';

<SwipeableCard
  onDelete={() => handleDelete(item.id)}
  deleteLabel="Remover"
  enabled={true}
>
  <MobileCard {...itemData} />
</SwipeableCard>
```

### **Componente: SwipeableView**
Navegação entre telas com swipe (carrousel):

```tsx
import { SwipeableView } from '@/components/swipeable-card';

function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <SwipeableView
      currentIndex={currentIndex}
      onIndexChange={setCurrentIndex}
    >
      <div>Tela 1</div>
      <div>Tela 2</div>
      <div>Tela 3</div>
    </SwipeableView>
  );
}
```

---

## 📲 **PWA - Progressive Web App**

### **Hook: usePWA**
**Localização:** `client/src/hooks/usePWA.ts`

**Funcionalidades:**
```tsx
import { usePWA } from '@/hooks/usePWA';

function MyComponent() {
  const {
    isInstallable,  // Pode ser instalado
    isInstalled,    // Já está instalado
    isOnline,       // Status de conexão
    promptInstall   // Função para exibir prompt de instalação
  } = usePWA();

  return (
    <>
      {isInstallable && (
        <button onClick={promptInstall}>Instalar App</button>
      )}
      {!isOnline && <p>Você está offline</p>}
    </>
  );
}
```

### **Componente: PWAInstallPrompt**
**Localização:** `client/src/components/pwa-install-prompt.tsx`

**Comportamento:**
- Aparece automaticamente após 10 segundos
- Detecta iOS (mostra instruções específicas)
- Pode ser dispensado (salva no localStorage)
- Design responsivo

**Já integrado no App.tsx** - funciona automaticamente

### **Componente: PWAInstallBanner**
Banner simples no topo (alternativa):

```tsx
import { PWAInstallBanner } from '@/components/pwa-install-prompt';

// No App.tsx ou Layout
<PWAInstallBanner />
```

---

## 📶 **Indicador Offline/Online**

### **Componente: OfflineIndicator**
**Localização:** `client/src/components/offline-indicator.tsx`

Banner full-width indicando status de conexão:

```tsx
import { OfflineIndicator } from '@/components/offline-indicator';

// No App.tsx ou Layout principal
<OfflineIndicator />
```

**Comportamento:**
- ❌ Vermelho quando offline (permanente)
- ✅ Verde quando volta online (3 segundos)
- Animação de entrada suave

### **Componente: OnlineStatusBadge**
Badge sutil no header (já integrado):

```tsx
import { OnlineStatusBadge } from '@/components/offline-indicator';

<OnlineStatusBadge />
```

---

## 🔧 **Hooks Utilitários**

### **useIsMobile**
Detecta se está em mobile:

```tsx
import { useIsMobile } from '@/hooks/usePWA';

function MyComponent() {
  const isMobile = useIsMobile(); // true se < 768px

  return isMobile ? <MobileView /> : <DesktopView />;
}
```

### **useDeviceInfo**
Informações detalhadas do dispositivo:

```tsx
import { useDeviceInfo } from '@/hooks/usePWA';

function MyComponent() {
  const {
    isMobile,    // < 768px
    isTablet,    // 768px - 1024px
    isDesktop,   // >= 1024px
    isIOS,       // iPhone/iPad
    isAndroid,   // Android
    isSafari,    // Safari
    isChrome     // Chrome
  } = useDeviceInfo();

  return (
    <>
      {isIOS && <p>Instruções específicas para iOS</p>}
      {isAndroid && <p>Instruções para Android</p>}
    </>
  );
}
```

---

## 🎨 **Classes CSS Mobile**

### **Safe Area (Notch/Home Indicator)**
```css
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
.safe-area-top { padding-top: env(safe-area-inset-top); }
.safe-area-left { padding-left: env(safe-area-inset-left); }
.safe-area-right { padding-right: env(safe-area-inset-right); }
```

**Uso:**
```tsx
<div className="safe-area-bottom">
  {/* Conteúdo com espaço para home indicator */}
</div>
```

### **Dynamic Viewport Height**
```css
height: 100dvh; /* Ao invés de 100vh - evita problemas com barra de navegação mobile */
```

---

## 📋 **Exemplo Completo: Lista de Equipamentos Mobile**

```tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PullToRefresh } from '@/components/pull-to-refresh';
import { EquipmentMobileCard } from '@/components/mobile-card';
import { MobileSkeletonList } from '@/components/mobile-skeleton';
import { SwipeableCard } from '@/components/swipeable-card';
import { useIsMobile } from '@/hooks/usePWA';

function EquipmentList() {
  const isMobile = useIsMobile();

  const { data: equipment, isLoading, refetch } = useQuery({
    queryKey: ['equipment'],
    queryFn: fetchEquipment
  });

  const handleDelete = async (id: number) => {
    await deleteEquipment(id);
    refetch();
  };

  if (isLoading) {
    return <MobileSkeletonList count={5} />;
  }

  const content = (
    <div className="space-y-3">
      {equipment?.map((item) => (
        <SwipeableCard
          key={item.id}
          onDelete={() => handleDelete(item.id)}
          enabled={isMobile}
        >
          <EquipmentMobileCard
            tag={item.tag}
            numeroSerie={item.numeroSerie}
            tipo={item.tipo}
            status={item.status}
            proximaCalibracao={item.proximaCalibracao}
            localizacao={item.localizacao}
            onClick={() => navigate(`/equipamento/${item.id}`)}
          />
        </SwipeableCard>
      ))}
    </div>
  );

  return isMobile ? (
    <PullToRefresh onRefresh={refetch}>
      {content}
    </PullToRefresh>
  ) : (
    content
  );
}
```

---

## 🚀 **Service Worker**

**Localização:** `client/public/sw-enhanced.js`

**Funcionalidades:**
- ✅ Cache de assets estáticos
- ✅ Network First com fallback para cache
- ✅ Sincronização em background
- ✅ Notificações push (preparado)

**Registro automático em:** `client/src/main.tsx`

---

## 📱 **Instalação do PWA**

### **Android/Chrome**
1. Acesse o app
2. Aguarde prompt automático (10s) ou clique em "Instalar"
3. Confirme instalação

### **iOS/Safari**
1. Abra no Safari
2. Toque em "Compartilhar" (⬆️)
3. Selecione "Adicionar à Tela de Início"
4. Toque em "Adicionar"

### **Desktop/Chrome**
1. Clique no ícone de instalação na barra de endereços
2. Ou aguarde o prompt automático

---

## 🎯 **Checklist de Implementação**

Ao criar uma nova página mobile-friendly:

- [ ] Usar `PullToRefresh` para atualização
- [ ] Implementar `MobileCard` ao invés de tabelas
- [ ] Adicionar `MobileSkeletonList` durante loading
- [ ] Considerar `SwipeableCard` para ações de deletar
- [ ] Testar com `useIsMobile` para renderização condicional
- [ ] Aplicar `safe-area-bottom` se necessário
- [ ] Garantir touch targets de no mínimo 44px
- [ ] Usar `100dvh` ao invés de `100vh`
- [ ] Testar em Chrome DevTools modo mobile
- [ ] Testar instalação PWA

---

## 📞 **Suporte**

Para dúvidas ou melhorias, consulte:
- `CLAUDE.md` - Documentação geral do projeto
- Componentes em `client/src/components/`
- Hooks em `client/src/hooks/`

---

**Última atualização:** 2025-10-06
**Versão:** 1.0.0
