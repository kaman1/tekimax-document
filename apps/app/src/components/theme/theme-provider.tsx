'use client';

import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Theme 
      accentColor="gray"
      grayColor="gray" 
      panelBackground="solid" 
      scaling="95%"
      radius="small"
    >
      <div className="relative min-h-screen">
        <div className="dotted-pattern" />
        <div className="content-wrapper">
          {children}
        </div>
      </div>
    </Theme>
  );
}
