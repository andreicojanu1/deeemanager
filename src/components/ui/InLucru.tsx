import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { color } from '@/theme/tokens';

/** Conținut temporar pentru ecranele care se construiesc la pașii următori ai Fazei A. */
export default function InLucru({ pas, descriere }: { pas: number; descriere: string }) {
  return (
    <Card sx={{ borderStyle: 'dashed', borderColor: color.lineStrong }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          Pasul {pas} din planul Fazei A
        </Typography>
        <Typography sx={{ mt: 1 }}>{descriere}</Typography>
      </CardContent>
    </Card>
  );
}
