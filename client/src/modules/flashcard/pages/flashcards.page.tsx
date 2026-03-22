/**
 * FlashcardsPage — Flashcard module
 *
 * UI: 100% delegated to Design System components.
 * Business logic: unchanged.
 */

import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, Layers, Plus, Search, Trash2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/shadcn/dialog';
import {
  DsBadge,
  DsButton,
  DsCard,
  DsEmptyState,
  DsInput,
  DsSelect,
  DsSelectItem,
  DsStatCard,
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

  const handleDeleteCard = async (id: string) => {
    await deleteFlashcard.mutateAsync(id);
  };

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6 pb-10 mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('flashcards.title') || 'My Flashcards'}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t('flashcards.subtitle') || `${flashcards.length} cards in your collection`}
          </p>
        </div>

        <DsButton
          leftIcon={<Plus />}
          onClick={() => setIsCreateOpen(true)}
        >
          {t('flashcards.create') || 'Create Card'}
        </DsButton>
      </div>

      {/* Create Card Dialog */}
      <CreateFlashcardDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        newCard={newCard}
        onNewCardChange={setNewCard}
        onSubmit={handleCreateCard}
        isSubmitting={createFlashcard.isPending}
      />

      {/* Search */}
      <DsInput
        leadingIcon={<Search />}
        placeholder={t('flashcards.search_placeholder') || 'Search flashcards...'}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <DsStatCard
          label={t('flashcards.total') || 'Total Cards'}
          value={flashcards.length}
          icon={<Layers />}
          color="blue"
        />
        <DsStatCard
          label={t('flashcards.custom') || 'Custom Cards'}
          value={flashcards.filter((c) => c.source === 'custom').length}
          icon={<BookOpen />}
          color="green"
        />
        <DsStatCard
          label={t('flashcards.dictionary') || 'From Dictionary'}
          value={flashcards.filter((c) => c.source === 'dictionary').length}
          icon={<BookOpen />}
          color="purple"
        />
      </div>

      {/* Flashcard List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <svg
            className="size-8 animate-spin text-muted-foreground"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : filteredCards.length === 0 ? (
        <DsEmptyState
          icon={<Layers />}
          title={t('flashcards.empty_title') || 'No flashcards yet'}
          description={
            t('flashcards.empty_subtitle') ||
            'Create your first flashcard to get started'
          }
          action={
            <DsButton
              leftIcon={<Plus />}
              onClick={() => setIsCreateOpen(true)}
            >
              {t('flashcards.create_first') || 'Create First Card'}
            </DsButton>
          }
        />
      ) : (
        <div className="grid gap-3">
          <AnimatePresence mode="popLayout">
            {filteredCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <FlashcardItem
                  card={card}
                  onDelete={() => handleDeleteCard(card.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────────── */

function FlashcardItem({
  card,
  onDelete,
}: {
  card: FlashcardResponse;
  onDelete: () => void;
}) {
  return (
    <DsCard className="group hover:shadow-md transition-all duration-200">
      <DsCard.Content className="flex items-center justify-between p-4">
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <span className="truncate font-medium">{card.front}</span>
            <DsBadge
              variant={card.source === 'custom' ? 'success' : 'secondary'}
            >
              {card.source}
            </DsBadge>
          </div>
          <p className="truncate text-sm text-muted-foreground">{card.back}</p>
          {card.hint && (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <span className="text-amber-500">Hint:</span> {card.hint}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <DsButton
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 />
          </DsButton>
        </div>
      </DsCard.Content>
    </DsCard>
  );
}

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
  newCard: { front: string; back: string; hint: string; notes: string; source: 'custom' | 'dictionary' };
  onNewCardChange: React.Dispatch<React.SetStateAction<typeof newCard>>;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {/* Triggered externally via isCreateOpen state — this element is hidden */}
        <span />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {t('flashcards.create_title') || 'Create New Flashcard'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="front" className="text-sm font-medium">
              {t('flashcards.front') || 'Front (Question)'}
            </label>
            <DsTextarea
              id="front"
              placeholder={t('flashcards.front_placeholder') || 'Enter the question or term...'}
              value={newCard.front}
              onChange={(e) => onNewCardChange({ ...newCard, front: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="back" className="text-sm font-medium">
              {t('flashcards.back') || 'Back (Answer)'}
            </label>
            <DsTextarea
              id="back"
              placeholder={t('flashcards.back_placeholder') || 'Enter the answer or definition...'}
              value={newCard.back}
              onChange={(e) => onNewCardChange({ ...newCard, back: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="hint" className="text-sm font-medium">
              {t('flashcards.hint') || 'Hint (Optional)'}
            </label>
            <DsInput
              id="hint"
              placeholder={t('flashcards.hint_placeholder') || 'A helpful hint...'}
              value={newCard.hint}
              onChange={(e) => onNewCardChange({ ...newCard, hint: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">
              {t('flashcards.source') || 'Source'}
            </label>
            <DsSelect
              value={newCard.source}
              onValueChange={(value) =>
                onNewCardChange({ ...newCard, source: value as 'custom' | 'dictionary' })
              }
            >
              <DsSelectItem value="custom">
                {t('flashcards.source_custom') || 'Custom'}
              </DsSelectItem>
              <DsSelectItem value="dictionary">
                {t('flashcards.source_dictionary') || 'From Dictionary'}
              </DsSelectItem>
            </DsSelect>
          </div>
          <DsButton
            onClick={onSubmit}
            isLoading={isSubmitting}
            loadingLabel="Creating..."
            disabled={!newCard.front.trim() || !newCard.back.trim()}
            fullWidth
            className="mt-2"
          >
            {t('flashcards.create_button') || 'Create Flashcard'}
          </DsButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
