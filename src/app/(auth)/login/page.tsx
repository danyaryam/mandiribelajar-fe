import type { Metadata } from 'next';

import { AuthView } from 'src/sections/auth/view/auth-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Masuk',
  description: 'Masuk ke akun Mandiri Belajar.',
};

export default function LoginPage() {
  return <AuthView mode="login" />;
}
