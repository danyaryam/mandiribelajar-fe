import type { Metadata } from 'next';

import { ProfileView } from 'src/sections/profile/view/profile-view';

export const metadata: Metadata = {
  title: 'Profil',
};

export default function ProfilePage() {
  return <ProfileView />;
}
