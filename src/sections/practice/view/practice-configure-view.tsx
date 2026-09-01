'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';

import { ApiError } from 'src/lib/api/client';
import { getAccessToken } from 'src/lib/api/auth';
import { createPracticeSession } from 'src/lib/api/practice';
import {
  useSubjectsQuery,
  useGradesByLevelQuery,
  useEducationLevelsQuery,
} from 'src/lib/api/use-catalog';

// ----------------------------------------------------------------------
// Konfigurasi latihan: pilih jenjang → kelas → mata pelajaran → jumlah soal.
// ----------------------------------------------------------------------

export function PracticeConfigureView() {
  const theme = useTheme();
  const router = useRouter();
  const [levelId, setLevelId] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const levelsQuery = useEducationLevelsQuery();
  const gradesQuery = useGradesByLevelQuery(levelId || undefined);
  const subjectsQuery = useSubjectsQuery({
    levelId: levelId || undefined,
    gradeId: gradeId || undefined,
  });

  const canCreate = levelId && gradeId && subjectId;

  const steps = [
    { label: 'Jenjang', active: !!levelId, query: levelsQuery },
    { label: 'Kelas', active: !!gradeId, query: gradesQuery },
    { label: 'Mapel', active: !!subjectId, query: subjectsQuery },
  ];

  const handleCreate = async () => {
    if (!canCreate) return;
    setError(null);
    setSubmitting(true);
    try {
      if (!getAccessToken()) {
        router.push(paths.auth.login);
        return;
      }
      const session = await createPracticeSession({
        educationLevelId: levelId,
        gradeId,
        subjectId,
        topicIds: [],
        difficulty: 'medium',
        questionTypes: ['multiple_choice', 'text'],
        questionCount,
        language: 'id-ID',
      });
      await router.push(paths.courses.session(session.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Terjadi kesalahan. Coba lagi.');
      if (err instanceof ApiError && err.status === 0 && !getAccessToken()) {
        router.push(paths.auth.login);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 620, mx: 'auto', px: 3, py: 5 }}>
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
          Konfigurasi Latihan
        </Typography>
        <Typography sx={{ opacity: 0.92, mt: 0.5 }}>
          Pilih jenjang, kelas, dan mata pelajaran untuk mulai berlatih.
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          {/* Stepper summary */}
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            {steps.map((s, i) => (
              <Box
                key={s.label}
                sx={{
                  flex: 1,
                  textAlign: 'center',
                  py: 1.2,
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: 13,
                  border: (t) =>
                    `solid 1px ${s.active ? 'transparent' : varAlpha(t.vars.palette.grey['500Channel'], 0.2)}`,
                  color: s.active ? '#fff' : 'text.secondary',
                  bgcolor: s.active ? theme.vars.palette.primary.main : 'transparent',
                  ...(s.active && {
                    boxShadow: `0 6px 18px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.35)}`,
                  }),
                }}
              >
                {i + 1}. {s.label}
              </Box>
            ))}
          </Stack>

          <Stack spacing={2.5}>
            <TextField
              select
              label="Jenjang"
              value={levelId}
              onChange={(e) => {
                setLevelId(e.target.value);
                setGradeId('');
                setSubjectId('');
              }}
            >
              {(levelsQuery.data ?? []).map((l) => (
                <MenuItem key={l.id} value={l.id}>
                  {l.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Kelas"
              value={gradeId}
              disabled={!levelId}
              onChange={(e) => {
                setGradeId(e.target.value);
                setSubjectId('');
              }}
            >
              {(gradesQuery.data ?? []).map((g) => (
                <MenuItem key={g.id} value={g.id}>
                  {g.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Mata Pelajaran"
              value={subjectId}
              disabled={!gradeId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              {(subjectsQuery.data ?? []).map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Jumlah Soal"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
            >
              {[5, 10, 15, 20].map((n) => (
                <MenuItem key={n} value={n}>
                  {n} soal
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      <Button
        variant="contained"
        size="large"
        fullWidth
        disabled={!canCreate || submitting}
        onClick={handleCreate}
        sx={{ py: 1.5, fontWeight: 800, borderRadius: 2 }}
      >
        {submitting ? 'Membuat…' : canCreate ? '🚀 Mulai Latihan' : 'Lengkapi pilihan di atas'}
      </Button>
    </Box>
  );
}
