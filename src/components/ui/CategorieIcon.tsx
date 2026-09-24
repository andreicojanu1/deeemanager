import {
  IconBulb,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconFridge,
  IconMicrowave,
  IconWashMachine,
  type Icon,
} from '@tabler/icons-react';

/** 1 frigider, 2 monitor, 3 bec, 4 mașină de spălat, 5 cuptor cu microunde, 6 telefon. */
const ICONS: Record<number, Icon> = {
  1: IconFridge,
  2: IconDeviceDesktop,
  3: IconBulb,
  4: IconWashMachine,
  5: IconMicrowave,
  6: IconDeviceMobile,
};

export default function CategorieIcon({ categorieId, size = 24 }: { categorieId: number; size?: number }) {
  const Icon = ICONS[categorieId] ?? IconDeviceDesktop;
  return <Icon size={size} stroke={1.5} aria-hidden />;
}
