import type { Metadata } from 'next';
import { IconAlertTriangle } from '@tabler/icons-react';
import SystemPage from '@/components/layout/SystemPage';

export const metadata: Metadata = { title: 'A apărut o eroare' };

export default function Eroare() {
  return (
    <SystemPage
      code="500"
      title="A apărut o eroare"
      description="Datele tale sunt în siguranță, iar ciornele se păstrează. Încearcă din nou peste câteva momente."
      icon={<IconAlertTriangle size={24} stroke={1.5} />}
    />
  );
}
