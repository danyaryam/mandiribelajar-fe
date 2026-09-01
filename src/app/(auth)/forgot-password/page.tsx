import type { Metadata } from 'next';

import { ForgotPasswordView } from 'src/sections/auth/view/forgot-password-view';

export const metadata: Metadata = {
  title: 'Lupa Kata Sandi',
  description: 'Atur ulang kata sandi akun Mandiri Belajar.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}
