import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Layers, Plus, Search, Trash2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/shadcn/dialog';
import { Separator } from '@/shared/ui/shadcn/separator';
import {
  DsBadge,
  DsButton,
  DsInput,
  DsSelect,
  DsSelectItem,
  DsSpinner,
  DsTextarea,
} from '@/shared/ui';
import {
  useCreateFlashcard,
  useDeleteFlashcard,
  useFlashcards,
} from '../hooks/use-flashcards';
import type { FlashcardResponse } from '../types';

export const Route = createFileRoute('/_(authenticated)/flashcards')({
  component: FlashcardsPage,
});

function FlashcardsPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCard, setNewCard] = useState({
    front: '',
    back: '',
    hint: '',
    notes: '',
    source: 'custom' as 'custom' | 'dictionary',
  });

  const { data: flashcardsData, isLoading } = useFlashcards();
  const createFlashcard = useCreateFlashcard();
  const deleteFlashcard = useDeleteFlashcard();

  const flashcards = flashcardsData?.data ?? [];
  const filteredCards = flashcards.filter(
    (card) =>
      card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.back.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const customCount = flashcards.filter((c) => c.source === 'custom').length;
  const dictCount = flashcards.filter((c) => c.source === 'dictionary').length;

  const handleCreateCard = async () => {
    if (!newCard.front.trim() || !newCard.back.trim()) return;
    await createFlashcard.mutateAsync({
      front: newCard.front,
      back: newCard.back,
      hint: newCard.hint || undefined,
      notes: newCard.notes || undefined,
      source: newCard.source,
    });
    setNewCard({ front: '', back: '', hint: '', notes: '', source: 'custom' });
    setIsCreateOpen(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Flashcards</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {isLoading ? (
              <span className="inline-flex items-center gap-1.5">
                <DsSpinner size="sm" /> Loading…
              </span>
            ) : (
              <>
                <span className="font-medium text-foreground">
                  {flashcards.length}
                </span>{' '}
                cards —{' '}
                <span className="font-medium text-foreground">
                  {customCount}
                </span>{' '}
                custom,{' '}
                <span className="font-medium text-foreground">{dictCount}</span>{' '}
                from dictionary
              </>
            )}
          </p>
        </div>
        <DsButton
          size="sm"
          leftIcon={<Plus className="size-3.5" />}
          onClick={() => setIsCreateOpen(true)}
        >
          {t('flashcards.create') || 'New Card'}
        </DsButton>
      </div>

      {/* Create dialog */}
      <CreateFlashcardDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        newCard={newCard}
        onNewCardChange={setNewCard}
        onSubmit={handleCreateCard}
        isSubmitting={createFlashcard.isPending}
      />

      <Separator />

      {/* ── Search ─────────────────────────────────────────────── */}
      <div className="py-4">
        <DsInput
          leadingIcon={<Search className="size-3.5" />}
          placeholder={t('flashcards.search_placeholder') || 'Search cards…'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 text-sm"
        />
      </div>

      {/* ── Column headers ─────────────────────────────────────── */}
      {!isLoading && filteredCards.length > 0 && (
        <div className="flex items-center gap-4 px-4 py-2">
          <span className="flex-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Front
          </span>
          <span className="flex-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Back
          </span>
          <span className="w-20 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Source
          </span>
          <span className="w-7" />
        </div>
      )}

      {/* ── Loading ─────────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <DsSpinner size="lg" className="text-muted-foreground" />
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────── */}
      {!isLoading && filteredCards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Layers className="h-7 w-7" />
          </div>
          <h2 className="mb-1 text-base font-semibold">
            {searchQuery
              ? 'No results'
              : t('flashcards.empty_title') || 'No flashcards yet'}
          </h2>
          <p className="mb-6 max-w-xs text-sm text-muted-foreground">
            {searchQuery
              ? `No cards match "${searchQuery}"`
              : t('flashcards.empty_subtitle') ||
                'Create your first flashcard to get started.'}
          </p>
          {!searchQuery && (
            <DsButton
              leftIcon={<Plus className="size-4" />}
              onClick={() => setIsCreateOpen(true)}
            >
              {t('flashcards.create_first') || 'Create First Card'}
            </DsButton>
          )}
        </div>
      )}

      {/* ── Card list ───────────────────────────────────────────── */}
      {!isLoading && filteredCards.length > 0 && (
        <div className="divide-y divide-border">
          <AnimatePresence mode="popLayout">
            {filteredCards.map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
              >
                <FlashcardRow
                  card={card}
                  onDelete={() => deleteFlashcard.mutateAsync(card.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/* ─── FlashcardRow ────────────────────────────────────────────── */

function FlashcardRow({
  card,
  onDelete,
}: {
  card: FlashcardResponse;
  onDelete: () => void;
}) {
  return (
    <div className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/30">
      {/* Front */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {card.front}
        </p>
        {card.hint && (
          <p className="mt-0.5 truncate text-xs text-amber-600 dark:text-amber-400">
            Hint: {card.hint}
          </p>
        )}
      </div>

      {/* Back */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm text-muted-foreground">{card.back}</p>
      </div>

      {/* Source badge */}
      <div className="w-20 shrink-0">
        <DsBadge
          variant={card.source === 'custom' ? 'outline' : 'secondary'}
          className="text-xs"
        >
          {card.source === 'custom' ? 'Custom' : 'Dictionary'}
        </DsBadge>
      </div>

      {/* Delete */}
      <DsButton
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 opacity-0 text-muted-foreground transition-opacity group-hover:opacity-100 hover:text-destructive"
        onClick={onDelete}
        aria-label="Delete card"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </DsButton>
    </div>
  );
}

/* ─── CreateFlashcardDialog ───────────────────────────────────── */

function CreateFlashcardDialog({
  open,
  onOpenChange,
  newCard,
  onNewCardChange,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newCard: {
    front: string;
    back: string;
    hint: string;
    notes: string;
    source: 'custom' | 'dictionary';
  };
  onNewCardChange: React.Dispatch<React.SetStateAction<typeof newCard>>;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <span className="hidden" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            {t('flashcards.create_title') || 'Create Flashcard'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 pt-2">
          <div className="grid gap-1.5">
            <label
              htmlFor="front"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              {t('flashcards.front') || 'Front (Question)'}
            </label>
            <DsTextarea
              id="front"
              placeholder={
                t('flashcards.front_placeholder') ||
                'Enter the question or term…'
              }
              value={newCard.front}
              onChange={(e) =>
                onNewCardChange({ ...newCard, front: e.target.value })
              }
              rows={2}
            />
          </div>
          <div className="grid gap-1.5">
            <label
              htmlFor="back"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              {t('flashcards.back') || 'Back (Answer)'}
            </label>
            <DsTextarea
              id="back"
              placeholder={
                t('flashcards.back_placeholder') ||
                'Enter the answer or definition…'
              }
              value={newCard.back}
              onChange={(e) =>
                onNewCardChange({ ...newCard, back: e.target.value })
              }
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label
                htmlFor="hint"
                className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                {t('flashcards.hint') || 'Hint (Optional)'}
              </label>
              <DsInput
                id="hint"
                placeholder="A helpful hint…"
                value={newCard.hint}
                onChange={(e) =>
                  onNewCardChange({ ...newCard, hint: e.target.value })
                }
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t('flashcards.source') || 'Source'}
              </label>
              <DsSelect
                value={newCard.source}
                onValueChange={(value) =>
                  onNewCardChange({
                    ...newCard,
                    source: value as 'custom' | 'dictionary',
                  })
                }
              >
                <DsSelectItem value="custom">Custom</DsSelectItem>
                <DsSelectItem value="dictionary">Dictionary</DsSelectItem>
              </DsSelect>
            </div>
          </div>
          <DsButton
            onClick={onSubmit}
            isLoading={isSubmitting}
            loadingLabel="Creating…"
            disabled={!newCard.front.trim() || !newCard.back.trim()}
            fullWidth
          >
            {t('flashcards.create_button') || 'Create Card'}
          </DsButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
