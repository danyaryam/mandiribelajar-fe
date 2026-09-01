'use client';

import type { SubjectProgressItem } from 'src/lib/api/me';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';

import { getProgress } from 'src/lib/api/me';
import { ApiError } from 'src/lib/api/client';
import { getAccessToken } from 'src/lib/api/auth';

// ----------------------------------------------------------------------
// Laporan Progres per mapel/topik (Fase 5, fitur tambahan).
// ----------------------------------------------------------------------

export function ProgressView() {
  const theme = useTheme();
  const router = useRouter();
  const [subjects, setSubjects] = useState<SubjectProgressItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(paths.auth.login);
      return;
    }
    getProgress()
      .then(setSubjects)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Gagal memuat laporan progres.')
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto', px: 3, py: 5 }}>
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
          Laporan Progres
        </Typography>
        <Typography sx={{ opacity: 0.92, mt: 0.5 }}>
          Pantau penguasaanmu per mata pelajaran dan topik.
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading && <Typography color="text.secondary">Memuat…</Typography>}

      {!loading && subjects.length === 0 && (
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
            textAlign: 'center',
            py: 5,
          }}
        >
          <Typography sx={{ fontSize: 40 }}>📊</Typography>
          <Typography color="text.secondary">
            Belum ada data progres. Mulai latihan untuk melihat laporan.
          </Typography>
        </Card>
      )}

      <Stack spacing={3}>
        {subjects.map((s) => (
          <Card
            key={s.subjectId}
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
              background: `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.05)}, rgba(255,255,255,0))`,
              transition: 'transform .18s, box-shadow .18s',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 10px 28px rgba(0,0,0,.10)',
              },
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box
                sx={{
                  mb: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {s.subjectName}
                </Typography>
                <Chip
                  size="small"
                  label={`${s.percentage}%`}
                  variant="soft"
                  color={s.percentage >= 70 ? 'success' : s.percentage >= 50 ? 'warning' : 'error'}
                />
              </Box>
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {s.topics.map((t) => (
                  <Box key={t.topicId} sx={{ px: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {t.topicName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                        {t.percentage}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={t.percentage}
                      color={
                        t.percentage >= 70 ? 'success' : t.percentage >= 50 ? 'warning' : 'error'
                      }
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {t.correct}/{t.total} soal
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
