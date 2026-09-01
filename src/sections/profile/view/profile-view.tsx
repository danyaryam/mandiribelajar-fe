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
import Divider from '@mui/material/Divider';
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
// Profil pengguna: cover + identitas, statistik aktivitas, edit akun,
// dan riwayat latihan — layout profile page pada umumnya.
// ----------------------------------------------------------------------

const profileSchema = z.object({
  name: z.string().min(2, 'Minimal 2 karakter.'),
  avatarUrl: z.string().url('URL tidak valid.').or(z.literal('')),
});

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ textAlign: { xs: 'left', sm: 'center' } }}>
      <Typography variant="h6" sx={{ fontWeight: 800 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

export function ProfileView() {
  const theme = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [history, setHistory] = useState<SessionHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

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

  const completed = history.filter((h) => h.maxScore != null);
  const avgScore = completed.length
    ? Math.round(
        completed.reduce((acc, h) => acc + ((h.score ?? 0) / (h.maxScore || 1)) * 100, 0) /
          completed.length
      )
    : null;

  const handleSave = methods.handleSubmit(async (values) => {
    setError(null);
    setSaved(false);
    try {
      const updated = await updateMe({ name: values.name, avatarUrl: values.avatarUrl || null });
      setUser((prev) =>
        prev ? { ...prev, name: updated.name, avatarUrl: updated.avatarUrl } : prev
      );
      setSaved(true);
      setEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memperbarui profil.');
    }
  });

  const label = (user?.name ?? '?').charAt(0).toUpperCase();

  return (
    <Box sx={{ maxWidth: 1080, mx: 'auto', px: 3, py: 5 }}>
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
        <>
          {/* ===== Cover ===== */}
          <Box
            sx={{
              borderTopLeftRadius: 3,
              borderTopRightRadius: 3,
              height: { xs: 120, md: 170 },
              color: '#fff',
              ...theme.mixins.bgGradient({
                images: [
                  `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.darkerChannel, 0.94)}, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.85)} 55%, ${varAlpha(theme.vars.palette.secondary.mainChannel, 0.78)})`,
                ],
              }),
            }}
            aria-hidden
          />

          {/* ===== Identitas + stats ===== */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: (t) => `solid 1px ${varAlpha(t.vars.palette.grey['500Channel'], 0.16)}`,
              borderTop: 'none',
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              mt: -1,
              px: { xs: 2, md: 4 },
              pt: 0,
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: { xs: 2, md: 3 },
                  flexWrap: 'wrap',
                }}
              >
                <Avatar
                  src={user.avatarUrl || undefined}
                  sx={{
                    width: { xs: 76, md: 96 },
                    height: { xs: 76, md: 96 },
                    mt: { xs: -3, md: -4 },
                    mb: 1,
                    bgcolor: 'primary.main',
                    fontSize: { xs: 32, md: 40 },
                    fontWeight: 800,
                    border: (t) => `4px solid ${t.vars.palette.background.paper}`,
                    boxShadow: (t) =>
                      `0 10px 24px ${varAlpha(t.vars.palette.primary.mainChannel, 0.3)}`,
                  }}
                >
                  {label}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 200, mt: { xs: 0.5, md: 1 } }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        {user.name}
                      </Typography>
                      <Typography color="text.secondary">{user.email}</Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setEditing((v) => !v)}
                      sx={{ borderRadius: 2 }}
                    >
                      {editing ? 'Batal' : 'Edit Profil'}
                    </Button>
                  </Box>

                  {/* Stats ringkas */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: { xs: 3, sm: 5 },
                      mt: 2.5,
                      px: 0,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Stat label="Latihan" value={String(history.length)} />
                    <Stat label="Skor Rata-rata" value={avgScore != null ? `${avgScore}%` : '—'} />
                    <Stat label="Selesai" value={String(completed.length)} />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* ===== Edit form ===== */}
              {editing ? (
                <Form methods={methods} onSubmit={handleSave}>
                  <Stack spacing={2.5} sx={{ maxWidth: 440 }}>
                    <Field.Text name="name" label="Nama Lengkap" />
                    <Field.Text name="avatarUrl" label="URL Avatar (opsional)" />
                    <Box>
                      <Button
                        type="submit"
                        variant="contained"
                        sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
                      >
                        Simpan Perubahan
                      </Button>
                    </Box>
                  </Stack>
                </Form>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {[
                    { label: 'ID Akun', value: user.id.slice(0, 10) + '…' },
                    { label: 'Status', value: 'Aktif' },
                  ].map((item) => (
                    <Box key={item.label} sx={{ flex: '1 1 200px' }}>
                      <Typography variant="body2" color="text.secondary">
                        {item.label}
                      </Typography>
                      <Chip size="small" label={item.value} variant="soft" sx={{ mt: 0.5 }} />
                    </Box>
                  ))}
                  <Box sx={{ flex: '1 1 200px' }}>
                    <Typography variant="body2" color="text.secondary">
                      Menu
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                      <RouterLink href={paths.bookmarks}>
                        <Button color="primary" size="small">
                          Pelajari Lagi
                        </Button>
                      </RouterLink>
                      <RouterLink href={paths.progress}>
                        <Button color="primary" size="small">
                          Laporan Progres
                        </Button>
                      </RouterLink>
                      <RouterLink href={paths.usage}>
                        <Button color="primary" size="small">
                          Penggunaan Kuota
                        </Button>
                      </RouterLink>
                    </Stack>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* ===== Riwayat latihan ===== */}
          <Typography variant="h6" sx={{ mt: 5, mb: 2, fontWeight: 700 }}>
            Riwayat Latihan
          </Typography>

          {history.length === 0 ? (
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: (t) => `solid 1px ${varAlpha(t.vars.palette.grey['500Channel'], 0.16)}`,
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
                border: (t) => `solid 1px ${varAlpha(t.vars.palette.grey['500Channel'], 0.16)}`,
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
                        color={pct != null ? 'primary' : 'default'}
                      />
                      {pct != null && (
                        <Typography sx={{ fontWeight: 800, color: 'primary.main' }}>
                          {pct}%
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                );
              })}
            </Card>
          )}
        </>
      )}
    </Box>
  );
}
