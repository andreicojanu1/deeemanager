import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

export default function Loading() {
  return (
    <Box
      aria-busy="true"
      aria-label="Se încarcă lotul"
      sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}
    >
      <Box>
        <Skeleton variant="text" width={220} height={40} />
        <Skeleton variant="text" width="60%" />
      </Box>
      <Skeleton variant="rectangular" height={44} />
      <Skeleton variant="rounded" height={220} />
      <Skeleton variant="rounded" height={260} />
    </Box>
  );
}
