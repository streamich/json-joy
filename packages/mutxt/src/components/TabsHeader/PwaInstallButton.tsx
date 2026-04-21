import * as React from 'react';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {Label} from '@jsonjoy.com/ui/lib/1-inline/Label';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{outcome: 'accepted' | 'dismissed'; platform: string}>;
  prompt(): Promise<void>;
}

const isStandaloneDisplay = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    !!(navigator as Navigator & {standalone?: boolean}).standalone
  );
};

export type PwaInstallButtonProps = {};

export const PwaInstallButton: React.FC<PwaInstallButtonProps> = () => {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = React.useState<boolean>(() => isStandaloneDisplay());

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      promptEvent.preventDefault();
      setDeferredPrompt(promptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => {
      if (isStandaloneDisplay()) {
        setInstalled(true);
        setDeferredPrompt(null);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  if (installed || !deferredPrompt) return null;

  const handleInstallClick = async () => {
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice.catch(() => null);
    setDeferredPrompt(null);
    if (choice?.outcome === 'accepted') setInstalled(true);
  };

  return (
    <BasicButton
      title="Install JSON CRDT Explorer as an app"
      width="auto"
      height={32}
      rounder
      compact
      onClick={() => void handleInstallClick()}
    >
      Install&nbsp;<Label>App</Label>
    </BasicButton>
  );
};
