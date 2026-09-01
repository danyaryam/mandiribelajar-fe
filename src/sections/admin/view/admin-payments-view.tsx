'use client';

import type { AdminPayment } from 'src/lib/api/admin';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    <Box sx={{ maxWidth: 960, mx: 'auto', px: 3, py: 8 }}>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h4">Transaksi</Typography>
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          sx={{ minWidth: 180 }}
          onChange={(e) => setStatus(e.target.value)}
        >
          <MenuItem value="">Semua</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="paid">Paid</MenuItem>
          <MenuItem value="failed">Failed</MenuItem>
          <MenuItem value="expired">Expired</MenuItem>
        </TextField>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && <Typography color="text.secondary">Memuat…</Typography>}

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Paket</TableCell>
              <TableCell>Pengguna</TableCell>
              <TableCell>Jumlah</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Waktu</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.planName || '—'}</TableCell>
                <TableCell>{p.userId.slice(0, 8)}…</TableCell>
                <TableCell>
                  {p.currency} {p.amount}
                </TableCell>
                <TableCell>
                  <Chip size="small" color={STATUS_COLOR[p.status] ?? 'default'} label={p.status} />
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
