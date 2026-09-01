'use client';

import type { Dashboard } from 'src/lib/api/me';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';

import { ApiError } from 'src/lib/api/client';
import { getDashboard } from 'src/lib/api/me';
import { getAccessToken } from 'src/lib/api/auth';

// ----------------------------------------------------------------------
// Dashboard siswa (Fase 5): ringkasan progres, latihan terakhir, kuota.
// ----------------------------------------------------------------------

const STAT_ICONS: Record<string, string> = {
  'Nilai Rata-rata': '🎯',
  'Latihan Selesai': '📚',
  'Streak (hari)': '🔥',
  'Target Mingguan': '⏱️',
};

type Stat = { label: string; value: string };

function StatCard({ label, value, accent }: Stat & { accent: string }) {
  return (
    <Card
      sx={{
        height: '100%',
        border: `solid 1px ${varAlpha(accent, 0.18)}`,
        background: `linear-gradient(135deg, ${varAlpha(accent, 0.08)}, rgba(255,255,255,0))`,
        transition: 'transform .18s, box-shadow .18s',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 10px 28px rgba(0,0,0,.10)' },
      }}
    >
      <CardContent>
        <Typography variant="overline" sx={{ color: accent, fontWeight: 700 }}>
          {STAT_ICONS[label] ?? '•'} {label}
        </Typography>
        <Typography variant="h3" sx={{ my: 0.5, fontWeight: 800 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function DashboardView() {
  const theme = useTheme();
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

  const stats: Stat[] = [
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

  const weeklyGoal = dashboard.weeklyGoal ?? 3;
  const weeklyPct = Math.min(
    100,
    Math.round(((dashboard.weeklyCompleted ?? 0) / weeklyGoal) * 100)
  );
  const accents = [
    theme.vars.palette.primary.main,
    theme.vars.palette.info.main,
    theme.vars.palette.warning.main,
    theme.vars.palette.secondary.main,
  ];

  return (
    <Box sx={{ maxWidth: 1080, mx: 'auto', px: 3, py: 5 }}>
      {/* Hero banner */}
      <Box
        sx={{
          borderRadius: 3,
          p: { xs: 3, md: 5 },
          mb: 4,
          color: '#fff',
          ...theme.mixins.bgGradient({
            images: [
              `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.darkerChannel, 0.92)}, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.85)} 55%, ${varAlpha(theme.vars.palette.secondary.mainChannel, 0.75)})`,
            ],
          }),
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Halo, semangat belajar! 👋
            </Typography>
            <Typography sx={{ opacity: 0.92, maxWidth: 520 }}>
              Lanjutkan rutinitas belajarmu. Selesaikan target mingguan dan jaga semangatmu hari
              ini.
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            component="a"
            href={paths.courses.configure}
            sx={{
              bgcolor: '#fff',
              color: theme.vars.palette.primary.darker,
              fontWeight: 800,
              '&:hover': { bgcolor: (t) => varAlpha(t.vars.palette.common.whiteChannel, 0.9) },
            }}
          >
            + Mulai Latihan
          </Button>
        </Stack>
        {/* Weekly goal progress */}
        <Box sx={{ mt: 3, maxWidth: 420 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Target mingguan
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {dashboard.weeklyCompleted ?? 0}/{weeklyGoal}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={weeklyPct}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,.25)',
              '& .MuiLinearProgress-bar': { bgcolor: '#fff', borderRadius: 4 },
            }}
          />
        </Box>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {stats.map((s, i) => (
          <Grid key={s.label} size={{ xs: 6, md: 3 }}>
            <StatCard
              {...s}
              accent={accents[i % accents.length] ?? theme.vars.palette.primary.main}
            />
          </Grid>
        ))}
      </Grid>

      {/* Achievements */}
      {dashboard.achievements.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Pencapaian
          </Typography>
          <Grid container spacing={1.5} sx={{ mb: 4 }}>
            {dashboard.achievements.map((a) => (
              <Grid key={a.code} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    border: `solid 1px ${a.earned ? varAlpha(theme.vars.palette.success.mainChannel, 0.3) : 'rgba(0,0,0,.06)'}`,
                    background: a.earned
                      ? `linear-gradient(135deg, ${varAlpha(theme.vars.palette.success.mainChannel, 0.12)}, rgba(255,255,255,0))`
                      : undefined,
                    height: '100%',
                  }}
                >
                  <CardContent>
                    <Typography sx={{ fontSize: 28 }}>{a.earned ? '🏆' : '🔒'}</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>
                      {a.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {a.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Recent sessions */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Latihan Terakhir
      </Typography>
      {dashboard.recentSessions.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <Typography sx={{ fontSize: 40 }}>🧘</Typography>
            <Typography color="text.secondary">
              Belum ada latihan. Mulai latihan pertamamu sekarang.
            </Typography>
            <Button variant="contained" component="a" href={paths.courses.configure} sx={{ mt: 2 }}>
              Mulai Latihan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={1.5}>
          {dashboard.recentSessions.map((s) => {
            const pct = s.maxScore ? Math.round(((s.score ?? 0) / s.maxScore) * 100) : null;
            return (
              <Card key={s.id} sx={{ borderRadius: 2.5 }}>
                <CardContent
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>{s.title || 'Latihan'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {s.status}
                    </Typography>
                  </Box>
                  {pct != null && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{ width: { xs: 80, sm: 140 }, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {pct}%
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Weak topics / recommendations */}
      {(dashboard.weakTopics.length > 0 || dashboard.recommendations.length > 0) && (
        <>
          <Typography variant="h6" sx={{ mt: 5, mb: 2, fontWeight: 700 }}>
            Topik yang Perlu Diulang
          </Typography>
          <Stack spacing={1.5}>
            {dashboard.recommendations.map((r) => (
              <Alert key={r.topicId} severity="info" sx={{ alignItems: 'center', borderRadius: 2 }}>
                {r.reason}
              </Alert>
            ))}
            {dashboard.weakTopics.map((t) => {
              const color = t.score < 50 ? 'error' : t.score < 70 ? 'warning' : 'success';
              return (
                <Card key={t.topicId} sx={{ borderRadius: 2.5 }}>
                  <CardContent
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600 }}>{t.topicName || 'Topik'}</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={t.score}
                        color={color}
                        sx={{ mt: 1, height: 6, borderRadius: 4 }}
                      />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: `${color}.main` }}>
                      {t.score}%
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </>
      )}
    </Box>
  );
}
