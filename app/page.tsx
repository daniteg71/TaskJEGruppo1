import { redirect } from 'next/navigation'
import { getCurrentCompany } from '@/app/actions/company'
import { OnboardingForm } from '@/components/onboarding-form'

export default async function AccessPage() {
  const company = await getCurrentCompany()
  if (company) redirect('/dna')

  return (
    <main className="aurora-bg flex min-h-screen items-center justify-center p-4">
      <div className="relative z-10 flex w-full flex-col items-center">
        <OnboardingForm />
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Jesap Intelligence · Finanza agevolata guidata dai dati
        </p>
      </div>
    </main>
  )
}
