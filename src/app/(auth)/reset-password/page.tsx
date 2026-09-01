import type { Metadata } from 'next';

import { ResetPasswordView } from 'src/sections/auth/view/reset-password-view';

export const metadata: Metadata = {
  title: 'Atur Ulang Kata Sandi',
  description: 'Buat kata sandi baru untuk akun Mandiri Belajar.',
};

export default function ResetPasswordPage() {
  return <ResetPasswordView />;
}
