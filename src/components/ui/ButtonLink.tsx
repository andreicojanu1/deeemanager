'use client';

import Button, { type ButtonProps } from '@mui/material/Button';
import NextLink from 'next/link';

/**
 * Buton MUI care navighează cu next/link. Există ca client component pentru că
 * `component={NextLink}` nu poate fi trimis din Server Components.
 */
export default function ButtonLink(props: ButtonProps<typeof NextLink>) {
  return <Button component={NextLink} {...props} />;
}
