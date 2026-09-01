import Box from '@mui/material/Box';

import { MainLayout } from 'src/layouts/main';

import { AuthHeaderButtons } from 'src/components/auth/auth-header-buttons';

// ----------------------------------------------------------------------
// Layout landing (beranda). Header memuat tombol Login/Logout.
// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <MainLayout
      slotProps={{
        header: {
          sx: { position: { md: 'fixed' } },
          slots: {
            rightArea: (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AuthHeaderButtons />
              </Box>
            ),
          },
        },
      }}
    >
      {children}
    </MainLayout>
  );
}
