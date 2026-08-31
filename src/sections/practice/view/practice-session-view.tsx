'use client';

import type { SessionDetail, SessionQuestion } from 'src/lib/api/practice';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';

import { ApiError } from 'src/lib/api/client';
import { getAccessToken } from 'src/lib/api/auth';
import { getSession, saveAnswer, submitSession } from 'src/lib/api/practice';

// ----------------------------------------------------------------------
// Halaman pengerjaan soal. Jawaban di-autosave; submit mengunci & menilai.
// ----------------------------------------------------------------------

type Props = {
  sessionId: string;
};

export function PracticeSessionView({ sessionId }: Props) {
  const router = useRouter();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, { selectedOptionId?: string; text?: string }>>({});
  const [revision, setRevision] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(paths.auth.login);
      return;
    }
    getSession(sessionId)
      .then((s) => {
        setSession(s);
        const d: Record<string, { selectedOptionId?: string; text?: string }> = {};
        s.questions.forEach((q) => {
          d[q.id] = q.draftAnswer ?? {};
        });
        setDrafts(d);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Gagal memuat latihan.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const question: SessionQuestion | undefined = session?.questions[current];

  const persist = (qid: string, value: { selectedOptionId?: string; text?: string }) => {
    const nextDrafts = { ...drafts, [qid]: value };
    setDrafts(nextDrafts);
    const rev = (revision[qid] ?? 0) + 1;
    setRevision((r) => ({ ...r, [qid]: rev }));
    saveAnswer(sessionId, qid, value, rev).catch(() => {
      /* autosave best-effort */
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await submitSession(sessionId);
      router.push(paths.courses.result(sessionId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal mengumpulkan jawaban.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ maxWidth: 760, mx: 'auto', px: 3, py: 12, textAlign: 'center' }}>
        <Typography color="text.secondary">Memuat latihan…</Typography>
      </Box>
    );
  }

  if (error || !session || !question) {
    return (
      <Box sx={{ maxWidth: 760, mx: 'auto', px: 3, py: 12, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error ?? 'Sesi tidak tersedia.'}
        </Alert>
      </Box>
    );
  }

  const draft = drafts[question.id] ?? {};

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', px: 3, py: 8 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Typography variant="h5">{session.title || 'Latihan'}</Typography>
        <Typography color="text.secondary">
          Soal {question.position} dari {session.questions.length}
        </Typography>
      </Box>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          {current + 1}. {question.prompt}
        </Typography>

        {question.type === 'multiple_choice' && (
          <RadioGroup
            value={draft.selectedOptionId ?? ''}
            onChange={(e) => persist(question.id, { selectedOptionId: e.target.value })}
          >
            <Stack spacing={1}>
              {(question.options ?? []).map((opt) => (
                <FormControlLabel key={opt.id} value={opt.id} control={<Radio />} label={`${opt.label}. ${opt.text}`} />
              ))}
            </Stack>
          </RadioGroup>
        )}

        {question.type === 'text' && (
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Jawabanmu"
            value={draft.text ?? ''}
            onChange={(e) => persist(question.id, { text: e.target.value })}
          />
        )}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Button
          variant="outlined"
          disabled={current === 0}
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
        >
          Sebelumnya
        </Button>

        {current < session.questions.length - 1 ? (
          <Button variant="contained" onClick={() => setCurrent((c) => c + 1)}>
            Berikutnya
          </Button>
        ) : (
          <Button variant="contained" color="success" disabled={submitting} onClick={handleSubmit}>
            {submitting ? 'Mengumpulkan…' : 'Kumpulkan Latihan'}
          </Button>
        )}
      </Box>
    </Box>
  );
}
