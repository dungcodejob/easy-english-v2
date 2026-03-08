import { Search } from 'lucide-react';

import {
  RiArrowDownLine,
  RiArrowUpLine,
  RiBankCardLine,
  RiBankLine,
  RiCornerDownLeftLine,
  RiFolderOpenLine,
  RiHistoryLine,
  RiSparklingLine,
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
  CommandShortcut,
} from '@shared/ui/shadcn/command';
import { useMemo, useState } from 'react';

export function SearchMenu() {
  const [isSearchMenuOpen, setSearchMenuOpen] = useState(false);
  const smartPromptExamples = useMemo(
    () => [
      'Doanh thu hôm nay là bao nhiêu?',
      'So sánh doanh thu tháng này và tháng trước',
      'Mặt hàng nào đang sắp hết hàng?',
      'Báo cáo doanh thu hàng ngày trong tuần này',
      'Dự đoán doanh thu cho tuần tới dựa trên dữ liệu hiện tại',
    ],
    [],
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSearchMenuOpen(true)}
      >
        <Search />
      </Button>
      <CommandDialog open={isSearchMenuOpen} onOpenChange={setSearchMenuOpen}>
        <CommandInput
          className="w-lg"
          placeholder="Type a command or search..."
        />

        <CommandList className="overflow-visible max-h-[calc(100vh-10rem)]">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Searching for" className="!py-3">
            <div className="flex gap-2 mt-1.5">
              <Badge variant="outline">Outline</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Suggestions" className="!py-3">
            <div className="mt-1.5">
              {smartPromptExamples.map((example) => (
                <CommandItem key={example} className="!py-2.5">
                  <RiSparklingLine />
                  <span>{example}</span>
                </CommandItem>
              ))}
            </div>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Results (4)" className="!py-3">
            <div className="mt-1.5">
              <CommandItem>
                <RiHistoryLine />
                <span>Search recent transactions </span>
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <RiBankCardLine />
                <span>View your cards</span>
                <CommandShortcut>⌘B</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <RiFolderOpenLine />
                <span>View statements for Ops / Payroll</span>
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <RiBankLine />
                <span>Go to Ops / Payroll</span>
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
            </div>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup className="!py-3">
            <div className="flex justify-between items-center">
              <div className="hidden gap-3 md:flex  px-2">
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
                Not what you’re looking for? Try the
                <span className="text-primary pl-1">Help Center</span>
              </div>
            </div>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
