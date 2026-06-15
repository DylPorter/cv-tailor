import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'outline' | 'ghost'
type Size = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/40 active:scale-[0.98]'

const variants: Record<Variant, string> = {
  primary: 'bg-clay text-paper hover:bg-clay-deep shadow-[0_2px_0_0_var(--color-clay-deep)] hover:shadow-[0_1px_0_0_var(--color-clay-deep)] hover:translate-y-px',
  outline: 'border border-line bg-card text-ink hover:border-ink/30 hover:bg-paper',
  ghost: 'text-ink-soft hover:text-ink hover:bg-paper-deep',
}

const sizes: Record<Size, string> = {
  md: 'text-sm px-5 py-2.5',
  lg: 'text-base px-7 py-3.5',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
}
