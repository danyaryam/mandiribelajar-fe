'use client';

import type { SubjectProgressItem } from 'src/lib/api/me';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
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
    <Box sx={{ maxWidth: 860, mx: 'auto', px: 3, py: 8 }}>
      <Typography variant="h4" gutterBottom>
        Laporan Progres
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && <Typography color="text.secondary">Memuat…</Typography>}

      {!loading && subjects.length === 0 && (
        <Typography color="text.secondary">
          Belum ada data progres. Mulai latihan untuk melihat laporan.
        </Typography>
      )}

      <Stack spacing={3}>
        {subjects.map((s) => (
          <Card key={s.subjectId}>
            <CardContent>
              <Box
                sx={{
                  mb: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="h6">{s.subjectName}</Typography>
                <Chip
                  size="small"
                  label={`${s.percentage}%`}
                  color={s.percentage >= 70 ? 'success' : s.percentage >= 50 ? 'warning' : 'error'}
                />
              </Box>
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {s.topics.map((t) => (
                  <Box key={t.topicId} sx={{ px: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{t.topicName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t.percentage}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={t.percentage}
                      color={
                        t.percentage >= 70 ? 'success' : t.percentage >= 50 ? 'warning' : 'error'
                      }
                      sx={{ height: 6, borderRadius: 3 }}
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
