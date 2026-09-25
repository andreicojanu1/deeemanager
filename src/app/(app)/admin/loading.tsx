import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';

/** Skeleton cu forma panoului, nu spinner pe toată pagina. */
export default function Loading() {
  return (
    <Box
      aria-busy="true"
      aria-label="Se încarcă panoul"
      sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}
    >
      <Box>
        <Skeleton variant="text" width={160} height={40} />
        <Skeleton variant="text" width={260} />
      </Box>
      <Card sx={{ p: 6 }}>
        <Skeleton variant="text" width={140} height={28} />
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="60%" />
      </Card>
      <Box
        sx={{
          display: 'grid',
          gap: 4,
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' },
        }}
      >
        {Array.from({ length: 6 }, (_, i) => (
          <Card key={i} sx={{ p: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Skeleton variant="rounded" width={40} height={40} />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" height={36} />
          </Card>
        ))}
      </Box>
      <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', lg: '3fr 2fr' } }}>
        <Skeleton variant="rounded" height={340} />
        <Skeleton variant="rounded" height={340} />
      </Box>
    </Box>
  );
}
