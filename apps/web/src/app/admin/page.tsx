import { redirect } from 'next/navigation'
import { WEB_ROUTES } from '@my-blog/shared'

export default function AdminIndexPage() {
  redirect(WEB_ROUTES.postsAdmin)
}
