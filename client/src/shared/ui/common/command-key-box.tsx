import { cn } from '@shared/utils/index';

export function CommandKeyBox({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded bg-bg-weak-50  ring-1 ring-inset text-muted-foreground ring-muted-foreground',
        className,
      )}
      {...rest}
    />
  );
}
