'use client';

import type { PaymentDetail } from 'src/lib/api/billing';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { ApiError } from 'src/lib/api/client';
import { getPayment } from 'src/lib/api/billing';
import { getAccessToken } from 'src/lib/api/auth';

// ----------------------------------------------------------------------
// Hasil pembayaran: membaca status dari backend (polling) dan menampilkan
// receipt/invoice. Entitlement hanya aktif setelah webhook valid.
// ----------------------------------------------------------------------

const fmt = (n: number) => n.toLocaleString('id-ID');
const fmtDate = (s?: string | null) => (s ? new Date(s).toLocaleString('id-ID') : '—');

export function PaymentsResultView() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId') ?? '';
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const cleanup = () => {
      cancelled = true;
    };

    if (!paymentId || !getAccessToken()) {
      return cleanup;
    }

    let tries = 0;

    const poll = async () => {
      try {
        const p = await getPayment(paymentId);
        if (cancelled) return;
        setPayment(p);
        // Poll while pending (provider confirmation).
        if (p.status === 'pending' && tries < 15) {
          tries += 1;
          window.setTimeout(() => {
            void poll();
          }, 2500);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Gagal memuat status pembayaran.');
      }
    };

    poll();
    return cleanup;
  }, [paymentId]);

  if (!paymentId) {
    return (
      <Box sx={{ maxWidth: 560, mx: 'auto', px: 3, py: 10, textAlign: 'center' }}>
        <Alert severity="warning">ID transaksi tidak ditemukan.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', px: 3, py: 10 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
        Status Pembayaran
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!payment && !error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Pembayaran sedang diverifikasi… Entitlement aktif hanya setelah konfirmasi webhook.
        </Alert>
      )}

      {payment && (
        <Card>
          <CardContent>
            <Typography variant="overline" color="primary">
              Receipt / Invoice
            </Typography>
            <Box sx={{ my: 2 }}>
              <Typography variant="h5">
                {payment.currency} {fmt(payment.amount)}
              </Typography>
              <Typography color="text.secondary">{payment.plan?.name ?? 'Paket'}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography color="text.secondary">ID Transaksi</Typography>
              <Typography sx={{ fontWeight: 600 }}>{payment.id}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography color="text.secondary">Referensi Provider</Typography>
              <Typography sx={{ fontWeight: 600 }}>{payment.providerReference || '—'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography color="text.secondary">Waktu Dibuat</Typography>
              <Typography sx={{ fontWeight: 600 }}>{fmtDate(payment.createdAt)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography color="text.secondary">Dibayar</Typography>
              <Typography sx={{ fontWeight: 600 }}>{fmtDate(payment.paidAt)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography color="text.secondary">Status</Typography>
              <Typography sx={{ fontWeight: 700 }}>{payment.status}</Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <RouterLink href={paths.payments.root}>
          <Button variant="contained">Lihat Riwayat Pembayaran</Button>
        </RouterLink>
      </Box>
    </Box>
  );
}
