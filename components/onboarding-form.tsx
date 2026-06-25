'use client'

import { useState, useTransition } from 'react'
import {
  Building2,
  Check,
  FolderOpen,
  Loader2,
  Sparkles,
  HardDrive,
} from 'lucide-react'
import { createCompany } from '@/app/actions/company'
import { Logo } from '@/components/brand'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const FAKE_FOLDERS = [
  'Documenti Aziendali',
  'Bilanci & Finanza',
  'Progetti R&S',
  'Amministrazione 2026',
]

export function OnboardingForm() {
  const [isPending, startTransition] = useTransition()
  const [driveState, setDriveState] = useState<
    'idle' | 'connecting' | 'picking' | 'connected'
  >('idle')
  const [folder, setFolder] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  function connectDrive() {
    setDriveState('connecting')
    setTimeout(() => setDriveState('picking'), 1100)
  }

  function pickFolder(name: string) {
    setFolder(name)
    setDriveState('connected')
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    if (!String(fd.get('name') || '').trim()) {
      setError('Inserisci il nome della tua azienda')
      return
    }
    fd.set('driveFolderName', folder)
    startTransition(async () => {
      try {
        await createCompany(fd)
      } catch (err) {
        // redirect() throws internally — only surface real errors
        if (err instanceof Error && !err.message.includes('NEXT_REDIRECT')) {
          setError(err.message)
        }
      }
    })
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="glass-strong rounded-3xl p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 rounded-2xl border border-border bg-primary/10 p-3">
            <Logo size={44} />
          </div>
          <h1 className="text-pretty text-2xl font-semibold tracking-tight">
            Benvenuto in Jesap
          </h1>
          <p className="mt-1.5 text-balance text-sm text-muted-foreground">
            Inserisci la tua azienda e collega Google Drive. Analizzeremo il tuo
            DNA per trovare i bandi giusti.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nome azienda</Label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                placeholder="Es. Acme Innovazione S.r.l."
                className="pl-9"
                autoComplete="organization"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="sector">Settore</Label>
            <Input
              id="sector"
              name="sector"
              placeholder="Es. Manifatturiero, Software, Agroalimentare"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Cosa fa la tua azienda?</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Breve descrizione di prodotti, mercati e obiettivi…"
              className="resize-none"
            />
          </div>

          {/* Google Drive mock connector */}
          <div className="rounded-2xl border border-border bg-secondary/30 p-4">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-background/60 p-2">
                <HardDrive className="size-4 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Cartella Google Drive</p>
                <p className="text-xs text-muted-foreground">
                  {driveState === 'connected'
                    ? `Collegata: ${folder}`
                    : 'Collega i documenti aziendali'}
                </p>
              </div>
              {driveState === 'connected' && (
                <span className="flex size-6 items-center justify-center rounded-full bg-ok/20">
                  <Check className="size-3.5 text-ok" />
                </span>
              )}
            </div>

            {driveState === 'idle' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={connectDrive}
                className="mt-3 w-full bg-transparent"
              >
                <FolderOpen className="size-4" />
                Connetti Google Drive
              </Button>
            )}

            {driveState === 'connecting' && (
              <div className="mt-3 flex items-center justify-center gap-2 py-1.5 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Connessione a Google…
              </div>
            )}

            {driveState === 'picking' && (
              <div className="mt-3 flex flex-col gap-1.5">
                <p className="text-xs text-muted-foreground">
                  Seleziona una cartella:
                </p>
                {FAKE_FOLDERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => pickFolder(f)}
                    className="flex items-center gap-2 rounded-lg border border-border bg-background/40 px-3 py-2 text-left text-sm transition-colors hover:bg-primary/10"
                  >
                    <FolderOpen className="size-4 text-accent" />
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="mt-1 w-full"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Analisi del DNA in corso…
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Analizza il DNA aziendale
              </>
            )}
          </Button>
        </form>
      </div>

      {isPending && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Stiamo leggendo i documenti e costruendo la mappa del tuo DNA…
        </p>
      )}
    </div>
  )
}
