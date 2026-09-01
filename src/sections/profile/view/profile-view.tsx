'use client';

import type { Profile } from 'src/lib/api/me';
import type { SessionHistoryItem } from 'src/lib/api/practice';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { updateMe } from 'src/lib/api/me';
import { ApiError } from 'src/lib/api/client';
import { listSessions } from 'src/lib/api/practice';
import { fetchMe, getAccessToken } from 'src/lib/api/auth';

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------
// Profil pengguna (Fase 1 + 5): info akun, edit nama/avatar, riwayat latihan.
// ----------------------------------------------------------------------

const profileSchema = z.object({
  name: z.string().min(2, 'Minimal 2 karakter.'),
  avatarUrl: z.string().url('URL tidak valid.').or(z.literal('')),
});

export function ProfileView() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [history, setHistory] = useState<SessionHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const methods = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', avatarUrl: '' },
  });

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(paths.auth.login);
      return;
    }
    Promise.all([fetchMe(), listSessions()])
      .then(([me, sessions]) => {
        setHistory(sessions);
        if (me) {
          const profile: Profile = { id: me.id, name: me.name, email: me.email };
          setUser(profile);
          methods.setValue('name', me.name);
          methods.setValue('avatarUrl', '');
        }
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Gagal memuat profil.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = methods.handleSubmit(async (values) => {
    setError(null);
    setSaved(false);
    try {
      const updated = await updateMe({ name: values.name, avatarUrl: values.avatarUrl || null });
      setUser((prev) =>
        prev ? { ...prev, name: updated.name, avatarUrl: updated.avatarUrl } : prev
      );
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memperbarui profil.');
    }
  });

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', px: 3, py: 8 }}>
      <Typography variant="h4" gutterBottom>
        Profil
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profil berhasil diperbarui.
        </Alert>
      )}

      {!loading && user && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                {(user.name ?? '?').charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6">{user.name}</Typography>
                <Typography color="text.secondary">{user.email}</Typography>
              </Box>
            </Stack>

            <Form methods={methods} onSubmit={handleSave}>
              <Stack spacing={2.5} sx={{ maxWidth: 420 }}>
                <Field.Text name="name" label="Nama Lengkap" />
                <Field.Text name="avatarUrl" label="URL Avatar (opsional)" />
                <Box>
                  <Button type="submit" variant="contained">
                    Simpan Profil
                  </Button>
                </Box>
              </Stack>
            </Form>
          </CardContent>
        </Card>
      )}

      <Box
        sx={{
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="h6">Riwayat Latihan</Typography>
        <Stack direction="row" spacing={1}>
          <RouterLink href={paths.bookmarks}>
            <Button variant="text" color="primary">
              Pelajari Lagi
            </Button>
          </RouterLink>
          <RouterLink href={paths.progress}>
            <Button variant="text" color="primary">
              Laporan Progres
            </Button>
          </RouterLink>
          <RouterLink href={paths.usage}>
            <Button variant="text" color="primary">
              Penggunaan Kuota
            </Button>
          </RouterLink>
        </Stack>
      </Box>

      {history.length === 0 ? (
        <Typography color="text.secondary">Belum ada latihan yang tercatat.</Typography>
      ) : (
        <Card>
          <List disablePadding>
            {history.map((s, i) => {
              const pct = s.maxScore ? Math.round(((s.score ?? 0) / s.maxScore) * 100) : null;
              return (
                <ListItem key={s.id} divider={i < history.length - 1}>
                  <ListItemText primary={s.title || 'Latihan'} secondary={s.status} />
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <Typography color="text.secondary">
                      {new Date(s.createdAt).toLocaleDateString('id-ID')}
                    </Typography>
                    {pct != null && <Typography sx={{ fontWeight: 600 }}>{pct}%</Typography>}
                  </Stack>
                </ListItem>
              );
            })}
          </List>
        </Card>
      )}
    </Box>
  );
}
