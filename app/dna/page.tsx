import { redirect } from 'next/navigation'
import { getCurrentCompany } from '@/app/actions/company'
import { AppNav } from '@/components/app-nav'
import { DnaExplorer } from '@/components/dna/dna-explorer'

export default async function DnaPage() {
  const company = await getCurrentCompany()
  if (!company) redirect('/')

  if (!company.dna) {
    return (
      <main className="aurora-bg min-h-screen">
        <AppNav companyName={company.name} />
        <div className="flex h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">
            DNA non disponibile. Riprova dalla pagina iniziale.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="aurora-bg min-h-screen">
      <AppNav companyName={company.name} />
      <DnaExplorer dna={company.dna} companyName={company.name} />
    </main>
  )
}
