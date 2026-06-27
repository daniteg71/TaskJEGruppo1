import { redirect } from 'next/navigation'

// La lista bandi ora vive nella home. /bandi reindirizza lì (i dettagli sono in /bandi/[id]).
export default function BandiRedirect() {
  redirect('/')
}
