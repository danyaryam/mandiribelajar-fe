'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

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
// Konfigurasi latihan: pilih jenjang → kelas → mata pelajaran → tipe/jumlah,
// lalu buat sesi (Fase 3, tanpa AI — soal dari bank soal tervalidasi).
// ----------------------------------------------------------------------

export function PracticeConfigureView() {
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
      // If unauthenticated, send to login.
      if (err instanceof ApiError && err.status === 0 && !getAccessToken()) {
        router.push(paths.auth.login);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 620, mx: 'auto', px: 3, py: 8 }}>
      <Typography variant="h4" gutterBottom>
        Konfigurasi Latihan
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Pilih jenjang, kelas, dan mata pelajaran untuk mulai berlatih.
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
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

          <Button
            variant="contained"
            size="large"
            disabled={!canCreate || submitting}
            onClick={handleCreate}
          >
            {submitting ? 'Membuat…' : 'Mulai Latihan'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
