'use client';

import type { PracticeResult } from 'src/lib/api/practice';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { ApiError } from 'src/lib/api/client';
import { getResult } from 'src/lib/api/practice';
import { getAccessToken } from 'src/lib/api/auth';

// ----------------------------------------------------------------------

type Props = {
  sessionId: string;
};

export function PracticeResultView({ sessionId }: Props) {
  const router = useRouter();
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(paths.auth.login);
      return;
    }
    getResult(sessionId)
      .then(setResult)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Hasil belum tersedia. Silakan kumpulkan latihan dulu.')
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  if (error) {
    return (
      <Box sx={{ maxWidth: 760, mx: 'auto', px: 3, py: 12 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" component="a" href={paths.dashboard} onClick={(e) => e.preventDefault()}>
          Ke Dashboard
        </Button>
      </Box>
    );
  }

  if (!result) {
    return (
      <Box sx={{ maxWidth: 760, mx: 'auto', px: 3, py: 12, textAlign: 'center' }}>
        <Typography color="text.secondary">Memuat hasil…</Typography>
      </Box>
    );
  }

  const pct = result.maxScore ? Math.round((result.score / result.maxScore) * 100) : 0;

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', px: 3, py: 8 }}>
      <Paper sx={{ p: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="overline" color="primary">
          Hasil Latihan
        </Typography>
        <Typography variant="h2" sx={{ mb: 1 }}>
          {pct}%
        </Typography>
        <Typography color="text.secondary">
          {result.score} dari {result.maxScore} poin
        </Typography>
        <Stack direction="row" spacing={3} sx={{ mt: 3, justifyContent: 'center' }}>
          <Box>
            <Typography variant="h5" sx={{ color: 'success.main' }}>
              {result.correctCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Benar
            </Typography>
          </Box>
          <Box>
            <Typography variant="h5" sx={{ color: 'error.main' }}>
              {result.incorrectCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Salah
            </Typography>
          </Box>
          <Box>
            <Typography variant="h5">{result.unansweredCount}</Typography>
            <Typography variant="body2" color="text.secondary">
              Kosong
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Pembahasan
      </Typography>
      <Stack spacing={2}>
        {result.answers.map((a) => (
          <Paper key={a.questionId} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography sx={{ fontWeight: 600, mr: 2 }}>
                {a.position}. {a.prompt}
              </Typography>
              <Box
                component="span"
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: 12,
                  fontWeight: 700,
                  color: a.isCorrect ? 'success.main' : 'error.main',
                  bgcolor: a.isCorrect ? 'success.lighter' : 'error.lighter',
                }}
              >
                {a.isCorrect ? 'Benar' : 'Salah'}
              </Box>
            </Box>
            {a.userAnswer?.text != null && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Jawabanmu: {a.userAnswer.text || '(kosong)'}
              </Typography>
            )}
            {a.correctAnswer?.text != null && (
              <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
                Jawaban benar: {a.correctAnswer.text}
              </Typography>
            )}
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="body2" color="text.secondary">
              {a.explanation || '—'}
            </Typography>
          </Paper>
        ))}
      </Stack>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button variant="outlined" component="a" href={paths.courses.configure}>
          Latihan Lagi
        </Button>
        <Button variant="contained" component="a" href={paths.dashboard}>
          Ke Dashboard
        </Button>
      </Box>
    </Box>
  );
}
