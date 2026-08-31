'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { ApiError } from 'src/lib/api/client';
import { getAccessToken } from 'src/lib/api/auth';
import type { Dashboard } from 'src/lib/api/me';
import { getDashboard } from 'src/lib/api/me';

// ----------------------------------------------------------------------
// Dashboard siswa (Fase 5): ringkasan progres, latihan terakhir, kuota.
// ----------------------------------------------------------------------

export function DashboardView() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(paths.auth.login);
      return;
    }
    getDashboard()
      .then(setDashboard)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Gagal memuat dashboard.'))
      .finally(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <Box sx={{ maxWidth: 960, mx: 'auto', px: 3, py: 8 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" component="a" href={paths.courses.configure}>
          Mulai Latihan
        </Button>
      </Box>
    );
  }

  if (!dashboard) {
    return (
      <Box sx={{ maxWidth: 960, mx: 'auto', px: 3, py: 8, textAlign: 'center' }}>
        <Typography color="text.secondary">Memuat dashboard…</Typography>
      </Box>
    );
  }

  const statCards = [
    { label: 'Nilai Rata-rata', value: dashboard.averageScore != null ? `${dashboard.averageScore}%` : '—' },
    { label: 'Latihan Selesai', value: String(dashboard.completedSessions) },
    { label: 'Streak (hari)', value: String(dashboard.currentStreakDays) },
    {
      label: 'Kuota Terpakai',
      value: dashboard.usageSummary ? `${dashboard.usageSummary.totalConsumed}` : '0',
    },
  ];

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: 3, py: 8 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Button variant="contained" component="a" href={paths.courses.configure}>
          + Latihan Baru
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 5 }}>
        {statCards.map((s) => (
          <Grid key={s.label} size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h4" sx={{ mb: 0.5 }}>
                  {s.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {s.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Latihan Terakhir
      </Typography>

      {dashboard.recentSessions.length === 0 ? (
        <Typography color="text.secondary">
          Belum ada latihan. Mulai latihan pertamamu sekarang.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {dashboard.recentSessions.map((s) => {
            const pct = s.maxScore ? Math.round(((s.score ?? 0) / s.maxScore) * 100) : null;
            return (
              <Card key={s.id}>
                <CardContent
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>{s.title || 'Latihan'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {s.status}
                    </Typography>
                  </Box>
                  {pct != null && <Typography variant="h6">{pct}%</Typography>}
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
