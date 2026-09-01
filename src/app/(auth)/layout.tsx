import { SimpleLayout } from 'src/layouts/simple';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: Props) {
  return <SimpleLayout>{children}</SimpleLayout>;
}
