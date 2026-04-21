import { Avatar, AvatarImage } from '@/shared/ui/shadcn/avatar';
import { Badge } from '@/shared/ui/shadcn/badge';
import { Button } from '@/shared/ui/shadcn/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui/shadcn/tabs';
import { Bell, Link, Settings } from 'lucide-react';
import type { ReactNode } from 'react';

function NotificationItem({
  avatarSrc,
  message,
  time,
  type,
  unread,
  children,
}: {
  avatarSrc: string;
  message: string;
  time: string;
  type: string;
  unread?: boolean;
  children?: ReactNode;
}) {
  return (
    <DropdownMenuItem className="flex flex-col items-start gap-3 p-4 cursor-pointer">
      <div className="flex items-start gap-3 w-full">
        <Avatar className="size-9">
          <AvatarImage src={avatarSrc} />
        </Avatar>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium leading-none">{message}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{time}</span>
            <span className="size-1 rounded-full bg-muted-foreground/30" />
            <span>{type}</span>
          </div>
        </div>
        {unread && <div className="size-2 rounded-full bg-primary mt-1 shrink-0" />}
      </div>
      {children}
    </DropdownMenuItem>
  );
}

export function NotificationDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button size="icon" variant="ghost" className="relative">
          <Bell className="h-4 w-4" />
          <span className="bg-destructive absolute top-2 right-2.5 size-2 rounded-full" />
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px] sm:w-[400px] p-0">
        <Tabs defaultValue="inbox" className="w-full">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Notifications</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                8 New
              </Badge>
            </div>
            <Button size="icon" variant="ghost" className="h-6 w-6">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </div>

          <div className="px-2 pt-2">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
              <TabsTrigger
                value="inbox"
                className="rounded-none border-b-2 border-transparent px-4 py-2 text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent shadow-none"
              >
                Inbox
              </TabsTrigger>
              <TabsTrigger
                value="general"
                className="rounded-none border-b-2 border-transparent px-4 py-2 text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent shadow-none"
              >
                General
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="inbox" className="m-0 p-0">
            <NotificationItem
              avatarSrc="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-19.png"
              message="Mark Bush"
              time="12 Minutes ago"
              type="New post"
              unread
            />
            <DropdownMenuSeparator />
            <NotificationItem
              avatarSrc="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png"
              message="Aaron Black"
              time="27 Minutes ago"
              type="New comment"
              unread
            />
            <DropdownMenuSeparator />
            <NotificationItem
              avatarSrc="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-2.png"
              message="Anna has applied to create an ad for your campaign"
              time="2 hours ago"
              type="New request for campaign"
            >
              <div className="flex gap-2 pl-12">
                <Button size="sm" variant="secondary" className="h-8">
                  Decline
                </Button>
                <Button size="sm" className="h-8">
                  Accept
                </Button>
              </div>
            </NotificationItem>
            <DropdownMenuSeparator />
            <NotificationItem
              avatarSrc="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png"
              message="Jason attached the file"
              time="6 hours ago"
              type="Attached files"
            >
              <div className="flex items-center gap-1 text-xs text-muted-foreground pl-12">
                <Link className="h-3 w-3" />
                <span>Work examples.com</span>
              </div>
            </NotificationItem>
          </TabsContent>

          <TabsContent
            value="general"
            className="m-0 p-4 text-center text-sm text-muted-foreground"
          >
            No general notifications
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
