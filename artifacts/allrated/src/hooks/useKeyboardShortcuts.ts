import { useEffect, useRef } from 'react';

interface Shortcuts {
  onPlayPause?: () => void;
  onFullscreen?: () => void;
  onMute?: () => void;
  onSeekForward?: () => void;
  onSeekBackward?: () => void;
  onVolumeUp?: () => void;
  onVolumeDown?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcuts) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target.isContentEditable
      ) return;

      const s = shortcutsRef.current;
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          s.onPlayPause?.();
          break;
        case 'f':
          e.preventDefault();
          s.onFullscreen?.();
          break;
        case 'm':
          e.preventDefault();
          s.onMute?.();
          break;
        case 'arrowright':
        case 'l':
          e.preventDefault();
          s.onSeekForward?.();
          break;
        case 'arrowleft':
        case 'j':
          e.preventDefault();
          s.onSeekBackward?.();
          break;
        case 'arrowup':
          e.preventDefault();
          s.onVolumeUp?.();
          break;
        case 'arrowdown':
          e.preventDefault();
          s.onVolumeDown?.();
          break;
        case 'n':
          e.preventDefault();
          s.onNext?.();
          break;
        case 'p':
          e.preventDefault();
          s.onPrev?.();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
