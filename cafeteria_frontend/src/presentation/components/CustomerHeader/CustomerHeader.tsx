import brandLogo from '../../assets/pink-paper-logo.svg'
import type { CustomerHeaderProps } from './CustomerHeader.logic'
import { scrollToCart } from './CustomerHeader.logic'
import './customer-header.css'

export function CustomerHeader({
  customerName,
  cartItemCount,
  onLogout,
}: CustomerHeaderProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <img className="brand-logo" src={brandLogo} alt="Pink Paper" />
      </div>
      <div className="topbar-right">
        <span className="location-label"><i /> LA PAZ, BOLIVIA</span>
        <span className="topbar-divider" />
        <span className="customer-name">{customerName}</span>
        <button
          className="cart-toggle"
          onClick={scrollToCart}
          aria-label={`Ver carrito, ${cartItemCount} productos`}
        >
          Carrito <span>{cartItemCount}</span>
        </button>
        <button className="logout-button" onClick={onLogout}>Salir</button>
      </div>
    </header>
  )
}
