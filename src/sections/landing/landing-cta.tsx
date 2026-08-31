'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function LandingCta() {
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 } }}>
      <Container>
        <Box
          sx={{
            overflow: 'hidden',
            position: 'relative',
            p: { xs: 5, md: 8 },
            borderRadius: 4,
            textAlign: 'center',
            color: 'primary.contrastText',
            bgcolor: 'primary.main',
          }}
        >
          <Typography variant="h3" sx={{ mb: 2 }}>
            Siap Belajar Mandiri?
          </Typography>
          <Typography sx={{ mb: 4, mx: 'auto', maxWidth: 560, opacity: 0.9 }}>
            Mulai latihan soal sekarang. Daftar gratis dan temukan materi sesuai jenjang dan kelasmu.
          </Typography>
          <Button
            size="large"
            variant="contained"
            component={RouterLink}
            href={paths.auth.register}
            sx={{ bgcolor: 'background.paper', color: 'primary.main', '&:hover': { bgcolor: 'background.paper' } }}
            endIcon={<Iconify icon="carbon:direction-straight-right" />}
          >
            Daftar Gratis
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
