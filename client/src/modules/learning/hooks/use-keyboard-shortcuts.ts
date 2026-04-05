import { useCallback, useEffect, useState } from 'react';
import { useHotkey } from '@features/hotkeys';
import { useHotkeyScope } from '@features/hotkeys';
import { useStudySessionStore } from '../stores/use-study-session-store';

const KEYBOARD_HINT_DURATION_MS = 5000;

type Rating = 1 | 2 | 3 | 4;

export function useKeyboardShortcuts({
  onRate,
  onReset,
}: {
  onRate: (rating: Rating) => void;
  onReset: () => void;
}) {
  const [showKeyboardHint, setShowKeyboardHint] = useState(true);
  const store = useStudySessionStore();

  // Push 'study-session' scope on mount, pop on unmount
  useHotkeyScope('study-session', { onMount: 'push' });

  // Auto-hide keyboard hint
  useEffect(() => {
    if (!showKeyboardHint) return;
    const timer = setTimeout(
      () => setShowKeyboardHint(false),
      KEYBOARD_HINT_DURATION_MS,
    );
    return () => clearTimeout(timer);
  }, [showKeyboardHint]);

  // Space — flip card
  useHotkey('Space', () => {
    store.flipCard();
    setShowKeyboardHint(false);
  }, {
    description: 'Flip card',
    group: 'Study',
    scope: 'study-session',
  });

  // 1/2/3/4 — rate card
  const handleRate = useCallback(
    (rating: Rating) => {
      onRate(rating);
    },
    [onRate],
  );

  for (const rating of [1, 2, 3, 4] as const) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useHotkey(String(rating), (event) => {
      event.preventDefault();
      handleRate(rating);
    }, {
      description: `Rate ${rating}`,
      group: 'Study',
      scope: 'study-session',
    });
  }

  // Escape — reset session
  useHotkey('Escape', () => {
    onReset();
  }, {
    description: 'Exit session',
    group: 'Study',
    scope: 'study-session',
  });

  return { showKeyboardHint, setShowKeyboardHint };
}
