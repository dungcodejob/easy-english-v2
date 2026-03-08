import { Button } from '@/shared/ui/shadcn/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/shadcn/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/ui/shadcn/pagination';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';
import { Link } from '@tanstack/react-router';
import { Folder, Plus, Trash } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useDeleteTopicMutation, useTopicsQuery } from '../hooks/topic.hooks';
import { useTopicStore } from '../stores/topic.store';
import { CreateTopicDialog } from './components/create-topic-dialog';

export default function TopicsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useTopicsQuery(page, 20);
  const deleteTopic = useDeleteTopicMutation();
  const { openCreateModal } = useTopicStore();

  const handleDelete = async (id: string, name: string) => {
    if (
      window.confirm(`Are you sure you want to delete the topic "${name}"?`)
    ) {
      try {
        await deleteTopic.mutateAsync(id);
        toast.success('Topic deleted');

        // If it was the last item on the page, go to previous page
        if (data?.data.length === 1 && page > 1) {
          setPage(page - 1);
        }
      } catch (error) {
        toast.error('Failed to delete topic');
      }
    }
  };

  const handlePreviousPage = useCallback(() => {
    if (page > 1) {
      setPage((p) => Math.max(1, p - 1));
    }
  }, [page]);

  const handleNextPage = useCallback(() => {
    if (data?.pagination?.hasMore) {
      setPage((p) => p + 1);
    }
  }, [data?.pagination?.hasMore]);

  return (
    <div className="container py-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Topics</h1>
          <p className="text-muted-foreground mt-2">
            Organize your vocabulary lists into custom topics.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Create Topic
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-4/5" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-24 border rounded-lg bg-muted/20 border-dashed">
          <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium">No topics yet</h3>
          <p className="text-muted-foreground mt-2 mb-6">
            Create your first topic to start organizing words.
          </p>
          <Button onClick={openCreateModal}>Create Topic</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data.map((topic) => (
              <Card key={topic.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl truncate" title={topic.name}>
                    {topic.name}
                  </CardTitle>
                  {topic.description && (
                    <CardDescription className="line-clamp-2">
                      {topic.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground mb-4">
                    Created {new Date(topic.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 mt-auto">
                    <Button variant="outline" className="w-full" asChild>
                      {/* @ts-expect-error - Route types desynced */}
                      <Link
                        to="/learning/topics/$topicId"
                        params={{ topicId: topic.id }}
                      >
                        View Words
                      </Link>
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 justify-end gap-2 text-muted-foreground border-t mt-4 p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full"
                    onClick={() => handleDelete(topic.id, topic.name)}
                  >
                    <Trash className="h-4 w-4 mr-2" /> Delete Topic
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {(page > 1 || data?.pagination?.hasMore) && (
            <Pagination className="justify-center mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={handlePreviousPage}
                    className={
                      page <= 1
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="text-sm text-muted-foreground mx-4">
                    Page {page} of{' '}
                    {data?.pagination?.count
                      ? Math.ceil(data.pagination.count / 20)
                      : page}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={handleNextPage}
                    className={
                      !data?.pagination?.hasMore
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      <CreateTopicDialog />
    </div>
  );
}
