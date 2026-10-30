export type CustomerHeaderProps = {
  customerName: string
  cartItemCount: number
  onLogout: () => void
}

export function scrollToCart() {
  document.getElementById('cart')?.scrollIntoView({ behavior: 'smooth' })
}
