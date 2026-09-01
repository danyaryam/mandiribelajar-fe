'use client';

import type { AIGeneration } from 'src/lib/api/admin';

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
import { listAIGenerations } from 'src/lib/api/admin';

// ----------------------------------------------------------------------
// Admin: monitoring generasi & kegagalan AI (Fase 7).
// ----------------------------------------------------------------------

export function AdminAIGenerationsView() {
  const router = useRouter();
  const [rows, setRows] = useState<AIGeneration[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(paths.auth.login);
      return;
    }
    listAIGenerations(status || undefined)
      .then(setRows)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Gagal memuat log AI.'))
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
        <Typography variant="h4">Monitoring AI</Typography>
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          sx={{ minWidth: 180 }}
          onChange={(e) => setStatus(e.target.value)}
        >
          <MenuItem value="">Semua</MenuItem>
          <MenuItem value="success">Sukses</MenuItem>
          <MenuItem value="failed">Gagal</MenuItem>
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
              <TableCell>Model</TableCell>
              <TableCell>Prompt</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Latensi</TableCell>
              <TableCell>Soal</TableCell>
              <TableCell>Waktu</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((g) => (
              <TableRow key={g.id}>
                <TableCell>{g.model}</TableCell>
                <TableCell>{g.promptVersion}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    color={g.status === 'success' ? 'success' : 'error'}
                    label={g.status}
                  />
                </TableCell>
                <TableCell>{g.latencyMs != null ? `${g.latencyMs}ms` : '—'}</TableCell>
                <TableCell>{g.questionCount ?? '—'}</TableCell>
                <TableCell>{new Date(g.createdAt).toLocaleString('id-ID')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
