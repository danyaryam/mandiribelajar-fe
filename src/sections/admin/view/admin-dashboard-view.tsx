'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------
// Admin: halaman indeks menuju modul pengelolaan.
// ----------------------------------------------------------------------

const sections = [
  { title: 'Paket', desc: 'Kelola paket & kuota.', href: paths.admin.plans },
  { title: 'Transaksi', desc: 'Pantau pembayaran.', href: paths.admin.payments },
  { title: 'Kurikulum', desc: 'Jenjang, kelas, mapel, topik.', href: paths.admin.catalog },
  {
    title: 'Laporan Soal',
    desc: 'Review laporan kualitas soal.',
    href: paths.admin.questionReports,
  },
  { title: 'Monitoring AI', desc: 'Log generasi & kegagalan AI.', href: paths.admin.aiGenerations },
];

export function AdminDashboardView() {
  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: 3, py: 8 }}>
      <Typography variant="h4" gutterBottom>
        Admin
      </Typography>
      <Grid container spacing={2}>
        {sections.map((s) => (
          <Grid key={s.href} size={{ xs: 12, sm: 6, md: 4 }}>
            <RouterLink href={s.href} style={{ textDecoration: 'none' }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6">{s.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
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
