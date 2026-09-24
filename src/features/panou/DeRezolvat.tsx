import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import ButtonLink from '@/components/ui/ButtonLink';
import StatusDot from '@/components/ui/StatusDot';
import type { ElementDeRezolvat } from '@/lib/domain/panou';
import { color, radius } from '@/theme/tokens';

/** Apare doar dacă există ceva de rezolvat; altfel blocul lipsește cu totul. */
export default function DeRezolvat({ items }: { items: ElementDeRezolvat[] }) {
  if (items.length === 0) return null;
  return (
    <Card component="section" aria-labelledby="de-rezolvat-titlu">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          px: 6,
          py: 5,
          borderBottom: `1px solid ${color.line}`,
        }}
      >
        <Typography id="de-rezolvat-titlu" variant="h3" component="h2">
          De rezolvat
        </Typography>
        <Box
          component="span"
          className="num"
          aria-label={`${items.length} elemente`}
          sx={{
            minWidth: 24,
            height: 24,
            px: 2,
            borderRadius: `${radius.sm}px`,
            bgcolor: color.canvas,
            border: `1px solid ${color.line}`,
            color: color.inkMuted,
            fontSize: 13,
            fontWeight: 500,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {items.length}
        </Box>
      </Box>
      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {items.map((item, i) => (
          <Box
            component="li"
            key={item.id}
            sx={{
              display: 'flex',
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              alignItems: 'center',
              gap: 4,
              px: 6,
              py: 4,
              borderTop: i ? `1px solid ${color.line}` : 'none',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: 4,
                alignItems: 'flex-start',
                flex: 1,
                minWidth: 0,
                flexBasis: { xs: '100%', sm: 'auto' },
              }}
            >
              <Box sx={{ pt: '5px' }}>
                <StatusDot tone={item.ton} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="bodyStrong" component="p" sx={{ m: 0 }}>
                  {item.titlu}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                  {item.descriere}
                </Typography>
              </Box>
            </Box>
            <ButtonLink
              href={item.actiune.href}
              variant="outlined"
              sx={{ ml: { xs: 6.5, sm: 0 }, flexShrink: 0 }}
            >
              {item.actiune.eticheta}
            </ButtonLink>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
