import { theme, useTheme } from '@/shared/contexts';
import { useMetaColor } from '@/shared/hooks';
import { metaThemeColor } from '@/shared/types';
import { Button } from '@/shared/ui/shadcn/button';
import { MoonIcon, SunIcon } from 'lucide-react';
import * as React from 'react';

export function ModeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme();
  const { setMetaColor } = useMetaColor();

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === theme.dark ? theme.light : theme.dark);
    setMetaColor(
      resolvedTheme === theme.dark ? metaThemeColor.light : metaThemeColor.dark,
    );
  }, [resolvedTheme, setTheme, setMetaColor]);

  return (
    <Button
      variant="ghost"
      className="group/toggle h-8 w-8 px-0"
      onClick={toggleTheme}
    >
      <SunIcon className="hidden [html.dark_&]:block" />
      <MoonIcon className="hidden [html.light_&]:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
