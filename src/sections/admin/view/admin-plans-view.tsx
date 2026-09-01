'use client';

import type { AdminPlan } from 'src/lib/api/admin';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { paths } from 'src/routes/paths';

import { ApiError } from 'src/lib/api/client';
import { getAccessToken } from 'src/lib/api/auth';
import { listAdminPlans, createAdminPlan, updateAdminPlan } from 'src/lib/api/admin';

// ----------------------------------------------------------------------
// Admin: kelola paket / plans (Fase 7, api-contract.md §9 admin/plans).
// ----------------------------------------------------------------------

export function AdminPlansView() {
  const theme = useTheme();
  const router = useRouter();
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ slug: '', name: '', quota: 5, amount: 0 });

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(paths.auth.login);
      return;
    }
    listAdminPlans()
      .then(setPlans)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Gagal memuat paket.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    try {
      await createAdminPlan({ ...form, period: 'month' });
      setOpen(false);
      setPlans(await listAdminPlans());
    } catch {
      setError('Gagal membuat paket.');
    }
  };

  const handleToggleActive = async (plan: AdminPlan) => {
    try {
      await updateAdminPlan(plan.id, {
        isActive: !plan.isActive,
        name: plan.name,
        quota: plan.quota,
      });
      setPlans(await listAdminPlans());
    } catch {
      setError('Gagal memperbarui paket.');
    }
  };

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
              Kelola Paket
            </Typography>
            <Typography sx={{ opacity: 0.92, mt: 0.5 }}>
              Atur paket, kuota, dan status aktif.
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => setOpen(true)}
            sx={{
              bgcolor: '#fff',
              color: theme.vars.palette.primary.darker,
              fontWeight: 800,
              '&:hover': { bgcolor: (t) => varAlpha(t.vars.palette.common.whiteChannel, 0.9) },
            }}
          >
            + Paket Baru
          </Button>
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
              <TableCell sx={{ fontWeight: 800 }}>Harga</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Kuota</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Periode</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>
                Aksi
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow
                key={plan.id}
                hover
                sx={{
                  borderBottom: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
                  '&:last-of-type': { borderBottom: 'none' },
                }}
              >
                <TableCell>
                  <Typography sx={{ fontWeight: 700 }}>{plan.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {plan.slug}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  {plan.amount > 0 ? `${plan.currency} ${plan.amount}` : 'Gratis'}
                </TableCell>
                <TableCell>{plan.quota}</TableCell>
                <TableCell>{plan.period}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    variant="soft"
                    color={plan.isActive ? 'success' : 'default'}
                    label={plan.isActive ? 'Aktif' : 'Non-aktif'}
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    color={plan.isActive ? 'error' : 'primary'}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                    onClick={() => handleToggleActive(plan)}
                  >
                    {plan.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Paket Baru</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
            <TextField
              label="Nama"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextField
              label="Kuota"
              type="number"
              value={form.quota}
              onChange={(e) => setForm({ ...form, quota: Number(e.target.value) })}
            />
            <TextField
              label="Harga (IDR)"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Batal</Button>
          <Button variant="contained" onClick={handleCreate}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
