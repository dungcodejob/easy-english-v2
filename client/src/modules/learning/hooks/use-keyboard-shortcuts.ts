import { useCallback, useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import type { Rating } from '../pages/study-session.page';
import { useStudySessionStore } from '../stores/use-study-session-store';

const KEYBOARD_HINT_DURATION_MS = 5000;

export function useKeyboardShortcuts({
  onRate,
  onReset,
}: {
  onRate: (rating: Rating) => void;
  onReset: () => void;
}) {
  const [showKeyboardHint, setShowKeyboardHint] = useState(true);

  const store = useStudySessionStore();

  // Auto-hide keyboard hint
  useEffect(() => {
    if (!showKeyboardHint) return;
    const timer = setTimeout(
      () => setShowKeyboardHint(false),
      KEYBOARD_HINT_DURATION_MS,
    );
    return () => clearTimeout(timer);
  }, [showKeyboardHint]);

  const handleRate = useCallback(
    (rating: Rating) => {
      onRate(rating);
    },
    [onRate],
  );

  useHotkeys(
    'space',
    () => {
      store.flipCard();
      setShowKeyboardHint(false);
    },
    {
      preventDefault: true,
      enableOnFormTags: false,
    },
  );

  useHotkeys(
    '1, 2, 3, 4',
    (_, handler) => {
      handler.preventDefault?.();
      const rating = Number(handler.key) as Rating;
      handleRate(rating);
    },
    { enableOnFormTags: false },
  );

  useHotkeys(
    'esc',
    () => {
      onReset();
    },
    { preventDefault: true, enableOnFormTags: false },
  );

  return { showKeyboardHint, setShowKeyboardHint };
}
