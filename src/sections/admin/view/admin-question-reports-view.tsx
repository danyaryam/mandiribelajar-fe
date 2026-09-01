'use client';

import type { QuestionReport } from 'src/lib/api/admin';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
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
    <Box sx={{ maxWidth: 860, mx: 'auto', px: 3, py: 8 }}>
      <Typography variant="h4" gutterBottom>
        Laporan Soal
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && <Typography color="text.secondary">Memuat…</Typography>}

      {!loading && reports.length === 0 && (
        <Typography color="text.secondary">Tidak ada laporan terbuka.</Typography>
      )}

      <Stack spacing={2}>
        {reports.map((report) => (
          <Paper key={report.id} sx={{ p: 3 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
            >
              <Typography sx={{ fontWeight: 600 }}>
                Soal: {report.questionId.slice(0, 8)}…
              </Typography>
              <Chip
                label={STATUS_LABEL[report.status] ?? report.status}
                size="small"
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
                onClick={() => handleReview(report, 'reviewed')}
              >
                Tandai Review
              </Button>
              <Button variant="outlined" onClick={() => handleReview(report, 'dismissed')}>
                Abaikan
              </Button>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
