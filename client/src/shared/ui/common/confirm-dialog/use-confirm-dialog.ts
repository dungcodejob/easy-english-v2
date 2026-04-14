/**
 * useConfirm — Global imperative confirm dialog via Zustand.
 *
 * No provider needed. Any component can call `confirm()` and `await` the result.
 *
 * ─── Usage ──────────────────────────────────────────────────────
 *
 *   // 1. Mount once in your app root (e.g. root.tsx):
 *   import { ConfirmDialog } from '@/shared/ui/common/confirm-dialog';
 *   <ConfirmDialog />
 *
 *   // 2. Call from anywhere:
 *   const { confirm } = useConfirm();
 *
 *   const handleDelete = async () => {
 *     const ok = await confirm({
 *       title: 'Delete topic?',
 *       description: 'This action cannot be undone.',
 *       confirmText: 'Delete',
 *       destructive: true,
 *     });
 *     if (ok) deleteTopic(id);
 *   };
 */

import { create } from 'zustand';

// ── Types ───────────────────────────────────────────────────────

export interface ConfirmOptions {
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

interface ConfirmState {
  open: boolean;
  options: ConfirmOptions;
  resolver: ((value: boolean) => void) | null;

  confirm: (options: ConfirmOptions) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
}

// ── Store ───────────────────────────────────────────────────────

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  open: false,
  options: {},
  resolver: null,

  confirm: (options) => {
    return new Promise<boolean>((resolve) => {
      set({ open: true, options, resolver: resolve });
    });
  },

  handleConfirm: () => {
    get().resolver?.(true);
    set({ open: false, resolver: null });
  },

  handleCancel: () => {
    get().resolver?.(false);
    set({ open: false, resolver: null });
  },
}));

// ── Hook (convenience wrapper) ──────────────────────────────────

export function useConfirm() {
  const confirm = useConfirmStore((s) => s.confirm);
  return { confirm };
}
