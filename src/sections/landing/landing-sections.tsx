import type { IconifyName } from 'src/components/iconify';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { LANDING } from './landing-data';
import { LandingHeading } from './landing-heading';

// ----------------------------------------------------------------------
// Cara kerja — 3 langkah.
// ----------------------------------------------------------------------

export function LandingHow() {
  const { how } = LANDING;
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.neutral' }}>
      <Container>
        <LandingHeading caption={how.caption} title={how.title} />
        <Box
          sx={{
            gap: 3,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          }}
        >
          {how.items.map((item) => (
            <Box key={item.step} sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper' }}>
              <Box
                sx={{
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    display: 'grid',
                    placeItems: 'center',
                    color: 'primary.main',
                    bgcolor: 'primary.lighter',
                  }}
                >
                  <Iconify icon={item.icon as IconifyName} width={28} />
                </Box>
                <Typography variant="h3" sx={{ color: 'text.disabled' }}>
                  {item.step}
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ mb: 1 }}>
                {item.title}
              </Typography>
              <Typography color="text.secondary">{item.description}</Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------
// Keunggulan fitur.
// ----------------------------------------------------------------------

export function LandingFeatures() {
  const { features } = LANDING;
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 } }}>
      <Container>
        <LandingHeading caption={features.caption} title={features.title} />
        <Box
          sx={{
            gap: 3,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          }}
        >
          {features.items.map((item) => (
            <Stack
              key={item.title}
              direction="row"
              spacing={2}
              sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  borderRadius: 1.5,
                  display: 'grid',
                  placeItems: 'center',
                  color: 'primary.main',
                  bgcolor: 'primary.lighter',
                }}
              >
                <Iconify icon={item.icon as IconifyName} width={26} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ mb: 0.5 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------
// Paket harga.
// ----------------------------------------------------------------------

export function LandingPlans() {
  const { plans } = LANDING;
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.neutral' }}>
      <Container>
        <LandingHeading caption={plans.caption} title={plans.title} />
        <Box
          sx={{
            gap: 3,
            display: 'grid',
            maxWidth: 720,
            mx: 'auto',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          }}
        >
          {plans.items.map((plan) => (
            <Box
              key={plan.name}
              sx={{
                p: 4,
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="overline" color="primary">
                {plan.name}
              </Typography>
              <Box sx={{ mt: 1, mb: 3, display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography variant="h2">Rp {plan.price.toLocaleString('id-ID')}</Typography>
                <Typography color="text.secondary">/ {plan.period}</Typography>
              </Box>
              <Stack spacing={1.5}>
                {plan.features.map((f) => (
                  <Stack key={f} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Iconify icon="eva:checkmark-fill" width={20} sx={{ color: 'primary.main' }} />
                    <Typography variant="body2">{f}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
