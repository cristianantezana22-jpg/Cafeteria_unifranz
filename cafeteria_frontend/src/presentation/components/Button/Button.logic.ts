import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'outlined' | 'checkout'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant: ButtonVariant
}

export function getButtonClassName(
  variant: ButtonVariant,
  className?: string,
) {
  return ['button', `button--${variant}`, className].filter(Boolean).join(' ')
}
