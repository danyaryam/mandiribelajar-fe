import type { Metadata } from 'next';

import { Suspense } from 'react';

import { ResetPasswordView } from 'src/sections/auth/view/reset-password-view';

export const metadata: Metadata = {
  title: 'Atur Ulang Kata Sandi',
  description: 'Buat kata sandi baru untuk akun Mandiri Belajar.',
};

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordView />
    </Suspense>
  );
}
