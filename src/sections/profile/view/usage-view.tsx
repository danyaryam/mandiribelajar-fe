'use client';

import type { UsageRow } from 'src/lib/api/me';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import Alert from '@mui/material/Alert';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

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

export function UsageView() {
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
    <Box sx={{ maxWidth: 760, mx: 'auto', px: 3, py: 8 }}>
      <Typography variant="h4" gutterBottom>
        Penggunaan Kuota
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!error && rows.length === 0 ? (
        <Typography color="text.secondary">Belum ada aktivitas kuota.</Typography>
      ) : (
        <Card>
          <List disablePadding>
            {rows.map((row, i) => (
              <ListItem key={i} divider={i < rows.length - 1}>
                <ListItemText
                  primary={TYPE_LABEL[row.type] ?? row.type}
                  secondary={new Date(row.createdAt).toLocaleString('id-ID')}
                />
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: row.amount > 0 ? 'success.main' : 'text.secondary',
                  }}
                >
                  {row.amount > 0 ? `+${row.amount}` : row.amount} soal
                </Typography>
              </ListItem>
            ))}
          </List>
        </Card>
      )}
    </Box>
  );
}
