import Image from 'next/image'
import { cn } from '@/lib/utils'

export function Logo({
  size = 36,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-xl',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/jesap-logo.png"
        alt="Logo Jesap"
        width={size}
        height={size}
        className="h-full w-full object-contain"
        priority
      />
    </span>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <Logo size={32} />
      <span className="text-lg font-semibold tracking-tight">
        Jesap
        <span className="text-muted-foreground font-normal"> Intelligence</span>
      </span>
    </div>
  )
}
