

// stores/CartStore.ts
import { makeAutoObservable } from "mobx"
import { getApiUrl } from "@/config/api"

export interface DJ {
  name: string;
  image: string;
}

export interface Host {
  name: string;
  image: string;
}

export interface Sponsor {
  name: string | null;
  image: string | null;
}

export interface CartItem {
  id: number;
  user_id: string;
  flyer_is: number;
  added_time: string;
  status?: string;
  presenting: string;
  event_title: string;
  image_url: string | null;
  event_date: string;
  address_and_phone: string;
  delivery_time: string;
  amount?: string;
  venue_logo?: string | null;
  djs: DJ[];
  host: Host;
  sponsors: Sponsor[];
  flyer_info: string;
  custom_notes: string;
  email: string | null;
  story_size_version: number | boolean;
  custom_flyer: number | boolean;
  animated_flyer: number | boolean;
  instagram_post_size: number | boolean;
  total_price: string | number;
  flyer?: {
    id: number;
    title: string;
    price: number;
    image: string;
    type: string;
    categories: string[];
  };
}


export interface CartResponse {
  success: boolean;
  count: number;
  cart: CartItem[];
}

export interface AddToCartData {
  presenting: string;
  event_title: string;
  event_date: string;
  flyer_info: string;
  address_phone: string;
  story_size_version: string;
  custom_flyer: string;
  animated_flyer: string;
  instagram_post_size: string;
  custom_notes: string;
  flyer_is: string;
  category_id: string;
  user_id: string;
  delivery_time: string;
  total_price: string;
  subtotal: string;
  image_url?: string;
  venue_logo?: File;
  host_file?: File;
  dj_0?: File;
  dj_1?: File;
  sponsor_0?: File;
  sponsor_1?: File;
  sponsor_2?: File;
  djs: string;
  host: string;
  sponsors: string;
  web_user_id?: string;
  " total_price"?: string;
}

export class CartStore {
  cartItems: CartItem[] = [];
  isLoading = false;
  error: string | null = null;
  isAdding = false;
  addError: string | null = null;

  constructor() {
    makeAutoObservable(this)
  }

  // Load cart for user from API
  async load(userId: string) {
    if (!userId) return

    this.isLoading = true
    this.error = null

    try {
      const response = await fetch(getApiUrl(`/api/cart/${userId}`))
      const data: CartResponse = await response.json()


      if (data.success && Array.isArray(data.cart)) {
        this.cartItems = data.cart
      } else {
        this.cartItems = []
      }
    } catch (err) {
      this.error = "Failed to load cart"
      this.cartItems = []
    } finally {
      this.isLoading = false
    }
  }

  // Add item to cart with FormData
  async addToCart(formData: FormData) {
    if (this.cartItems.length >= 15) {
      throw new Error("Cart Limit: Maximum 15 flyers per order. Please complete purchase for current items first.")
    }

    this.isAdding = true
    this.addError = null

    try {
      const response = await fetch(getApiUrl('/api/cart/add'), {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {

        // Reload cart to get updated items
        const userId = formData.get('user_id') as string
        if (userId) {
          await this.load(userId)
        }

        return { success: true, data }
      } else {
        throw new Error(data.message || 'Failed to add item to cart')
      }
    } catch (err) {
      this.addError = err instanceof Error ? err.message : 'Failed to add item to cart'
      throw err
    } finally {
      this.isAdding = false
    }
  }

  // Remove item from cart (API call needed)
  async removeFromCart(itemId: number, userId: string) {
    if (!userId) return

    try {
      // You'll need to implement the remove endpoint
      const response = await fetch(getApiUrl(`/api/cart/remove/${itemId}`), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId })
      })

      if (response.ok) {
        this.cartItems = this.cartItems.filter(item => item.id !== itemId)
      }
    } catch (err) {
      this.error = "Failed to remove item from cart"
    }
  }

  // Clear entire cart
  async clearCart(userId: string) {
    if (!userId) return

    try {
      // You'll need to implement the clear endpoint
      const response = await fetch(getApiUrl(`/api/cart/clear/${userId}`), {
        method: "DELETE"
      })

      if (response.ok) {
        this.cartItems = []
      }
    } catch (err) {
      this.error = "Failed to clear cart"
    }
  }

  // Get total items count
  get count() {
    return this.cartItems.length
  }

  // Get total price (convert string to number)
  get totalPrice() {
    return this.cartItems.reduce((sum, item) => {
      const price = parseFloat(String(item.total_price)) || 0
      return sum + price
    }, 0)
  }

  // Get formatted total price
  get formattedTotalPrice() {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(this.totalPrice)
  }

  // Check if cart is empty
  get isEmpty() {
    return this.cartItems.length === 0
  }

  // Get item by ID
  getItemById(itemId: number) {
    return this.cartItems.find(item => item.id === itemId)
  }

  // Get items grouped by status
  get itemsByStatus() {
    const grouped: Record<string, CartItem[]> = {}
    this.cartItems.forEach(item => {
      const status = item.status || 'pending'
      if (!grouped[status]) {
        grouped[status] = []
      }
      grouped[status].push(item)
    })
    return grouped
  }
}
