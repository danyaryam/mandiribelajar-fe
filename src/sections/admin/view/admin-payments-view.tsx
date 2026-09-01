'use client';

import type { AdminPayment } from 'src/lib/api/admin';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { ApiError } from 'src/lib/api/client';
import { getAccessToken } from 'src/lib/api/auth';
import { listAdminPayments } from 'src/lib/api/admin';

// ----------------------------------------------------------------------
// Admin: transaksi pembayaran (Fase 6/7 monitoring).
// ----------------------------------------------------------------------

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  paid: 'success',
  pending: 'warning',
  failed: 'error',
  expired: 'default',
};

export function AdminPaymentsView() {
  const theme = useTheme();
  const router = useRouter();
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(paths.auth.login);
      return;
    }
    listAdminPayments(status || undefined)
      .then(setPayments)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Gagal memuat transaksi.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: 3, py: 5 }}>
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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Transaksi
            </Typography>
            <Typography sx={{ opacity: 0.92, mt: 0.5 }}>
              Pantau status pembayaran pengguna.
            </Typography>
          </Box>
          <TextField
            select
            size="small"
            label="Status"
            value={status}
            sx={{
              minWidth: 180,
              bgcolor: 'rgba(255,255,255,.14)',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,.3)' },
              '& .MuiInputLabel-root, & .MuiSelect-select': { color: '#fff' },
              '& .MuiSvgIcon-root': { color: '#fff' },
            }}
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="">Semua</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
          </TextField>
        </Box>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading && <Typography color="text.secondary">Memuat…</Typography>}

      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.08) }}>
              <TableCell sx={{ fontWeight: 800 }}>Paket</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Pengguna</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Jumlah</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Waktu</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((p) => (
              <TableRow
                key={p.id}
                hover
                sx={{
                  borderBottom: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
                  '&:last-of-type': { borderBottom: 'none' },
                }}
              >
                <TableCell sx={{ fontWeight: 600 }}>{p.planName || '—'}</TableCell>
                <TableCell>{p.userId.slice(0, 8)}…</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  {p.currency} {p.amount}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    variant="soft"
                    color={STATUS_COLOR[p.status] ?? 'default'}
                    label={p.status}
                  />
                </TableCell>
                <TableCell>{new Date(p.createdAt).toLocaleString('id-ID')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
