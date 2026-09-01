'use client';

import { useSearchParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------
// Hasil pembayaran: hanya membaca status dari backend (polling). Redirect
// provider diarahkan ke sini; entitlement hanya aktif setelah webhook valid.
// ----------------------------------------------------------------------

export function PaymentsResultView() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId');

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', px: 3, py: 10, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Status Pembayaran
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        Pembayaran Anda sedang kami verifikasi. Entitlement akan aktif setelah konfirmasi dari
        provider (webhook) berhasil — halaman ini tidak mengaktifkan paket secara langsung.
      </Alert>
      {paymentId && (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          ID Transaksi: {paymentId}
        </Typography>
      )}
      <Button
        variant="contained"
        component="a"
        href={paths.payments.root}
        onClick={(e) => e.preventDefault()}
      >
        Lihat Riwayat Pembayaran
      </Button>
    </Box>
  );
}
