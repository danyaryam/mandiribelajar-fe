import type { Metadata } from 'next';

import { VerifyEmailView } from 'src/sections/auth/view/verify-email-view';

export const metadata: Metadata = {
  title: 'Verifikasi Email',
  description: 'Verifikasi email akun Mandiri Belajar.',
};

export default function VerifyEmailPage() {
  return <VerifyEmailView />;
}
