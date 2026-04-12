import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui/shadcn/tabs';
import { Input } from '@/shared/ui/shadcn/input';
import { Button } from '@/shared/ui/shadcn/button';
import { createFileRoute } from '@tanstack/react-router';

export default function WorkspaceSettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="font-headline text-4xl font-bold text-primary">
        Workspace Settings
      </h1>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="rounded-full bg-surface-container p-1 mb-8 gap-1">
          <TabsTrigger
            value="overview"
            className="rounded-full px-5 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="workspace"
            className="rounded-full px-5 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Workspace Settings
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="rounded-full px-5 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Core Identity Card */}
            <div className="lg:col-span-2 rounded-2xl border border-outline-variant/20 bg-surface-container p-6 space-y-4">
              <h3 className="font-headline text-lg font-semibold text-on-surface">
                Core Identity
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-on-surface-variant mb-1 block">
                    Workspace Name
                  </label>
                  <Input
                    className="rounded-xl"
                    defaultValue="Scholarly Sanctuary"
                  />
                </div>
                <div>
                  <label className="text-sm text-on-surface-variant mb-1 block">
                    Daily Target
                  </label>
                  <Input
                    className="rounded-xl"
                    type="number"
                    defaultValue="10"
                  />
                </div>
              </div>
            </div>

            {/* Milestone Badge */}
            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-secondary to-primary-container mb-3" />
              <div className="font-headline text-lg font-bold text-on-surface">
                Level 12 Philosopher
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="workspace">
          {/* Learning Methodology */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-6">
              <h3 className="font-headline font-semibold text-on-surface mb-2">
                Spaced Repetition
              </h3>
              <p className="text-sm text-on-surface-variant">
                Review words at increasing intervals to maximize retention.
              </p>
            </div>
            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-6">
              <h3 className="font-headline font-semibold text-on-surface mb-2">
                Immersion Sprint
              </h3>
              <p className="text-sm text-on-surface-variant">
                Intensive sessions to rapidly expand your vocabulary.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="integrations">
          {/* Danger Zone */}
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
            <h3 className="font-headline font-semibold text-destructive mb-2">
              Danger Zone
            </h3>
            <p className="text-sm text-on-surface-variant mb-4">
              This action is irreversible.
            </p>
            <Button variant="destructive" className="rounded-full">
              Archive Workspace
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const Route = createFileRoute('/_(authenticated)/workspace/settings')({
  component: WorkspaceSettingsPage,
});
