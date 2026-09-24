import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

export default function Loading() {
  return (
    <Box
      aria-busy="true"
      aria-label="Se încarcă raportul"
      sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}
    >
      <Box>
        <Skeleton variant="text" width={260} height={40} />
        <Skeleton variant="text" width="55%" />
      </Box>
      <Box sx={{ display: 'grid', gap: 6, gridTemplateColumns: { xs: '1fr', lg: '400px 1fr' } }}>
        <Skeleton variant="rounded" height={640} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Skeleton variant="rounded" height={180} />
          <Skeleton variant="rounded" height={440} />
        </Box>
      </Box>
    </Box>
  );
}
