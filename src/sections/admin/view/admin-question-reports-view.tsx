'use client';

import type { QuestionReport } from 'src/lib/api/admin';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { ApiError } from 'src/lib/api/client';
import { getAccessToken } from 'src/lib/api/auth';
import { listQuestionReports, updateQuestionReport } from 'src/lib/api/admin';

// ----------------------------------------------------------------------
// Admin: review laporan kualitas soal (Fase 7, api-contract.md §9).
// ----------------------------------------------------------------------

const STATUS_LABEL: Record<string, string> = {
  open: 'Terbuka',
  reviewed: 'Sudah direview',
  dismissed: 'Diabaikan',
};

export function AdminQuestionReportsView() {
  const theme = useTheme();
  const router = useRouter();
  const [reports, setReports] = useState<QuestionReport[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(paths.auth.login);
      return;
    }
    listQuestionReports('open')
      .then(setReports)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Gagal memuat laporan.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReview = async (report: QuestionReport, status: 'reviewed' | 'dismissed') => {
    try {
      await updateQuestionReport(report.id, status);
      setReports((prev) => prev.filter((r) => r.id !== report.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memperbarui laporan.');
    }
  };

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
          Laporan Soal
        </Typography>
        <Typography sx={{ opacity: 0.92, mt: 0.5 }}>
          Review laporan kualitas soal dari pengguna.
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading && <Typography color="text.secondary">Memuat…</Typography>}

      {!loading && reports.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: 'center',
            borderRadius: 3,
            border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
          }}
        >
          <Typography sx={{ fontSize: 40 }}>✅</Typography>
          <Typography color="text.secondary">Tidak ada laporan terbuka.</Typography>
        </Paper>
      )}

      <Stack spacing={2}>
        {reports.map((report) => (
          <Paper
            key={report.id}
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 3,
              border: `solid 1px ${varAlpha(theme.vars.palette.warning.mainChannel, 0.2)}`,
              background: `linear-gradient(135deg, ${varAlpha(theme.vars.palette.warning.mainChannel, 0.05)}, rgba(255,255,255,0))`,
              transition: 'transform .18s, box-shadow .18s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 22px rgba(0,0,0,.08)' },
            }}
          >
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
            >
              <Typography sx={{ fontWeight: 700 }}>
                Soal: {report.questionId.slice(0, 8)}…
              </Typography>
              <Chip
                label={STATUS_LABEL[report.status] ?? report.status}
                size="small"
                variant="soft"
                color={report.status === 'open' ? 'warning' : 'default'}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Alasan: {report.reason}
            </Typography>
            {report.note && (
              <Typography variant="body2" color="text.secondary">
                Catatan: {report.note}
              </Typography>
            )}
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="success"
                sx={{ borderRadius: 2, fontWeight: 700 }}
                onClick={() => handleReview(report, 'reviewed')}
              >
                Tandai Review
              </Button>
              <Button
                variant="outlined"
                sx={{ borderRadius: 2, fontWeight: 700 }}
                onClick={() => handleReview(report, 'dismissed')}
              >
                Abaikan
              </Button>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
