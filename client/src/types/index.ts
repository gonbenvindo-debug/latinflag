export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  subcategory: string;
  basePrice: number;
  images: string[];
  specifications: {
    width?: number;
    height?: number;
    material?: string;
    printing?: string;
    finishing?: string;
  };
  customizationOptions: {
    allowsCustomDesign: boolean;
    maxFileSize: number;
    acceptedFormats: string[];
    colorOptions?: Array<{
      name: string;
      code: string;
      price: number;
    }>;
    sizeOptions?: Array<{
      name: string;
      width: number;
      height: number;
      price: number;
    }>;
  };
  stock: {
    available: boolean;
    quantity: number;
  };
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company?: {
    name: string;
    taxId?: string;
    website?: string;
  };
  addresses: Address[];
  isGuest: boolean;
  preferences: {
    newsletter: boolean;
    promotions: boolean;
  };
}

export interface Address {
  _id: string;
  name: string;
  company?: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface OrderItem {
  product: string | Product;
  quantity: number;
  unitPrice: number;
  customization: {
    designFile?: string;
    designUrl?: string;
    colors?: string[];
    size?: {
      width: number;
      height: number;
    };
    finishing?: string;
    notes?: string;
  };
  subtotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: string | Customer;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
  payment: {
    method: 'stripe' | 'paypal' | 'bank_transfer';
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    transactionId?: string;
    paidAt?: string;
  };
  status: 'pending' | 'paid' | 'processing' | 'supplier_ordered' | 'manufacturing' | 'shipped' | 'delivered' | 'cancelled';
  tracking: Array<{
    status: string;
    timestamp: string;
    notes?: string;
  }>;
  notes?: string;
  priority: 'normal' | 'urgent';
  createdAt: string;
  updatedAt: string;
}

export interface CartItem extends OrderItem {
  product: Product;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data?: T[];
  pagination?: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
  error?: string;
}
