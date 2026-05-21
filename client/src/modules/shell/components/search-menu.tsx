import { useSearchWordSensesSimple } from '@/modules/dictionary/features/word-sense-list/use-search-word-senses-simple';
import { DictionaryRoutes } from '@/shared/constants';
import {
  RiArrowDownLine,
  RiArrowUpLine,
  RiCornerDownLeftLine,
} from '@remixicon/react';
import { CommandKeyBox } from '@shared/ui/common/command-key-box';
import { Badge } from '@shared/ui/shadcn/badge';
import { Button } from '@shared/ui/shadcn/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@shared/ui/shadcn/command';
import { Skeleton } from '@shared/ui/shadcn/skeleton';
import { useNavigate } from '@tanstack/react-router';
import { BookOpen, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const getBadgeColor = (pos: string) => {
  switch (pos?.toLowerCase()) {
    case 'n':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400';
    case 'v':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400';
    case 'adj':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400';
    case 'adv':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800/80 dark:text-gray-300';
  }
};

const getCefrBadgeColor = (level?: string | null) => {
  const l = level?.toUpperCase().trim();
  if (!l)
    return 'bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/50';
  if (l.startsWith('A'))
    return 'bg-green-100/80 text-green-800 dark:bg-green-900/40 dark:text-green-500 hover:bg-green-100 dark:hover:bg-green-900/50';
  if (l.startsWith('B'))
    return 'bg-orange-100/80 text-orange-800 dark:bg-orange-900/40 dark:text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/50';
  if (l.startsWith('C'))
    return 'bg-red-100/80 text-red-800 dark:bg-red-900/40 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50';
  return 'bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/50';
};

export function SearchMenu() {
  const [isSearchMenuOpen, setSearchMenuOpen] = useState(false);
  const [internalQuery, setInternalQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const navigate = useNavigate();

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(internalQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [internalQuery]);

  // Command+K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchMenuOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const {
    data: result,
    isLoading,
    isFetching,
  } = useSearchWordSensesSimple({
    query: debouncedQuery,
    top: 5,
    skip: 0,
  });

  const searchResults = result?.data || [];
  const showLoading = isLoading || (isFetching && !searchResults.length);

  const handleSelectSense = (senseId: string) => {
    setSearchMenuOpen(false);
    navigate({
      to: DictionaryRoutes.senseDetail(senseId),
    });
  };

  return (
    <>
      {/* Search Desktop */}
      <Button
        variant="outline"
        onClick={() => setSearchMenuOpen(true)}
        className="text-muted-foreground hidden h-9 w-64 lg:w-80 items-center justify-between gap-2 px-3 font-normal sm:flex hover:bg-muted/80 bg-muted/30 border-transparent transition-colors shadow-none"
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">Search for words...</span>
        </div>
        <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground hidden sm:flex shrink-0">
          ⌘K
        </kbd>
      </Button>

      {/* Search Mobile */}
      <Button
        size="icon"
        variant="ghost"
        className="sm:hidden"
        onClick={() => setSearchMenuOpen(true)}
      >
        <Search className="h-5 w-5" />
        <span className="sr-only">Search</span>
      </Button>

      <CommandDialog open={isSearchMenuOpen} onOpenChange={setSearchMenuOpen}>
        <CommandInput
          className="w-lg"
          placeholder="Search for English words..."
          value={internalQuery}
          onValueChange={setInternalQuery}
        />

        <CommandList className="overflow-visible max-h-[calc(100vh-10rem)]">
          {debouncedQuery && !showLoading && searchResults.length === 0 && (
            <CommandEmpty>No words found for "{debouncedQuery}".</CommandEmpty>
          )}
          {showLoading && (
            <CommandGroup heading="Searching..." className="py-3!">
              <div className="mt-1.5 flex flex-col gap-1 px-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 py-3.5 px-2 rounded-xl border border-transparent"
                  >
                    {/* Fixed Icon Skeleton */}
                    <Skeleton className="mt-1 size-9 rounded-full shrink-0" />

                    {/* Right side content Skeleton */}
                    <div className="flex flex-col gap-2.5 w-full min-w-0 pr-1 mt-1">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-24 rounded" />
                        <Skeleton className="h-4 w-6 rounded" />
                      </div>
                      <div className="flex flex-col gap-1.5 w-full">
                        <Skeleton className="h-3 w-3/4 rounded" />
                        <Skeleton className="h-3 w-1/2 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CommandGroup>
          )}

          {debouncedQuery && searchResults.length > 0 && !showLoading && (
            <CommandGroup heading="Dictionary Results" className="py-3!">
              <div className="mt-1.5 flex flex-col gap-1">
                {searchResults.map((sense) => (
                  <CommandItem
                    key={sense.senseId}
                    value={sense.wordText + ' ' + sense.senseId} // value needs to be unique and searchable by shadcn internal filter
                    onSelect={() => handleSelectSense(sense.senseId)}
                    className="flex items-start gap-3 py-3! px-2 cursor-pointer rounded-lg hover:bg-muted/80 aria-selected:bg-muted/80 transition-colors"
                  >
                    {/* Fixed Icon on the left */}
                    <div className="mt-0.5 flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary shrink-0">
                      <BookOpen className="size-4" />
                    </div>

                    {/* Right side content */}
                    <div className="flex flex-col gap-1 w-full min-w-0">
                      <div className="flex items-center gap-2 relative pr-10">
                        {/* Word string */}
                        <span className="font-semibold text-base text-foreground truncate">
                          {sense.wordText}
                        </span>

                        {/* CEFR Level Badge */}
                        {sense.cefrLevel && (
                          <Badge
                            variant="secondary"
                            className={`text-[10px] h-4 px-1 absolute right-0 shadow-none border-transparent cursor-default pointer-events-none ${getCefrBadgeColor(sense.cefrLevel)}`}
                          >
                            {sense.cefrLevel}
                          </Badge>
                        )}
                      </div>

                      {/* Bottom row: POS + Short definition */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground w-full">
                        <span
                          className={`text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-sm shrink-0 border border-current/20 ${getBadgeColor(sense.partOfSpeech)}`}
                        >
                          {sense.partOfSpeech}
                        </span>

                        <span className="line-clamp-1 italic text-xs">
                          {sense.definition || 'No definition available...'}
                        </span>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </div>
            </CommandGroup>
          )}

          {!debouncedQuery && (
            <>
              <CommandGroup heading="Suggestions" className="py-3!">
                <div className="mt-1.5 flex flex-col gap-1">
                  {['phenomenon', 'look forward to', 'out of the blue'].map(
                    (example) => (
                      <CommandItem
                        key={example}
                        value={example}
                        onSelect={() => setInternalQuery(example)}
                        className="py-2.5! cursor-pointer"
                      >
                        <Search className="size-4 mr-2 text-muted-foreground" />
                        <span>{example}</span>
                      </CommandItem>
                    ),
                  )}
                </div>
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          <CommandGroup className="py-3! border-t">
            <div className="flex justify-between items-center">
              <div className="hidden gap-3 md:flex px-2">
                <div className="flex items-center gap-2">
                  <CommandKeyBox>
                    <RiArrowUpLine className="size-4" />
                  </CommandKeyBox>
                  <CommandKeyBox>
                    <RiArrowDownLine className="size-4" />
                  </CommandKeyBox>
                  <span className="text-xs text-muted-foreground">
                    Navigate
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CommandKeyBox>
                    <RiCornerDownLeftLine className="size-4" />
                  </CommandKeyBox>
                  <span className="text-xs text-muted-foreground">Select</span>
                </div>
              </div>

              <div className="text-right text-xs text-muted-foreground">
                <span className="text-muted-foreground">Global Search</span>
              </div>
            </div>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
