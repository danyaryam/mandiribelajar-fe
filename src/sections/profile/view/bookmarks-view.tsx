'use client';

import type { BookmarkItem } from 'src/lib/api/practice';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { ApiError } from 'src/lib/api/client';
import { getAccessToken } from 'src/lib/api/auth';
import { listBookmarks, removeBookmark } from 'src/lib/api/practice';

// ----------------------------------------------------------------------
// Daftar "Pelajari Lagi" — soal yang dibookmark pengguna (fitur tambahan).
// ----------------------------------------------------------------------

export function BookmarksView() {
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
    <Box sx={{ maxWidth: 760, mx: 'auto', px: 3, py: 8 }}>
      <Typography variant="h4" gutterBottom>
        Pelajari Lagi
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && <Typography color="text.secondary">Memuat…</Typography>}

      {!loading && items.length === 0 && (
        <Typography color="text.secondary">
          Belum ada soal tersimpan. Tandai soal di halaman hasil untuk menyimpannya.
        </Typography>
      )}

      <Card sx={{ mt: 2 }}>
        <List disablePadding>
          {items.map((item, i) => (
            <ListItem key={item.questionId} divider={i < items.length - 1}>
              <Stack spacing={1} sx={{ width: '100%' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Chip size="small" label={item.type === 'text' ? 'Teks' : 'Pilihan Ganda'} />
                  <Typography
                    component="button"
                    variant="body2"
                    color="primary"
                    sx={{
                      bgcolor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'none',
                    }}
                    onClick={() => handleRemove(item.questionId)}
                  >
                    Hapus
                  </Typography>
                </Box>
                <Typography variant="body1">{item.prompt}</Typography>
              </Stack>
            </ListItem>
          ))}
        </List>
      </Card>
    </Box>
  );
}
