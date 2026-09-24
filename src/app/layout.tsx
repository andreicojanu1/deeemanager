import type { Metadata, Viewport } from 'next';
import ThemeRegistry from '@/theme/ThemeRegistry';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'DEEE Manager', template: '%s · DEEE Manager' },
  description: 'Încărcarea și verificarea loturilor DEEE.',
};

export const viewport: Viewport = {
  themeColor: '#F6F7F7',
  colorScheme: 'light',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ro">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
