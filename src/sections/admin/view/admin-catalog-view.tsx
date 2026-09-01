'use client';

import type { AdminSubject } from 'src/lib/api/admin';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { paths } from 'src/routes/paths';

import { ApiError } from 'src/lib/api/client';
import { getAccessToken } from 'src/lib/api/auth';
import { listAdminTopics, listAdminSubjects, createAdminSubject } from 'src/lib/api/admin';

// ----------------------------------------------------------------------
// Admin: kelola kurikulum (jenjang, kelas, mapel, topik) — Fase 7.
// ----------------------------------------------------------------------

export function AdminCatalogView() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<AdminSubject[]>([]);
  const [topics, setTopics] = useState<{ id: string; name: string; subjectName: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ slug: '', name: '', description: '' });

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(paths.auth.login);
      return;
    }
    Promise.all([listAdminSubjects(), listAdminTopics()])
      .then(([s, t]) => {
        setSubjects(s);
        setTopics(t);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Gagal memuat kurikulum.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    try {
      await createAdminSubject(form);
      setOpen(false);
      setForm({ slug: '', name: '', description: '' });
      setSubjects(await listAdminSubjects());
    } catch {
      setError('Gagal membuat mata pelajaran.');
    }
  };

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: 3, py: 8 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Kurikulum</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          + Mapel Baru
        </Button>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && <Typography color="text.secondary">Memuat…</Typography>}

      <Stack spacing={4} sx={{ mt: 2 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Mata Pelajaran
          </Typography>
          <Stack spacing={1}>
            {subjects.map((s) => (
              <Box
                key={s.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1,
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>{s.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {s.slug}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  color={s.isActive ? 'success' : 'default'}
                  label={s.isActive ? 'Aktif' : 'Non-aktif'}
                />
              </Box>
            ))}
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Topik
          </Typography>
          <Stack spacing={0.5}>
            {topics.map((t) => (
              <Typography key={t.id} variant="body2">
                • {t.name}{' '}
                <Typography component="span" color="text.secondary">
                  ({t.subjectName})
                </Typography>
              </Typography>
            ))}
          </Stack>
        </Paper>
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Mata Pelajaran Baru</DialogTitle>
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
              label="Deskripsi"
              multiline
              minRows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
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
