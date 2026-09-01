'use client';

import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Admin: halaman indeks menuju modul pengelolaan.
// ----------------------------------------------------------------------

const sections = [
  {
    title: 'Paket',
    desc: 'Kelola paket & kuota.',
    href: paths.admin.plans,
    icon: 'solar:bill-list-outline',
    accent: 'primary',
  },
  {
    title: 'Transaksi',
    desc: 'Pantau pembayaran.',
    href: paths.admin.payments,
    icon: 'solar:card-outline',
    accent: 'success',
  },
  {
    title: 'Kurikulum',
    desc: 'Jenjang, kelas, mapel, topik.',
    href: paths.admin.catalog,
    icon: 'solar:documents-minimalistic-outline',
    accent: 'secondary',
  },
  {
    title: 'Laporan Soal',
    desc: 'Review laporan kualitas soal.',
    href: paths.admin.questionReports,
    icon: 'solar:chat-line-outline',
    accent: 'warning',
  },
  {
    title: 'Monitoring AI',
    desc: 'Log generasi & kegagalan AI.',
    href: paths.admin.aiGenerations,
    icon: 'solar:cpu-bolt-linear',
    accent: 'info',
  },
] as const;

export function AdminDashboardView() {
  const theme = useTheme();

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: 3, py: 5 }}>
      {/* Header */}
      <Box
        sx={{
          borderRadius: 3,
          p: { xs: 3, md: 4 },
          mb: 4,
          color: '#fff',
          ...theme.mixins.bgGradient({
            images: [
              `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.darkerChannel, 0.92)}, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.85)} 55%, ${varAlpha(theme.vars.palette.secondary.mainChannel, 0.75)})`,
            ],
          }),
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Admin
        </Typography>
        <Typography sx={{ opacity: 0.92, mt: 0.5 }}>
          Pusat pengelolaan platform Mandiri Belajar.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {sections.map((s) => (
          <Grid key={s.href} size={{ xs: 12, sm: 6, md: 4 }}>
            <RouterLink href={s.href} style={{ textDecoration: 'none' }}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
                  background: `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.05)}, rgba(255,255,255,0))`,
                  transition: 'transform .18s, box-shadow .18s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,.10)',
                    borderColor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.35),
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2.5,
                      display: 'grid',
                      placeItems: 'center',
                      mb: 2,
                      color: `${s.accent}.main`,
                      bgcolor: (t) => varAlpha(t.vars.palette[s.accent].mainChannel, 0.1),
                    }}
                  >
                    <Iconify icon={s.icon} width={26} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {s.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {s.desc}
                  </Typography>
                </CardContent>
              </Card>
            </RouterLink>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
