import { Suspense } from 'react'
import { ProfilePage } from '@/views/profile-page'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProfilePage />
    </Suspense>
  )
}
