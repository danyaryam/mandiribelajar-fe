'use client';

import type { Profile } from 'src/lib/api/me';
import type { SessionHistoryItem } from 'src/lib/api/practice';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { varAlpha } from 'minimal-shared/utils';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

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
  const theme = useTheme();
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
    <Box sx={{ maxWidth: 760, mx: 'auto', px: 3, py: 5 }}>
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
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Profil
        </Typography>
        <Typography sx={{ opacity: 0.92, mt: 0.5 }}>
          Kelola informasi akun dan pantau riwayat belajarmu.
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      {saved && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          Profil berhasil diperbarui.
        </Alert>
      )}

      {!loading && user && (
        <Card
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: 3,
            border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
            background: `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.05)}, rgba(255,255,255,0))`,
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 3 }}>
              <Avatar
                src={user.avatarUrl || undefined}
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'primary.main',
                  fontSize: 24,
                  fontWeight: 800,
                  boxShadow: `0 8px 20px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.3)}`,
                }}
              >
                {(user.name ?? '?').charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {user.name}
                </Typography>
                <Typography color="text.secondary">{user.email}</Typography>
              </Box>
            </Stack>

            <Form methods={methods} onSubmit={handleSave}>
              <Stack spacing={2.5} sx={{ maxWidth: 420 }}>
                <Field.Text name="name" label="Nama Lengkap" />
                <Field.Text name="avatarUrl" label="URL Avatar (opsional)" />
                <Box>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
                  >
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
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Riwayat Latihan
        </Typography>
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
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
            textAlign: 'center',
            py: 5,
          }}
        >
          <Typography sx={{ fontSize: 40 }}>🧘</Typography>
          <Typography color="text.secondary">Belum ada latihan yang tercatat.</Typography>
        </Card>
      ) : (
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
            overflow: 'hidden',
          }}
        >
          {history.map((s, i) => {
            const pct = s.maxScore ? Math.round(((s.score ?? 0) / s.maxScore) * 100) : null;
            return (
              <Box
                key={s.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  bgcolor:
                    i % 2 === 0
                      ? 'transparent'
                      : (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.04),
                  borderBottom:
                    i < history.length - 1
                      ? `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`
                      : 'none',
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700 }}>{s.title || 'Latihan'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(s.createdAt).toLocaleDateString('id-ID')}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Chip
                    size="small"
                    label={s.status}
                    variant="soft"
                    color={
                      s.status === 'completed' ? 'success' : pct != null ? 'primary' : 'default'
                    }
                  />
                  {pct != null && (
                    <Typography sx={{ fontWeight: 800, color: 'primary.main' }}>{pct}%</Typography>
                  )}
                </Stack>
              </Box>
            );
          })}
        </Card>
      )}
    </Box>
  );
}
