import { createClient } from '@supabase/supabase-js';
import { Product, Order, Customer, CartItem, PaginatedResponse } from '../types';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth service
export const authService = {
  signUp: async (email: string, password: string, metadata: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange: (callback: any) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Products service
export const productService = {
  getProducts: async (params?: {
    category?: string;
    subcategory?: string;
    featured?: boolean;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<PaginatedResponse<Product>> => {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });

    // Apply filters
    if (params?.category) {
      query = query.eq('category', params.category);
    }
    if (params?.subcategory) {
      query = query.eq('subcategory', params.subcategory);
    }
    if (params?.featured) {
      query = query.eq('featured', true);
    }
    if (params?.minPrice || params?.maxPrice) {
      if (params.minPrice) query = query.gte('base_price', params.minPrice);
      if (params.maxPrice) query = query.lte('base_price', params.maxPrice);
    }
    if (params?.search) {
      query = query.textSearch('name', params.search);
    }

    // Apply sorting
    if (params?.sort) {
      switch (params.sort) {
        case 'price':
          query = query.order('base_price', { ascending: true });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        case 'createdAt':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 12;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        current: page,
        pages: Math.ceil((count || 0) / limit),
        total: count || 0,
        limit
      }
    };
  },

  getCategories: async (): Promise<Record<string, string[]>> => {
    const { data, error } = await supabase
      .from('products')
      .select('category, subcategory')
      .eq('status', 'active');

    if (error) throw error;

    const categories: Record<string, string[]> = {};
    data?.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      if (!categories[item.category].includes(item.subcategory)) {
        categories[item.category].push(item.subcategory);
      }
    });

    return categories;
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(8);

    if (error) throw error;
    return data || [];
  },

  getProduct: async (slug: string): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error) throw error;
    return data;
  }
};

// Customers service
export const customerService = {
  getProfile: async (): Promise<Customer> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  updateProfile: async (profileData: Partial<Customer>): Promise<Customer> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('customers')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getAddresses: async (): Promise<any[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('customer_id', user.id)
      .order('is_default', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  addAddress: async (address: any): Promise<any> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // If setting as default, unset other addresses
    if (address.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('customer_id', user.id);
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({ ...address, customer_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateAddress: async (id: string, address: any): Promise<any> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // If setting as default, unset other addresses
    if (address.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('customer_id', user.id);
    }

    const { data, error } = await supabase
      .from('addresses')
      .update(address)
      .eq('id', id)
      .eq('customer_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteAddress: async (id: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('customer_id', user.id);

    if (error) throw error;
  }
};

// Orders service
export const orderService = {
  createOrder: async (orderData: {
    items: CartItem[];
    shippingAddress: any;
    billingAddress?: any;
    paymentMethod: string;
    notes?: string;
  }): Promise<Order> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const totals = {
      subtotal: orderData.items.reduce((sum, item) => sum + item.subtotal, 0),
      shipping: orderData.items.reduce((sum, item) => sum + item.subtotal, 0) > 100 ? 0 : 15,
      tax: 0, // Calculate tax based on your requirements
      total: 0
    };
    totals.tax = totals.subtotal * 0.23; // 23% IVA
    totals.total = totals.subtotal + totals.shipping + totals.tax;

    const { data, error } = await supabase
      .from('orders')
      .insert({
        customer_id: user.id,
        items: orderData.items,
        shipping_address: orderData.shippingAddress,
        billing_address: orderData.billingAddress || orderData.shippingAddress,
        totals,
        payment_method: orderData.paymentMethod,
        notes: orderData.notes
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Order>> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('customer_id', user.id);

    if (params?.status) {
      query = query.eq('status', params.status);
    }

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .range(from, to)
      .order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        current: page,
        pages: Math.ceil((count || 0) / limit),
        total: count || 0,
        limit
      }
    };
  },

  getOrder: async (id: string): Promise<Order> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('customer_id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  updatePayment: async (id: string, paymentData: {
    transactionId: string;
    status: string;
  }): Promise<Order> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const updateData: any = {
      payment_transaction_id: paymentData.transactionId,
      payment_status: paymentData.status
    };

    if (paymentData.status === 'paid') {
      updateData.payment_paid_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .eq('customer_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Storage service
export const storageService = {
  uploadDesign: async (file: File, orderId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${orderId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('designs')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('designs')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  uploadProductImage: async (file: File, productId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('products')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    return publicUrl;
  }
};

export default supabase;
