'use client';

import type { AIGeneration } from 'src/lib/api/admin';

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
import { listAIGenerations } from 'src/lib/api/admin';

// ----------------------------------------------------------------------
// Admin: monitoring generasi & kegagalan AI (Fase 7).
// ----------------------------------------------------------------------

export function AdminAIGenerationsView() {
  const theme = useTheme();
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
              Monitoring AI
            </Typography>
            <Typography sx={{ opacity: 0.92, mt: 0.5 }}>
              Log generasi serta kegagalan model AI.
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
            <MenuItem value="success">Sukses</MenuItem>
            <MenuItem value="failed">Gagal</MenuItem>
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
              <TableCell sx={{ fontWeight: 800 }}>Model</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Prompt</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Latensi</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Soal</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Waktu</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((g) => (
              <TableRow
                key={g.id}
                hover
                sx={{
                  borderBottom: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
                  '&:last-of-type': { borderBottom: 'none' },
                }}
              >
                <TableCell sx={{ fontWeight: 600 }}>{g.model}</TableCell>
                <TableCell>{g.promptVersion}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    variant="soft"
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
