import { redirect } from 'next/navigation'
import { getCurrentCompany, getGrants, getSearchHistory } from '@/app/actions/company'
import { AppNav } from '@/components/app-nav'
import { GrantsDashboard } from '@/components/dashboard/grants-dashboard'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ run?: string }>
}) {
  const company = await getCurrentCompany()
  if (!company) redirect('/')

  const { run } = await searchParams
  const runId = run ? Number.parseInt(run, 10) : undefined

  const [grants, history] = await Promise.all([
    getGrants(Number.isFinite(runId) ? runId : undefined),
    getSearchHistory(),
  ])

  return (
    <main className="aurora-bg min-h-screen pb-12">
      <AppNav companyName={company.name} />
      <div className="relative z-10">
        <GrantsDashboard
          grants={grants}
          history={history}
          activeRunId={Number.isFinite(runId) ? runId : undefined}
        />
      </div>
    </main>
  )
}
