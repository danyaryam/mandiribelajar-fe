import type { Metadata } from 'next';

import { AuthView } from 'src/sections/auth/view/auth-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Daftar',
  description: 'Buat akun Mandiri Belajar.',
};

export default function RegisterPage() {
  return <AuthView mode="register" />;
}
