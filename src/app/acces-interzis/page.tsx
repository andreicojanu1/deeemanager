import type { Metadata } from 'next';
import { IconLock } from '@tabler/icons-react';
import SystemPage from '@/components/layout/SystemPage';

export const metadata: Metadata = { title: 'Acces interzis' };

export default function AccesInterzis() {
  return (
    <SystemPage
      code="403"
      title="Nu ai acces la această pagină"
      description="Pagina e disponibilă doar pentru alt tip de cont. Dacă ai nevoie de acces, cere-l administratorului platformei."
      icon={<IconLock size={24} stroke={1.5} />}
    />
  );
}
