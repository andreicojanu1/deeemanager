'use client';

import Button from '@mui/material/Button';
import { IconAlertTriangle } from '@tabler/icons-react';
import SystemPage from '@/components/layout/SystemPage';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <SystemPage
      code="500"
      title="A apărut o eroare"
      description="Datele tale sunt în siguranță, iar ciornele se păstrează. Încearcă din nou."
      icon={<IconAlertTriangle size={24} stroke={1.5} />}
      action={
        <Button variant="contained" onClick={() => reset()}>
          Încearcă din nou
        </Button>
      }
    />
  );
}
