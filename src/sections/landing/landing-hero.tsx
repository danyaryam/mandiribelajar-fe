'use client';

import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

import { LANDING } from './landing-data';

// ----------------------------------------------------------------------
// Above-the-fold hero (LCP): no entry animations — SSR HTML ships the
// heading and CTA fully visible.
// ----------------------------------------------------------------------

export function LandingHero() {
  const { hero } = LANDING;
  return (
    <Box
      component="section"
      sx={(theme) => ({
        overflow: 'hidden',
        position: 'relative',
        py: { xs: 10, md: 16 },
        background: `linear-gradient(180deg, ${varAlpha(theme.vars.palette.primary.lighterChannel, 0.5)}, ${varAlpha(theme.vars.palette.primary.lighterChannel, 0)})`,
      })}
    >
      <Container>
        <Box sx={{ maxWidth: 760, mx: 'auto', textAlign: 'center' }}>
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              mb: 3,
              borderRadius: 1,
              typography: 'subtitle2',
              color: 'primary.dark',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              bgcolor: 'primary.lighter',
            }}
          >
            <Iconify width={18} icon="solar:check-circle-bold" />
            {hero.badge}
          </Box>

          <Typography component="h1" variant="h1" sx={{ mb: 3 }}>
            {hero.title}
          </Typography>

          <Typography sx={{ mb: 5, mx: 'auto', maxWidth: 620, color: 'text.secondary' }}>
            {hero.description}
          </Typography>

          <Box sx={{ gap: 1.5, display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              size="large"
              variant="contained"
              component={RouterLink}
              href={hero.primaryCtaHref}
              endIcon={<Iconify icon="carbon:direction-straight-right" />}
            >
              {hero.cta}
            </Button>
            <Button
              size="large"
              variant="outlined"
              component={RouterLink}
              href={hero.secondaryCtaHref}
            >
              {hero.ctaSub}
            </Button>
          </Box>

          <Box
            sx={{
              mt: 6,
              gap: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {hero.stats.map((stat, index) => (
              <Box key={stat.label} sx={{ textAlign: 'center' }}>
                <Typography component="span" variant="h3" sx={{ color: 'primary.main' }}>
                  {stat.value}
                  {stat.suffix}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
