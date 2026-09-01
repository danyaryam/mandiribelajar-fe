import { RouteGuard } from 'src/components/auth';

type Props = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: Props) {
  return <RouteGuard>{children}</RouteGuard>;
}
