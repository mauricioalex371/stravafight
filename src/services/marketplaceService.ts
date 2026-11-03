/**
 * MARKETPLACE SERVICE
 * Gerenciamento completo do marketplace multivendedor
 * Produtos, Carrinho, Checkout, Pedidos
 */

import { supabase } from './supabaseClient';
import type {
  MarketplaceStore,
  MarketplaceProduct,
  ProductVariant,
  ShoppingCart,
  CartItem,
  Order,
  ShippingAddress,
  ProductReview,
  Coupon
} from '../types';

export class MarketplaceService {
  // ==========================================
  // PRODUTOS
  // ==========================================

  static async getProducts(filters?: {
    category?: string;
    modality?: string;
    store_id?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  }): Promise<MarketplaceProduct[]> {
    try {
      let query = supabase
        .from('marketplace_products')
        .select(`
          *,
          store:marketplace_stores(id, store_name, logo_url, rating_average),
          category:marketplace_categories(name)
        `)
        .eq('is_active', true)
        .eq('status', 'ACTIVE');

      if (filters?.category) query = query.eq('category_id', filters.category);
      if (filters?.modality) query = query.eq('modality', filters.modality);
      if (filters?.store_id) query = query.eq('store_id', filters.store_id);
      if (filters?.min_price) query = query.gte('base_price', filters.min_price);
      if (filters?.max_price) query = query.lte('base_price', filters.max_price);
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Ordenação
      switch (filters?.sort_by) {
        case 'price_asc':
          query = query.order('base_price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('base_price', { ascending: false });
          break;
        case 'popular':
          query = query.order('sales_count', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((p: any) => ({
        ...p,
        store_name: p.store?.store_name || '',
        store_logo: p.store?.logo_url || '',
        category_name: p.category?.name || ''
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  static async getProductBySlug(slug: string): Promise<MarketplaceProduct | null> {
    try {
      const { data, error } = await supabase
        .from('marketplace_products')
        .select(`
          *,
          store:marketplace_stores(*),
          category:marketplace_categories(name),
          variants:marketplace_product_variants(*)
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Incrementar visualizações
      await supabase
        .from('marketplace_products')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', data.id);

      return {
        ...data,
        store_name: data.store?.store_name || '',
        store_logo: data.store?.logo_url || '',
        category_name: data.category?.name || ''
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  // ==========================================
  // CARRINHO DE COMPRAS
  // ==========================================

  static async getCart(userId: string): Promise<ShoppingCart> {
    try {
      // Buscar carrinho ativo ou criar novo
      let { data: cart, error } = await supabase
        .from('marketplace_carts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'ACTIVE')
        .single();

      if (error || !cart) {
        const { data: newCart } = await supabase
          .from('marketplace_carts')
          .insert({ user_id: userId })
          .select()
          .single();
        cart = newCart;
      }

      if (!cart) return { id: '', user_id: userId, items: [], subtotal: 0, items_count: 0 };

      // Buscar itens do carrinho
      const { data: items } = await supabase
        .from('marketplace_cart_items')
        .select(`
          *,
          product:marketplace_products(id, name, main_image_url, base_price, sale_price, stock_quantity),
          variant:marketplace_product_variants(id, name, stock_quantity),
          store:marketplace_products(store_id, store:marketplace_stores(store_name))
        `)
        .eq('cart_id', cart.id);

      const cartItems: CartItem[] = (items || []).map((item: any) => ({
        id: item.id,
        cart_id: item.cart_id,
        product_id: item.product_id,
        product_name: item.product?.name || '',
        product_image: item.product?.main_image_url || '',
        variant_id: item.variant_id,
        variant_name: item.variant?.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        store_id: item.product?.store_id || '',
        store_name: item.store?.store?.store_name || ''
      }));

      const subtotal = cartItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

      return {
        id: cart.id,
        user_id: userId,
        items: cartItems,
        subtotal,
        items_count: cartItems.reduce((sum, item) => sum + item.quantity, 0)
      };
    } catch (error) {
      console.error('Error fetching cart:', error);
      return { id: '', user_id: userId, items: [], subtotal: 0, items_count: 0 };
    }
  }

  static async addToCart(
    userId: string,
    productId: string,
    variantId: string | null,
    quantity: number
  ): Promise<boolean> {
    try {
      // Obter carrinho
      const cart = await this.getCart(userId);
      if (!cart.id) return false;

      // Verificar estoque
      const { data: product } = await supabase
        .from('marketplace_products')
        .select('*, variants:marketplace_product_variants(*)')
        .eq('id', productId)
        .single();

      if (!product) return false;

      const price = product.sale_price || product.base_price;

      // Verificar se já existe no carrinho
      const { data: existing } = await supabase
        .from('marketplace_cart_items')
        .select('*')
        .eq('cart_id', cart.id)
        .eq('product_id', productId)
        .eq('variant_id', variantId || null)
        .single();

      if (existing) {
        // Atualizar quantidade
        const { error } = await supabase
          .from('marketplace_cart_items')
          .update({
            quantity: existing.quantity + quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
        return !error;
      } else {
        // Inserir novo item
        const { error } = await supabase
          .from('marketplace_cart_items')
          .insert({
            cart_id: cart.id,
            product_id: productId,
            variant_id: variantId,
            quantity,
            unit_price: price
          });
        return !error;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  }

  static async removeFromCart(cartItemId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('marketplace_cart_items')
        .delete()
        .eq('id', cartItemId);
      return !error;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  }

  static async updateCartItemQuantity(cartItemId: string, quantity: number): Promise<boolean> {
    try {
      if (quantity <= 0) {
        return await this.removeFromCart(cartItemId);
      }

      const { error } = await supabase
        .from('marketplace_cart_items')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('id', cartItemId);
      return !error;
    } catch (error) {
      console.error('Error updating cart item:', error);
      return false;
    }
  }

  // ==========================================
  // CUPONS
  // ==========================================

  static async validateCoupon(code: string, subtotal: number): Promise<Coupon | null> {
    try {
      const { data, error } = await supabase
        .from('marketplace_coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString())
        .lte('min_purchase_amount', subtotal)
        .single();

      if (error || !data) return null;

      // Verificar limite de usos
      if (data.max_uses && data.uses_count >= data.max_uses) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error validating coupon:', error);
      return null;
    }
  }

  static calculateDiscount(coupon: Coupon, subtotal: number): number {
    if (coupon.discount_type === 'PERCENTAGE') {
      return (subtotal * coupon.discount_value) / 100;
    } else {
      return Math.min(coupon.discount_value, subtotal);
    }
  }

  // ==========================================
  // PEDIDOS
  // ==========================================

  static async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('marketplace_orders')
        .select(`
          *,
          shipping_address:marketplace_addresses(*),
          items:marketplace_order_items(
            *,
            store:marketplace_stores(store_name),
            product:marketplace_products(main_image_url)
          )
        `)
        .eq('buyer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((order: any) => ({
        ...order,
        buyer_name: '',
        buyer_avatar: '',
        items: (order.items || []).map((item: any) => ({
          ...item,
          store_name: item.store?.store_name || '',
          product_image: item.product?.main_image_url || ''
        }))
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  // ==========================================
  // ENDEREÇOS
  // ==========================================

  static async getUserAddresses(userId: string): Promise<ShippingAddress[]> {
    try {
      const { data, error } = await supabase
        .from('marketplace_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching addresses:', error);
      return [];
    }
  }

  static async saveAddress(address: Partial<ShippingAddress>): Promise<ShippingAddress | null> {
    try {
      const { data, error } = await supabase
        .from('marketplace_addresses')
        .upsert(address)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving address:', error);
      return null;
    }
  }

  // ==========================================
  // AVALIAÇÕES
  // ==========================================

  static async getProductReviews(productId: string): Promise<ProductReview[]> {
    try {
      const { data, error } = await supabase
        .from('marketplace_product_reviews')
        .select(`
          *,
          reviewer:profiles(username, full_name, avatar_url)
        `)
        .eq('product_id', productId)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((review: any) => ({
        ...review,
        reviewer_name: review.reviewer?.full_name || '',
        reviewer_avatar: review.reviewer?.avatar_url || ''
      }));
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  }
}
