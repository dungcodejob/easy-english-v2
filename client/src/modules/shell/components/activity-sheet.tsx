import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/shadcn/avatar';
import { Badge } from '@/shared/ui/shadcn/badge';
import { Button } from '@/shared/ui/shadcn/button';
import { Input } from '@/shared/ui/shadcn/input';
import { Separator } from '@/shared/ui/shadcn/separator';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/shared/ui/shadcn/sheet';
import { Activity, Image as ImageIcon } from 'lucide-react';

export function ActivitySheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost">
          <Activity className="h-4 w-4" />
          <span className="sr-only">Toggle activity</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 gap-0">
        <SheetHeader className="p-4 border-b py-2.25">
          <SheetTitle className="text-lg font-semibold leading-6">Activity</SheetTitle>
          <SheetDescription className="hidden">
            Recent activity and notifications
          </SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto grid grid-cols-1">
          {/* Item 1 */}
          <div className="flex gap-4 px-4 py-3">
            <Avatar className="size-8">
              <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png" />
              <AvatarFallback>JL</AvatarFallback>
            </Avatar>
            <div className="flex w-full flex-col items-start gap-2.5">
              <div className="text-muted-foreground flex flex-col items-start text-sm">
                <p>
                  <span className="text-foreground font-semibold">Joe Lincoln</span> mentioned you in last trends topic
                </p>
                <p>18 mins ago</p>
              </div>
              <div className="bg-muted flex flex-col gap-4 rounded-md border px-4 py-2.5 w-full">
                <p className="text-sm font-medium">
                  @ShadcnStudio For an expert opinion, check out what Mike has to say on this topic!
                </p>
                <div className="relative">
                  <Input placeholder="Reply" className="pr-9 bg-card" />
                  <div className="text-muted-foreground pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center pr-3">
                    <ImageIcon className="size-4" />
                    <span className="sr-only">Attach image</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Separator />

          {/* Item 2 */}
          <div className="flex gap-4 px-4 py-3">
            <Avatar className="size-8">
              <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-2.png" />
              <AvatarFallback>JP</AvatarFallback>
            </Avatar>
            <div className="flex w-full flex-col items-start gap-2.5">
              <div className="text-muted-foreground flex flex-col items-start text-sm">
                <p>
                  <span className="text-foreground font-semibold">Jane Perez</span> invites you to review a file
                </p>
                <p>39 mins ago</p>
              </div>
              <div className="bg-muted flex items-center gap-1 rounded-md px-1.5 py-1">
                <img
                  className="h-5"
                  src="https://cdn.shadcnstudio.com/ss-assets/blocks/dashboard-application/dashboard-dialog/image-14.png"
                  alt="pdf"
                />
                <span className="text-sm font-medium">invoices.pdf</span>
              </div>
            </div>
          </div>
          <Separator />

          {/* Item 3 */}
          <div className="flex gap-4 px-4 py-3">
            <Avatar className="size-8">
              <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png" />
              <AvatarFallback>TH</AvatarFallback>
            </Avatar>
            <div className="flex w-full flex-col items-start gap-2.5">
              <div className="text-muted-foreground flex flex-col items-start text-sm">
                <p>
                  <span className="text-foreground font-semibold">Tyler Hero</span> wants to view your design project
                </p>
                <p>1 hour ago</p>
              </div>
              <div className="bg-muted flex w-full items-center gap-4 rounded-md border px-4 py-2.5">
                <img
                  className="size-8 rounded-sm"
                  src="https://cdn.shadcnstudio.com/ss-assets/blocks/dashboard-application/dashboard-dialog/image-13.png"
                  alt="figma"
                />
                <span className="text-sm font-medium">Launcher-Uikit.fig</span>
              </div>
            </div>
          </div>
          <Separator />

          {/* Item 4 */}
          <div className="flex gap-4 px-4 py-3">
            <Avatar className="size-8">
              <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png" />
              <AvatarFallback>D</AvatarFallback>
            </Avatar>
            <div className="text-muted-foreground flex flex-col items-start text-sm">
              <p>
                <span className="text-foreground font-semibold">Denial</span> invites you to review the new design
              </p>
              <p>3 hours ago</p>
            </div>
          </div>
          <Separator />

          {/* Item 5 */}
          <div className="flex gap-4 px-4 py-3">
            <Avatar className="size-8">
              <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png" />
              <AvatarFallback>LA</AvatarFallback>
            </Avatar>
            <div className="flex w-full flex-col items-start gap-2.5">
              <div className="text-muted-foreground flex flex-col items-start text-sm">
                <p>
                  <span className="text-foreground font-semibold">Leslie Alexander</span> new tags to Web Redesign
                </p>
                <p>8 hours ago</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/90">Client-Request</Badge>
                <Badge variant="secondary" className="bg-sky-600/10 text-sky-600 hover:bg-sky-600/90 dark:bg-sky-400/10 dark:text-sky-400">Figma</Badge>
                <Badge variant="secondary" className="bg-amber-600/10 text-amber-600 hover:bg-amber-600/90 dark:bg-amber-400/10 dark:text-amber-400">Redesign</Badge>
              </div>
            </div>
          </div>
          <Separator />

          {/* Item 6 */}
          <div className="flex gap-4 px-4 py-3">
            <Avatar className="size-8">
              <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-8.png" />
              <AvatarFallback>M</AvatarFallback>
            </Avatar>
            <div className="text-muted-foreground flex flex-col items-start text-sm">
              <p>
                <span className="text-foreground font-semibold">Miya</span> invites you to review a file
              </p>
              <p>10 hours ago</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
