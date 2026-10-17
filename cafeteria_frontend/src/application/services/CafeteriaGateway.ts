import type {
<<<<<<< HEAD
  CustomerOrder,
  CustomerSession,
  Category,
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
  placeOrder: (
    token: string,
    request: PlaceOrderRequest | OrderRequestItem[],
  ) => Promise<CustomerOrder>
=======
  CashierOrder,
  CashierProfile,
  CashierSession,
  MenuCategory,
  MenuProduct,
  MenuProductRequest,
  OrderStatus,
} from '../../domain/models'

export interface CafeteriaGateway {
  login: (email: string, password: string) => Promise<CashierSession>
  getMenuProducts: (token: string) => Promise<MenuProduct[]>
  getMenuCategories: (token: string) => Promise<MenuCategory[]>
  createMenuProduct: (
    token: string,
    product: MenuProductRequest,
  ) => Promise<MenuProduct>
  updateMenuProduct: (
    token: string,
    productId: string,
    product: MenuProductRequest,
  ) => Promise<MenuProduct>
  deleteMenuProduct: (token: string, productId: string) => Promise<void>
  getCashierProfile: (token: string) => Promise<CashierProfile>
  getCashierOrders: (token: string) => Promise<CashierOrder[]>
  updateOrderStatus: (
    token: string,
    orderId: number,
    status: OrderStatus,
  ) => Promise<CashierOrder>
>>>>>>> alan
}