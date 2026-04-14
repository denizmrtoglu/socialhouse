import { AdminLayout } from '@/components/admin/admin-layout'
import { Topbar } from '@/components/admin/topbar'
import { PageContent } from '@/components/admin/page-content'
import { apiGet } from '@/lib/api'
import type { Offer } from '@repo/types'
import { OffersInbox } from './offers-inbox'

export default async function OffersPage() {
  let offers: Offer[] = []
  try {
    offers = await apiGet<Offer[]>('/admin/offers')
  } catch {
    // API unreachable
  }

  return (
    <AdminLayout>
      <Topbar
        title="Teklifler"
        description={`${offers.length} teklif talebi`}
      />
      <PageContent>
        <OffersInbox initialOffers={offers} />
      </PageContent>
    </AdminLayout>
  )
}
