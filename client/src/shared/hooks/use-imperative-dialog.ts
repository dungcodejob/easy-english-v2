/**
 * useImperativeDialog — Imperative API for dialogs via ref.
 *
 * Exposes `.open(data?)` and `.close()` on a ref so parents can
 * control a dialog without managing open/data state themselves.
 *
 * Works with React 19's ref-as-prop (no forwardRef needed).
 *
 * ─── Usage (dialog component) ────────────────────────────────
 *
 *   interface MyDialogProps {
 *     ref?: React.Ref<DialogHandle<Item>>;
 *     trigger?: React.ReactNode;
 *   }
 *
 *   function MyDialog({ ref, trigger }: MyDialogProps) {
 *     const { open, data, close, dialogProps } = useImperativeDialog<Item>(ref);
 *     // open   = boolean
 *     // data   = Item | undefined (undefined → create mode)
 *     // close  = () => void
 *     // dialogProps = { open, onOpenChange } spread onto <Dialog>
 *     ...
 *   }
 *
 * ─── Usage (parent — imperative) ─────────────────────────────
 *
 *   const ref = useRef<DialogHandle<Item>>(null);
 *
 *   <button onClick={() => ref.current?.open(item)}>Edit</button>
 *   <button onClick={() => ref.current?.open()}>Create</button>
 *   <MyDialog ref={ref} />
 *
 * ─── Usage (parent — trigger, uncontrolled) ──────────────────
 *
 *   <MyDialog trigger={<button>New</button>} />
 *
 * Both patterns work on the same component — the hook detects
 * whether a ref is attached and acts accordingly.
 */

import { useCallback, useImperativeHandle, useState } from 'react';

// ── Public handle type ──────────────────────────────────────────

export interface DialogHandle<TData = void> {
  open: (data?: TData) => void;
  close: () => void;
}

// ── Hook return ─────────────────────────────────────────────────

interface ImperativeDialogState<TData> extends DialogHandle<TData> {
  /** Whether the dialog is currently visible. */
  isOpen: boolean;
  /** Data passed via `.open(data)`. `undefined` when opened without data. */
  data: TData | undefined;
  /** Convenience spread for `<Dialog open={…} onOpenChange={…}>`. */
  dialogProps: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  };
}

// ── Hook ────────────────────────────────────────────────────────

export function useImperativeDialog<TData = void>(
  ref?: React.Ref<DialogHandle<TData>>,
): ImperativeDialogState<TData> {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<TData | undefined>(undefined);

  const open = useCallback((d?: TData) => {
    setData(d);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(undefined);
  }, []);

  // Expose imperative handle when a ref is attached
  useImperativeHandle(ref, () => ({ open, close }), [open, close]);

  const onOpenChange = useCallback(
    (value: boolean) => {
      if (!value) close();
      else setIsOpen(true);
    },
    [close],
  );

  return {
    isOpen,
    data,
    open,
    close,
    dialogProps: { open: isOpen, onOpenChange },
  };
}
