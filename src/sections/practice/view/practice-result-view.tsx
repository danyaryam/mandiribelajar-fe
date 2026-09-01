'use client';

import type { PracticeResult } from 'src/lib/api/practice';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';

import { ApiError } from 'src/lib/api/client';
import { getAccessToken } from 'src/lib/api/auth';
import { getResult, addBookmark, removeBookmark, reportQuestion } from 'src/lib/api/practice';

// ----------------------------------------------------------------------

type Props = {
  sessionId: string;
};

const REPORT_REASONS: { value: string; label: string }[] = [
  { value: 'wrong_answer_key', label: 'Kunci jawaban salah' },
  { value: 'incorrect_explanation', label: 'Penjelasan keliru' },
  { value: 'spelling_typo', label: 'Terdapat kesalahan ketik / penulisan' },
  { value: 'off_topic', label: 'Tidak sesuai topik/materi' },
  { value: 'other', label: 'Lainnya' },
];

export function PracticeResultView({ sessionId }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [reportFor, setReportFor] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('wrong_answer_key');
  const [reportNote, setReportNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(paths.auth.login);
      return;
    }
    getResult(sessionId)
      .then(setResult)
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : 'Hasil belum tersedia. Silakan kumpulkan latihan dulu.'
        )
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const toggleBookmark = async (questionId: string) => {
    setBusy(true);
    try {
      if (bookmarked.has(questionId)) {
        await removeBookmark(questionId);
        setBookmarked((prev) => {
          const next = new Set(prev);
          next.delete(questionId);
          return next;
        });
      } else {
        await addBookmark(questionId);
        setBookmarked((prev) => new Set(prev).add(questionId));
      }
    } catch {
      setFlash('Gagal menyimpan/melepas soal. Coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  const submitReport = async () => {
    if (!reportFor) return;
    setBusy(true);
    try {
      await reportQuestion(sessionId, reportFor, reportReason, reportNote || undefined);
      setFlash('Terima kasih — laporan sudah diterima.');
    } catch {
      setFlash('Gagal mengirim laporan. Coba lagi.');
    } finally {
      setBusy(false);
      setReportFor(null);
      setReportReason('wrong_answer_key');
      setReportNote('');
    }
  };

  if (error) {
    return (
      <Box sx={{ maxWidth: 760, mx: 'auto', px: 3, py: 12 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 5 },
            textAlign: 'center',
            borderRadius: 3,
            border: (t) => `solid 1px ${varAlpha(t.vars.palette.grey['500Channel'], 0.16)}`,
            background: `linear-gradient(135deg, ${varAlpha(theme.vars.palette.warning.mainChannel, 0.08)}, rgba(255,255,255,0))`,
          }}
        >
          <Typography sx={{ fontSize: 44 }}>🧩</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Hasil belum tersedia
          </Typography>
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            component="a"
            href={paths.dashboard}
            onClick={(e) => e.preventDefault()}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Ke Dashboard
          </Button>
        </Paper>
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
      {/* Score hero card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 5 },
          mb: 4,
          textAlign: 'center',
          borderRadius: 3,
          border: `solid 1px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.18)}`,
          background: `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.08)}, ${varAlpha(theme.vars.palette.secondary.mainChannel, 0.08)})`,
        }}
      >
        <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary' }}>
          Hasil Latihan
        </Typography>
        <Box
          sx={{
            position: 'relative',
            width: 176,
            height: 176,
            mx: 'auto',
            my: 3,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {/* Gradient ring */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: `conic-gradient(${theme.vars.palette.primary.main} ${pct * 3.6}deg, ${varAlpha(theme.vars.palette.grey['500Channel'], 0.15)} 0deg)`,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 12,
              borderRadius: '50%',
              bgcolor: 'background.default',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 10px 28px rgba(0,0,0,.08)',
            }}
          >
            <Box>
              <Typography variant="h1" sx={{ fontWeight: 800, lineHeight: 1 }}>
                {pct}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {result.score} dari {result.maxScore} poin
              </Typography>
            </Box>
          </Box>
        </Box>
        <Stack direction="row" spacing={3} sx={{ mt: 1, justifyContent: 'center' }}>
          <Box>
            <Typography variant="h5" sx={{ color: 'success.main', fontWeight: 800 }}>
              {result.correctCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Benar
            </Typography>
          </Box>
          <Box>
            <Typography variant="h5" sx={{ color: 'error.main', fontWeight: 800 }}>
              {result.incorrectCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Salah
            </Typography>
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {result.unansweredCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Kosong
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Pembahasan
      </Typography>
      <Stack spacing={2}>
        {result.answers.map((a) => (
          <Paper
            key={a.questionId}
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 3,
              border: (t) =>
                `solid 1px ${varAlpha(a.isCorrect ? t.vars.palette.success.mainChannel : t.vars.palette.error.mainChannel, 0.18)}`,
              background: (t) =>
                `linear-gradient(135deg, ${varAlpha(a.isCorrect ? t.vars.palette.success.mainChannel : t.vars.palette.error.mainChannel, 0.07)}, rgba(255,255,255,0.3))`,
              transition: 'transform .18s, box-shadow .18s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 28px rgba(0,0,0,.08)',
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
                gap: 2,
              }}
            >
              <Typography sx={{ fontWeight: 700, mr: 2 }}>
                {a.position}. {a.prompt}
              </Typography>
              <Chip
                size="small"
                label={a.isCorrect ? 'Benar' : 'Salah'}
                color={a.isCorrect ? 'success' : 'error'}
                variant="soft"
              />
            </Box>
            {a.userAnswer?.text != null && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Jawabanmu: {a.userAnswer.text || '(kosong)'}
              </Typography>
            )}
            {a.correctAnswer?.text != null && (
              <Typography variant="body2" color="success.main" sx={{ mb: 1, fontWeight: 600 }}>
                Jawaban benar: {a.correctAnswer.text}
              </Typography>
            )}
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="body2" color="text.secondary">
              {a.explanation || '—'}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button
                size="small"
                variant={bookmarked.has(a.questionId) ? 'contained' : 'outlined'}
                onClick={() => toggleBookmark(a.questionId)}
                sx={{ borderRadius: 2 }}
              >
                {bookmarked.has(a.questionId) ? '★ Tersimpan' : '☆ Simpan'}
              </Button>
              <Button size="small" variant="text" onClick={() => setReportFor(a.questionId)}>
                Laporkan soal
              </Button>
            </Stack>
          </Paper>
        ))}
      </Stack>

      {result.topicBreakdown.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mt: 5, mb: 2, fontWeight: 700 }}>
            Rincian per Topik
          </Typography>
          <Stack spacing={1.5}>
            {result.topicBreakdown.map((t) => (
              <Paper
                key={t.topicId}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
                  background: `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.05)}, rgba(255,255,255,0))`,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }}>{t.topicName || 'Topik'}</Typography>
                  <Typography sx={{ fontWeight: 800 }}>{t.score}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={t.score}
                  color={t.score < 50 ? 'error' : t.score < 70 ? 'warning' : 'success'}
                  sx={{ height: 6, borderRadius: 4 }}
                />
              </Paper>
            ))}
          </Stack>
        </>
      )}

      {result.recommendations.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mt: 5, mb: 2, fontWeight: 700 }}>
            Rekomendasi
          </Typography>
          <Stack spacing={1}>
            {result.recommendations.map((r, i) => (
              <Alert
                key={`${r.topicId}-${i}`}
                severity="info"
                sx={{ alignItems: 'center', borderRadius: 2, fontWeight: 500 }}
              >
                {r.reason}
              </Alert>
            ))}
          </Stack>
        </>
      )}

      {flash && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setFlash(null)}>
          {flash}
        </Alert>
      )}

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          component="a"
          href={paths.courses.configure}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Latihan Lagi
        </Button>
        <Button
          variant="contained"
          component="a"
          href={paths.dashboard}
          sx={{ borderRadius: 2, px: 3, fontWeight: 800 }}
        >
          Ke Dashboard
        </Button>
      </Box>

      <Dialog open={Boolean(reportFor)} onClose={() => setReportFor(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Laporkan Soal</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              select
              fullWidth
              label="Alasan"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              {REPORT_REASONS.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Catatan (opsional)"
              value={reportNote}
              onChange={(e) => setReportNote(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportFor(null)}>Batal</Button>
          <Button variant="contained" disabled={busy} onClick={submitReport}>
            Kirim Laporan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
