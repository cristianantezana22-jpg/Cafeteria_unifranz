const API_BASE_URL = 'http://localhost:8080/api/v1/kiosk';

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
}

export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface KioskOrderPayload {
  block: 'BLOQUE_A' | 'BLOQUE_B';
  paymentMethod: 'QR' | 'EFECTIVO';
  items: OrderItem[];
}

export interface OrderResponse {
  status: string;
  ticketNumber: string;
  message: string;
  estimatedTimeMinutes: number;
}

export const getKioskMenu = async (): Promise<Product[]> => {
  try {
    const token = localStorage.getItem('kiosk_token');
    const response = await fetch(`${API_BASE_URL}/menu`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Error al cargar el menú');
    return await response.json();
  } catch (error) {
   
    return [
      { id: 1, name: 'Empanada de Queso', price: 5.0, category: 'Snacks' },
      { id: 2, name: 'Café Pasado', price: 4.0, category: 'Bebidas' },
      { id: 3, name: 'Almuerzo Ejecutivo', price: 15.0, category: 'Platos' },
      { id: 4, name: 'Jugo Natural', price: 6.0, category: 'Bebidas' },
    ];
  }
};

export const sendKioskOrder = async (payload: KioskOrderPayload): Promise<OrderResponse> => {
  try {
    const token = localStorage.getItem('kiosk_token');
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Error al procesar la orden');
    return await response.json();
  } catch (error) {
   
    const blockLetter = payload.block === 'BLOQUE_B' ? 'B' : 'A';
    const num = Math.floor(Math.random() * 99) + 1;
    const formattedNum = num < 10 ? `0${num}` : `${num}`;
    return {
      status: 'SUCCESS',
      ticketNumber: `${blockLetter}${formattedNum}`,
      message: 'Pedido procesado correctamente (Simulado)',
      estimatedTimeMinutes: 10
    };
  }
};