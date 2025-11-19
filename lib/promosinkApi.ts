/**
 * Promos Ink API client
 * Stubbed implementation for integration with https://api.promosinkwall-e.com
 */

const API_URL = process.env.PROMOSINK_API_URL || "https://api.promosinkwall-e.com";
const API_KEY = process.env.PROMOSINK_API_KEY || "";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface OrderPayload {
  orderNumber: string;
  customerAccountId: string;
  poNumber?: string;
  shipTo: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  inHandsDate?: string;
  shippingMethod: string;
  shippingCost: number;
  items: Array<{
    productId: string;
    variantId: string;
    quantity: number;
    unitPrice: number;
  }>;
  decorations: Array<{
    method: string;
    location: string;
    quantity: number;
    unitPrice: number;
    setupCharge?: number;
    config: any;
  }>;
  referenceFields?: Record<string, string>;
  notes?: string;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: string;
  externalId: string;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  poNumber?: string;
  shipTo: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  shippingMethod?: string;
  trackingNumber?: string;
  items: Array<{
    productId: string;
    variantId: string;
    quantity: number;
    unitPrice: number;
  }>;
  decorations: Array<{
    method: string;
    location: string;
    quantity: number;
    unitPrice: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Promos Ink API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Submit an order to the Promos Ink API
 */
export async function submitOrder(
  orderPayload: OrderPayload
): Promise<ApiResponse<OrderResponse>> {
  // Stubbed - return mock response if API key not configured
  if (!API_KEY) {
    console.log("Promos Ink API key not configured, using demo data");
    return {
      success: true,
      data: {
        id: `demo_${Date.now()}`,
        orderNumber: orderPayload.orderNumber,
        status: "RECEIVED",
        externalId: `ext_demo_${Date.now()}`,
      },
    };
  }

  return apiRequest<OrderResponse>("/orders", {
    method: "POST",
    body: JSON.stringify(orderPayload),
  });
}

/**
 * Get order details by ID
 */
export async function getOrder(
  orderId: string
): Promise<ApiResponse<OrderDetail>> {
  // Stubbed - return mock response if API key not configured
  if (!API_KEY) {
    console.log("Promos Ink API key not configured, using demo data");
    return {
      success: true,
      data: {
        id: orderId,
        orderNumber: `ORD-${orderId}`,
        status: "IN_PRODUCTION",
        shipTo: {
          name: "Mock Customer",
          address1: "123 Main St",
          city: "New York",
          state: "NY",
          zip: "10001",
          country: "US",
        },
        items: [],
        decorations: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  }

  return apiRequest<OrderDetail>(`/orders/${orderId}`);
}

/**
 * List orders for a customer
 */
export async function listOrdersForCustomer(
  customerAccountId: string
): Promise<ApiResponse<OrderDetail[]>> {
  // Stubbed - return mock response if API key not configured
  if (!API_KEY) {
    console.log("Promos Ink API key not configured, using demo data");
    return {
      success: true,
      data: [],
    };
  }

  return apiRequest<OrderDetail[]>(`/orders?customerAccountId=${customerAccountId}`);
}

