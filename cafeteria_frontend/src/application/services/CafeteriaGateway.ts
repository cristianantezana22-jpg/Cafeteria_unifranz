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
  ProductAvailability,
} from '../../domain/models'

export interface CafeteriaGateway {
  login: (email: string, password: string) => Promise<CustomerSession>
  loginKiosk: () => Promise<CustomerSession>
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<CustomerSession>
  getProducts: (token?: string) => Promise<Product[]>
  getCategories: (token?: string) => Promise<Category[]>
  getFeaturedProducts: (token?: string) => Promise<Product[]>
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
  setProductAvailability: (
    token: string,
    productId: string,
    available: boolean,
  ) => Promise<ProductAvailability>
  placeOrder: (
    token: string | undefined,
    request: PlaceOrderRequest | OrderRequestItem[],
  ) => Promise<CustomerOrder>
  getCustomerOrderStatus: (
    token: string,
    orderId: string,
  ) => Promise<OrderStatus>
}