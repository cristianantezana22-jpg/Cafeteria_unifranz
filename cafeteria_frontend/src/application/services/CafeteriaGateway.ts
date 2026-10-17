import type {
  CustomerOrder,
  CustomerSession,
  Category,
  CashierOrder,
  CashierProfile,
  MenuCategory,
  MenuProduct,
  MenuProductRequest,
  OrderStatus,
  OrderRequestItem,
  PlaceOrderRequest,
  Product,
} from '../../domain/models'

export interface CafeteriaGateway {
  login: (email: string, password: string) => Promise<CustomerSession>
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<CustomerSession>
  getProducts: (token?: string) => Promise<Product[]>
  getCategories: (token?: string) => Promise<Category[]>
  getFeaturedProducts: (token: string) => Promise<Product[]>
  getCashierOrders: (token: string) => Promise<CashierOrder[]>
  getCashierProfile: (token: string) => Promise<CashierProfile>
  updateOrderStatus: (
    token: string,
    orderId: number,
    status: OrderStatus,
  ) => Promise<CashierOrder>
  getMenuProducts: (token: string) => Promise<MenuProduct[]>
  getMenuCategories: (token: string) => Promise<MenuCategory[]>
  createMenuProduct: (
    token: string,
    request: MenuProductRequest,
  ) => Promise<MenuProduct>
  updateMenuProduct: (
    token: string,
    productId: string,
    request: MenuProductRequest,
  ) => Promise<MenuProduct>
  deleteMenuProduct: (token: string, productId: string) => Promise<void>
  placeOrder: (
    token: string,
    request: PlaceOrderRequest | OrderRequestItem[],
  ) => Promise<CustomerOrder>
}