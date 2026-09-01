'use client';

import type { Dashboard } from 'src/lib/api/me';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';

import { ApiError } from 'src/lib/api/client';
import { getDashboard } from 'src/lib/api/me';
import { getAccessToken } from 'src/lib/api/auth';

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
    {
      label: 'Nilai Rata-rata',
      value: dashboard.averageScore != null ? `${dashboard.averageScore}%` : '—',
    },
    { label: 'Latihan Selesai', value: String(dashboard.completedSessions) },
    { label: 'Streak (hari)', value: String(dashboard.currentStreakDays) },
    {
      label: 'Target Mingguan',
      value: `${dashboard.weeklyCompleted ?? 0}/${dashboard.weeklyGoal ?? 3}`,
    },
  ];

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: 3, py: 8 }}>
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
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

      {dashboard.achievements.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Pencapaian
          </Typography>
          <Stack spacing={1} sx={{ mb: 4 }}>
            {dashboard.achievements.map((a) => (
              <Card key={a.code}>
                <CardContent
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    opacity: a.earned ? 1 : 0.5,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>{a.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {a.description}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {a.earned ? '✔' : '🔒'}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </>
      )}

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
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                  }}
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

      {(dashboard.weakTopics.length > 0 || dashboard.recommendations.length > 0) && (
        <>
          <Typography variant="h6" sx={{ mt: 5, mb: 2 }}>
            Topik yang Perlu Diulang
          </Typography>

          <Stack spacing={1.5}>
            {dashboard.recommendations.map((r) => (
              <Alert key={r.topicId} severity="info" sx={{ alignItems: 'center' }}>
                {r.reason}
              </Alert>
            ))}
          </Stack>

          <Stack spacing={1.5} sx={{ mt: 2 }}>
            {dashboard.weakTopics.map((t) => (
              <Card key={t.topicId}>
                <CardContent
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }}>{t.topicName || 'Topik'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nilai {t.score}%
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
}
