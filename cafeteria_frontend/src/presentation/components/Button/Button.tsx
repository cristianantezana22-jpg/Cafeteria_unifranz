import './button.css'
import type { ButtonProps } from './Button.logic'
import { getButtonClassName } from './Button.logic'

export function Button({
  children,
  className,
  type = 'button',
  variant,
  disabled,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={getButtonClassName(variant, className)}
      type={type}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
