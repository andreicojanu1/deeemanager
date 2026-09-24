import type { Metadata } from 'next';
import { IconMapSearch } from '@tabler/icons-react';
import SystemPage from '@/components/layout/SystemPage';

export const metadata: Metadata = { title: 'Pagina nu există' };

export default function NotFound() {
  return (
    <SystemPage
      code="404"
      title="Pagina nu există"
      description="Adresa poate fi greșită sau pagina a fost mutată. Verifică linkul sau pornește din pagina de start."
      icon={<IconMapSearch size={24} stroke={1.5} />}
    />
  );
}
