'use client';

import type { SessionDetail, SessionQuestion } from 'src/lib/api/practice';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';

import { ApiError } from 'src/lib/api/client';
import { getAccessToken } from 'src/lib/api/auth';
import {
  getSession,
  saveAnswer,
  startSession,
  submitSession,
  getSessionStatus,
} from 'src/lib/api/practice';

// ----------------------------------------------------------------------
// Halaman pengerjaan soal. Jawaban di-autosave; submit mengunci & menilai.
// ----------------------------------------------------------------------

type Props = {
  sessionId: string;
};

export function PracticeSessionView({ sessionId }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [drafts, setDrafts] = useState<
    Record<string, { selectedOptionId?: string; text?: string }>
  >({});
  const [revision, setRevision] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadReadySession = (s: SessionDetail) => {
      if (cancelled) return;
      setSession(s);
      const d: Record<string, { selectedOptionId?: string; text?: string }> = {};
      s.questions.forEach((q) => {
        d[q.id] = q.draftAnswer ?? {};
      });
      setDrafts(d);
      setLoading(false);
    };

    if (!getAccessToken()) {
      router.replace(paths.auth.login);
      return () => {
        cancelled = true;
      };
    }

    const pollUntilReady = async () => {
      try {
        for (let i = 0; i < 60; i += 1) {
          const status = await getSessionStatus(sessionId);
          if (status.status === 'ready') {
            await startSession(sessionId).catch(() => undefined);
            const s = await getSession(sessionId);
            loadReadySession(s);
            return;
          }
          if (status.status === 'generation_failed' || status.status === 'expired') {
            throw new ApiError(
              422,
              'Gagal menyiapkan soal. Silakan coba lagi dengan pilihan lain.'
            );
          }
          if (status.status === 'in_progress') {
            const s = await getSession(sessionId);
            loadReadySession(s);
            return;
          }
          await new Promise((r) => setTimeout(r, 2000));
        }
        throw new ApiError(408, 'Waktu penyiapan soal habis. Silakan coba lagi.');
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Gagal memuat latihan.');
        setLoading(false);
      }
    };

    getSession(sessionId)
      .then(async (s) => {
        if (s.status === 'generating') {
          await pollUntilReady();
        } else {
          if (s.status === 'ready') {
            await startSession(sessionId).catch(() => undefined);
            const fresh = await getSession(sessionId);
            loadReadySession(fresh);
          } else {
            loadReadySession(s);
          }
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Gagal memuat latihan.');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const question: SessionQuestion | undefined = session?.questions[current];
  const answeredCount = Object.values(drafts).filter(
    (d) => (d.selectedOptionId && d.selectedOptionId !== '') || (d.text && d.text !== '')
  ).length;

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
  const progressPct = Math.round(((current + 1) / session.questions.length) * 100);

  return (
    <Box sx={{ maxWidth: 820, mx: 'auto', px: 3, py: 5 }}>
      {/* Progress header */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {session.title || 'Latihan'}
          </Typography>
          <Chip
            label={`${answeredCount}/${session.questions.length} terjawab`}
            size="small"
            color={answeredCount === session.questions.length ? 'success' : 'default'}
            variant="soft"
          />
        </Box>
        <LinearProgress
          variant="determinate"
          value={progressPct}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {/* Question card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 3,
          borderRadius: 3,
          border: (t) => `solid 1px ${varAlpha(t.vars.palette.grey['500Channel'], 0.16)}`,
        }}
      >
        <Chip
          label={`Soal ${question.position} dari ${session.questions.length}`}
          size="small"
          color="primary"
          variant="soft"
          sx={{ mb: 2 }}
        />
        <Typography variant="h6" sx={{ mb: 4, lineHeight: 1.6 }}>
          {question.prompt}
        </Typography>

        {question.type === 'multiple_choice' ? (
          <Stack spacing={1.5}>
            {(question.options ?? []).map((opt) => {
              const selected = draft.selectedOptionId === opt.id;
              return (
                <Box
                  key={opt.id}
                  onClick={() => persist(question.id, { selectedOptionId: opt.id })}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: 2.5,
                    cursor: 'pointer',
                    border: (t) =>
                      `solid 2px ${selected ? varAlpha(t.vars.palette.primary.mainChannel, 0.6) : varAlpha(t.vars.palette.grey['500Channel'], 0.16)}`,
                    bgcolor: selected
                      ? `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.12)}, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.04)})`
                      : 'transparent',
                    transition: 'all .15s',
                    '&:hover': {
                      borderColor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.4),
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 800,
                      fontSize: 14,
                      color: selected ? '#fff' : 'text.secondary',
                      bgcolor: selected
                        ? theme.vars.palette.primary.main
                        : (t) => varAlpha(t.vars.palette.grey['500Channel'], 0.12),
                    }}
                  >
                    {opt.label}
                  </Box>
                  <Typography sx={{ fontWeight: 500 }}>{opt.text}</Typography>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <TextField
            fullWidth
            multiline
            minRows={4}
            placeholder="Tulis jawabanmu di sini…"
            value={draft.text ?? ''}
            onChange={(e) => persist(question.id, { text: e.target.value })}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 2.5 },
            }}
          />
        )}
      </Paper>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Button
          variant="outlined"
          disabled={current === 0}
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          sx={{ borderRadius: 2, px: 3 }}
        >
          ← Sebelumnya
        </Button>

        {current < session.questions.length - 1 ? (
          <Button
            variant="contained"
            onClick={() => setCurrent((c) => c + 1)}
            sx={{ borderRadius: 2, px: 4, fontWeight: 700 }}
          >
            Berikutnya →
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            disabled={submitting}
            onClick={handleSubmit}
            sx={{ borderRadius: 2, px: 4, fontWeight: 800 }}
          >
            {submitting ? 'Mengumpulkan…' : 'Kumpulkan Latihan ✓'}
          </Button>
        )}
      </Box>
    </Box>
  );
}
