import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';

export default function Loading() {
  return (
    <Box
      aria-busy="true"
      aria-label="Se încarcă coada"
      sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}
    >
      <Box>
        <Skeleton variant="text" width={280} height={40} />
        <Skeleton variant="text" width={420} />
      </Box>
      <Skeleton variant="rectangular" height={44} />
      <Card sx={{ p: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} variant="text" height={36} />
        ))}
      </Card>
    </Box>
  );
}
