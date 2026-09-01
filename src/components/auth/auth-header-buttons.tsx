'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';

import { logout, getAccessToken } from 'src/lib/api/auth';

// ----------------------------------------------------------------------
// Tombol Login / Logout di header. Client-only karena membaca access token
// yang disimpan in-memory (lihat src/lib/api/auth.ts).
// ----------------------------------------------------------------------

export function AuthHeaderButtons() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setAuthed(Boolean(getAccessToken()));
  }, []);

  const handleLogout = async () => {
    setBusy(true);
    try {
      await logout();
    } catch {
      // Logout tetap dianggap sukses lokal walau backend logout gagal.
    } finally {
      setAuthed(false);
      setBusy(false);
      router.push(paths.home);
      router.refresh();
    }
  };

  if (authed) {
    return (
      <>
        <Button
          variant="outlined"
          size="medium"
          onClick={() => router.push(paths.dashboard)}
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          Dashboard
        </Button>
        <Button
          variant="text"
          size="medium"
          disabled={busy}
          onClick={handleLogout}
          sx={{ borderRadius: 2, fontWeight: 700, color: 'text.secondary' }}
        >
          {busy ? 'Keluar…' : 'Logout'}
        </Button>
      </>
    );
  }

  return (
    <Button
      variant="contained"
      size="medium"
      onClick={() => router.push(paths.auth.login)}
      sx={{ borderRadius: 2, fontWeight: 700 }}
    >
      Login
    </Button>
  );
}
