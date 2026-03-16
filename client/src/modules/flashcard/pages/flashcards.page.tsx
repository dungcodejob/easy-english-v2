import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Trash2, Edit2, BookOpen, Layers } from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/card';
import { Input } from '@/shared/ui/shadcn/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/shadcn/dialog';
import { Label } from '@/shared/ui/shadcn/label';
import { Textarea } from '@/shared/ui/shadcn/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/select';
import {
  useFlashcards,
  useCreateFlashcard,
  useDeleteFlashcard,
} from '../hooks/use-flashcards';
import { Spinner } from '@/shared/ui/shadcn/spinner';
import type { FlashcardResponse } from '../types';

export const Route = createFileRoute('/_(authenticated)/flashcards')({
  component: FlashcardsPage,
});

function FlashcardsPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<FlashcardResponse | null>(null);
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
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('flashcards.title') || 'My Flashcards'}</h1>
          <p className="text-muted-foreground mt-1">
            {t('flashcards.subtitle') || `${flashcards.length} cards in your collection`}
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              {t('flashcards.create') || 'Create Card'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('flashcards.create_title') || 'Create New Flashcard'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="front">{t('flashcards.front') || 'Front (Question)'}</Label>
                <Textarea
                  id="front"
                  placeholder={t('flashcards.front_placeholder') || 'Enter the question or term...'}
                  value={newCard.front}
                  onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="back">{t('flashcards.back') || 'Back (Answer)'}</Label>
                <Textarea
                  id="back"
                  placeholder={t('flashcards.back_placeholder') || 'Enter the answer or definition...'}
                  value={newCard.back}
                  onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hint">{t('flashcards.hint') || 'Hint (Optional)'}</Label>
                <Input
                  id="hint"
                  placeholder={t('flashcards.hint_placeholder') || 'A helpful hint...'}
                  value={newCard.hint}
                  onChange={(e) => setNewCard({ ...newCard, hint: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="source">{t('flashcards.source') || 'Source'}</Label>
                <Select
                  value={newCard.source}
                  onValueChange={(value: 'custom' | 'dictionary') =>
                    setNewCard({ ...newCard, source: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">{t('flashcards.source_custom') || 'Custom'}</SelectItem>
                    <SelectItem value="dictionary">{t('flashcards.source_dictionary') || 'From Dictionary'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleCreateCard}
                disabled={!newCard.front.trim() || !newCard.back.trim() || createFlashcard.isPending}
                className="w-full mt-2"
              >
                {createFlashcard.isPending ? <Spinner className="size-4 mr-2" /> : null}
                {t('flashcards.create_button') || 'Create Flashcard'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder={t('flashcards.search_placeholder') || 'Search flashcards...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {t('flashcards.total') || 'Total Cards'}
            </CardTitle>
            <Layers className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flashcards.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
              {t('flashcards.custom') || 'Custom Cards'}
            </CardTitle>
            <BookOpen className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flashcards.filter((c) => c.source === 'custom').length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400">
              {t('flashcards.dictionary') || 'From Dictionary'}
            </CardTitle>
            <BookOpen className="size-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flashcards.filter((c) => c.source === 'dictionary').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flashcard List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="size-8" />
        </div>
      ) : filteredCards.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Layers className="size-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">{t('flashcards.empty_title') || 'No flashcards yet'}</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-4">
              {t('flashcards.empty_subtitle') || 'Create your first flashcard to get started'}
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="size-4 mr-2" />
              {t('flashcards.create_first') || 'Create First Card'}
            </Button>
          </CardContent>
        </Card>
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
                <Card className="group hover:shadow-md transition-all duration-200">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{card.front}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          card.source === 'custom'
                            ? 'bg-green-500/10 text-green-600'
                            : 'bg-purple-500/10 text-purple-600'
                        }`}>
                          {card.source}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{card.back}</p>
                      {card.hint && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <span className="text-amber-500">Hint:</span> {card.hint}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteCard(card.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
