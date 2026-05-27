import React from 'react';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, whileTap, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
    tr: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, ...rest } = props;
      return <tr {...rest}>{children}</tr>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
