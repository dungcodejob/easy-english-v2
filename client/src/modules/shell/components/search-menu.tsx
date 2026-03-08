import { useSearchWordSenses } from '@/modules/learning/hooks/use-search-word-senses';
import { APP_ROUTES } from '@/shared/constants';
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
import { useNavigate } from '@tanstack/react-router';
import { BookOpen, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  } = useSearchWordSenses({
    query: debouncedQuery,
    top: 5,
    skip: 0,
  });

  const searchResults = result?.data || [];
  const showLoading = isLoading || (isFetching && !searchResults.length);

  const handleSelectSense = (senseId: string) => {
    setSearchMenuOpen(false);
    navigate({
      to: APP_ROUTES.DICTIONARY.SENSE_DETAIL,
      params: { senseId },
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
            <div className="py-6 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}

          {debouncedQuery && searchResults.length > 0 && !showLoading && (
            <CommandGroup heading="Dictionary Results" className="py-3!">
              <div className="mt-1.5 flex flex-col gap-1">
                {searchResults.map((sense) => (
                  <CommandItem
                    key={sense.senseId}
                    value={sense.wordText + ' ' + sense.senseId} // value needs to be unique and searchable by shadcn internal filter
                    onSelect={() => handleSelectSense(sense.senseId)}
                    className="flex flex-col items-start gap-1 py-3! cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <BookOpen className="size-4 shrink-0 text-muted-foreground" />
                      <span className="font-semibold text-base">
                        {sense.wordText}
                      </span>
                      <Badge variant="outline" className="text-[10px] ml-auto">
                        {sense.partOfSpeech}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground pl-6 line-clamp-1">
                      {sense.shortDefinition}
                    </span>
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
