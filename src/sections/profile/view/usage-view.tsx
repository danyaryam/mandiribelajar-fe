'use client';

import type { UsageRow } from 'src/lib/api/me';

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

import { paths } from 'src/routes/paths';

import { getUsage } from 'src/lib/api/me';
import { ApiError } from 'src/lib/api/client';
import { getAccessToken } from 'src/lib/api/auth';

// ----------------------------------------------------------------------
// Penggunaan kuota / usage ledger (Fase 5, §5 GET /me/usage).
// ----------------------------------------------------------------------

const TYPE_LABEL: Record<string, string> = {
  credit: 'Kredit',
  reservation: 'Reservasi',
  consume: 'Terpakai',
  release: 'Dikembalikan',
  refund: 'Refund',
};

const TYPE_COLOR: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  credit: 'success',
  reservation: 'info',
  consume: 'warning',
  release: 'info',
  refund: 'error',
};

export function UsageView() {
  const theme = useTheme();
  const router = useRouter();
  const [rows, setRows] = useState<UsageRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(paths.auth.login);
      return;
    }
    getUsage()
      .then(setRows)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Gagal memuat penggunaan kuota.')
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', px: 3, py: 5 }}>
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
          Penggunaan Kuota
        </Typography>
        <Typography sx={{ opacity: 0.92, mt: 0.5 }}>
          Riwayat kredit, konsumsi, dan pengembalian kuota soal.
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {!error && rows.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
            textAlign: 'center',
            py: 5,
          }}
        >
          <Typography sx={{ fontSize: 40 }}>📦</Typography>
          <Typography color="text.secondary">Belum ada aktivitas kuota.</Typography>
        </Card>
      ) : (
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
            overflow: 'hidden',
          }}
        >
          {rows.map((row, i) => {
            const amountColor = row.amount > 0 ? 'success.main' : 'text.secondary';
            return (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  bgcolor:
                    i % 2 === 0
                      ? 'transparent'
                      : (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.04),
                  borderBottom:
                    i < rows.length - 1
                      ? `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`
                      : 'none',
                }}
              >
                <Box>
                  <Chip
                    size="small"
                    label={TYPE_LABEL[row.type] ?? row.type}
                    color={TYPE_COLOR[row.type] ?? 'default'}
                    variant="soft"
                    sx={{ mb: 0.75 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(row.createdAt).toLocaleString('id-ID')}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'baseline' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: amountColor }}>
                    {row.amount > 0 ? `+${row.amount}` : row.amount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    soal
                  </Typography>
                </Stack>
              </Box>
            );
          })}
        </Card>
      )}
    </Box>
  );
}
