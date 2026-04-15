import { AdminLayout } from '@/components/admin/admin-layout'
import { Topbar } from '@/components/admin/topbar'
import { PageContent } from '@/components/admin/page-content'
import { UsersTable } from './users-table'

export default function UsersPage() {
  return (
    <AdminLayout>
      <Topbar title="Kullanıcılar" description="Kayıtlı kullanıcıları görüntüleyin" />
      <PageContent>
        <UsersTable />
      </PageContent>
    </AdminLayout>
  )
}
