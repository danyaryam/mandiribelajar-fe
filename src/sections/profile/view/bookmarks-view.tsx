'use client';

import type { BookmarkItem } from 'src/lib/api/practice';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';

import { ApiError } from 'src/lib/api/client';
import { getAccessToken } from 'src/lib/api/auth';
import { listBookmarks, removeBookmark } from 'src/lib/api/practice';

// ----------------------------------------------------------------------
// Daftar "Pelajari Lagi" — soal yang dibookmark pengguna (fitur tambahan).
// ----------------------------------------------------------------------

export function BookmarksView() {
  const theme = useTheme();
  const router = useRouter();
  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(paths.auth.login);
      return;
    }
    listBookmarks()
      .then(setItems)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Gagal memuat soal tersimpan.')
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = async (questionId: string) => {
    try {
      await removeBookmark(questionId);
      setItems((prev) => prev.filter((i) => i.questionId !== questionId));
    } catch {
      setError('Gagal menghapus soal tersimpan.');
    }
  };

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
          Pelajari Lagi
        </Typography>
        <Typography sx={{ opacity: 0.92, mt: 0.5 }}>
          Soal yang kamu tandai untuk diulas kembali.
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading && <Typography color="text.secondary">Memuat…</Typography>}

      {!loading && items.length === 0 && (
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
            textAlign: 'center',
            py: 5,
          }}
        >
          <Typography sx={{ fontSize: 40 }}>🔖</Typography>
          <Typography color="text.secondary">
            Belum ada soal tersimpan. Tandai soal di halaman hasil untuk menyimpannya.
          </Typography>
          <Button
            variant="contained"
            component="a"
            href={paths.courses.configure}
            sx={{ mt: 2, borderRadius: 2, fontWeight: 700 }}
          >
            Mulai Latihan
          </Button>
        </Card>
      )}

      <Stack spacing={1.5}>
        {items.map((item) => (
          <Card
            key={item.questionId}
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
              background: `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.05)}, rgba(255,255,255,0))`,
              transition: 'transform .18s, box-shadow .18s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 22px rgba(0,0,0,.08)' },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1,
                }}
              >
                <Chip
                  size="small"
                  label={item.type === 'text' ? 'Teks' : 'Pilihan Ganda'}
                  variant="soft"
                  color="primary"
                />
                <Button
                  size="small"
                  variant="text"
                  color="error"
                  onClick={() => handleRemove(item.questionId)}
                >
                  Hapus
                </Button>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
                {item.prompt}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
