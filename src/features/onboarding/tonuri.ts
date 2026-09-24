import type { StareDocumentOnboarding } from '@/lib/domain/onboarding';
import type { StatusTone } from '@/lib/domain/status';

export const TON_STARE: Record<StareDocumentOnboarding, StatusTone> = {
  LIPSA: 'neutral',
  INCARCAT: 'petrol',
  DE_VERIFICAT: 'warning',
  APROBAT: 'success',
  RESPINS: 'danger',
};
