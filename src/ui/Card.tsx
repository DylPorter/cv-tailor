import type { HTMLAttributes } from 'react'

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-card border border-line rounded-[var(--radius-card)] shadow-[0_1px_2px_rgba(33,29,24,0.04),0_8px_24px_-12px_rgba(33,29,24,0.12)] ${className}`}
      {...props}
    />
  )
}
