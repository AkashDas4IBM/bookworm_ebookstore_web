import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';


export interface Product {
  id: number;
  title: string;
  author: string;
  category: string;
  format: string;
  brand: string;
  price: number;
  rating: number;
  description: string;
  image_url: string;
  back_image_url: string | null;
  language: string;
  genre_group: string | null;
  author_bio: string | null;
  author_image_url: string | null;
  stock: number;
  popularity: number;
  published_date: string | null;
  tentative_delivery_date: string | null;
  section: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ProductQuery {
  category?: string;
  brand?: string;
  genre_group?: string;
  search?: string;
}

export interface Review {
  id: number;
  product_id: number;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ReviewPayload {
  rating: number;
  comment: string;
  name?: string;
}

export interface Address {
  id: number;
  label: string;
  line1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  gift_points: number;
  addresses: Address[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface FormOptions {
  country_codes: { code: string; country: string }[];
  countries: string[];
  states: Record<string, string[]>;
}

export interface PriceSummary {
  item_count: number;
  subtotal: number;
  tax: number;
  delivery_charge: number;
  discount: number;
  coupon_code: string | null;
  points_redeemed: number;
  points_discount: number;
  total: number;
}

export interface CartLine {
  product: Product;
  quantity: number;
  line_total: number;
}

export interface Cart {
  items: CartLine[];
  summary: PriceSummary;
}

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface PaymentMethod {
  id: string;
  label: string;
  description: string;
  options: string[];
}

export interface PaymentIntent {
  id: string;
  amount: number;
  status: string;
  method: string | null;
  coupon_code: string | null;
  points_to_redeem: number;
  reference: string | null;
  message: string;
}

export interface PayPayload {
  method: string;
  card?: { number: string; name: string; cvv: string; expiry: string };
  upi_id?: string;
  wallet?: string;
}

export interface Coupon {
  code: string;
  description: string;
}

export interface PlaceOrderPayload {
  address: ShippingAddress;
  payment_id: string;
}

export interface OrderItem {
  product_id: number;
  title: string;
  author: string;
  format: string;
  image_url: string;
  description: string;
  category: string;
  genre_group: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface Order {
  id: number;
  status: string;
  placed_at: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  delivery_charge: number;
  discount: number;
  coupon_code: string | null;
  points_redeemed: number;
  points_earned: number;
  total: number;
  payment_method: string;
  payment_reference: string | null;
  address: ShippingAddress;
  estimated_delivery: string;
  cancellable: boolean;
  cancel_deadline: string | null;
}

export interface Writer {
  id: number;
  name: string;
  bio: string | null;
  image_url: string | null;
  book_count: number;
  following: boolean;
}

export interface WriterDetail extends Writer {
  books: Product[];
}

/** Pulls a readable message out of the API error envelope. */
export function apiErrorMessage(err: any): string {
  const body = err?.error;
  const detail = body?.details?.[0];
  if (detail?.message) return `${detail.field ? detail.field + ': ' : ''}${detail.message}`;
  return body?.message || 'Your request could not be processed. Please try again later.';
}

const errorMessage = 'Server error';
const serverErrorMsg: any = {
  message: 'Your request could not be processed. Please try again later.'
};

@Injectable({
  providedIn: 'root',
})
export class ClientApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000/api/v1';


  getCategories(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/categories`).pipe(
      map((res) => res),
      catchError((error: any) => {
        return throwError(error || errorMessage);
      })
    );
  }

  getProducts(query: ProductQuery = {}): Observable<Product[]> {
    let params = new HttpParams();
    if (query.category) params = params.set('category', query.category);
    if (query.brand) params = params.set('brand', query.brand);
    if (query.genre_group) params = params.set('genre_group', query.genre_group);
    if (query.search) params = params.set('search', query.search);

    return this.http.get<ApiResponse<Product[]>>(`${this.baseUrl}/products`, { params }).pipe(
      map((res) => res.data),
      catchError((error: any) => {
        return throwError(error || errorMessage);
      })
    );
  }

  getBrands(category?: string): Observable<string[]> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    return this.http
      .get<ApiResponse<string[]>>(`${this.baseUrl}/brands`, { params })
      .pipe(map((res) => res.data));
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<ApiResponse<Product>>(`${this.baseUrl}/products/${id}`).pipe(map((res) => res.data));
  }

  getRelatedProducts(id: number, limit = 3): Observable<Product[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http
      .get<ApiResponse<Product[]>>(`${this.baseUrl}/products/${id}/related`, { params })
      .pipe(map((res) => res.data));
  }

  getReviews(id: number): Observable<Review[]> {
    return this.http.get<ApiResponse<Review[]>>(`${this.baseUrl}/products/${id}/reviews`).pipe(map((res) => res.data));
  }

  addReview(id: number, payload: ReviewPayload): Observable<Review> {
    return this.http
      .post<ApiResponse<Review>>(`${this.baseUrl}/products/${id}/reviews`, payload)
      .pipe(map((res) => res.data));
  }

  // ---- Auth & user ----
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.baseUrl}/auth/login`, { email, password })
      .pipe(map((res) => res.data));
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.baseUrl}/auth/register`, payload)
      .pipe(map((res) => res.data));
  }

  getFormOptions(): Observable<FormOptions> {
    return this.http.get<ApiResponse<FormOptions>>(`${this.baseUrl}/meta/form-options`).pipe(map((res) => res.data));
  }

  getMe(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/users/me`).pipe(map((res) => res.data));
  }

  getAddresses(): Observable<Address[]> {
    return this.http.get<ApiResponse<Address[]>>(`${this.baseUrl}/users/me/addresses`).pipe(map((res) => res.data));
  }

  getRecommendations(): Observable<Product[]> {
    return this.http
      .get<ApiResponse<Product[]>>(`${this.baseUrl}/users/me/recommendations`)
      .pipe(map((res) => res.data));
  }

  // ---- Cart ----
  getCart(): Observable<Cart> {
    return this.http.get<ApiResponse<Cart>>(`${this.baseUrl}/cart`).pipe(map((res) => res.data));
  }

  addToCart(productId: number, quantity = 1): Observable<Cart> {
    return this.http
      .post<ApiResponse<Cart>>(`${this.baseUrl}/cart/items`, { product_id: productId, quantity })
      .pipe(map((res) => res.data));
  }

  updateCartItem(productId: number, quantity: number): Observable<Cart> {
    return this.http
      .put<ApiResponse<Cart>>(`${this.baseUrl}/cart/items/${productId}`, { quantity })
      .pipe(map((res) => res.data));
  }

  removeCartItem(productId: number): Observable<Cart> {
    return this.http.delete<ApiResponse<Cart>>(`${this.baseUrl}/cart/items/${productId}`).pipe(map((res) => res.data));
  }

  // ---- Checkout ----
  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http
      .get<ApiResponse<PaymentMethod[]>>(`${this.baseUrl}/checkout/payment-methods`)
      .pipe(map((res) => res.data));
  }

  getCoupons(): Observable<Coupon[]> {
    return this.http.get<ApiResponse<Coupon[]>>(`${this.baseUrl}/checkout/coupons`).pipe(map((res) => res.data));
  }

  getCheckoutSummary(couponCode: string | null, pointsToRedeem: number): Observable<PriceSummary> {
    return this.http
      .post<ApiResponse<PriceSummary>>(`${this.baseUrl}/checkout/summary`, {
        coupon_code: couponCode,
        points_to_redeem: pointsToRedeem,
      })
      .pipe(map((res) => res.data));
  }

  initiatePayment(couponCode: string | null, pointsToRedeem: number): Observable<PaymentIntent> {
    return this.http
      .post<ApiResponse<PaymentIntent>>(`${this.baseUrl}/checkout/payments`, {
        coupon_code: couponCode,
        points_to_redeem: pointsToRedeem,
      })
      .pipe(map((res) => res.data));
  }

  pay(paymentId: string, payload: PayPayload): Observable<PaymentIntent> {
    return this.http
      .post<ApiResponse<PaymentIntent>>(`${this.baseUrl}/checkout/payments/${paymentId}/pay`, payload)
      .pipe(map((res) => res.data));
  }


  placeOrder(payload: PlaceOrderPayload): Observable<{ order: Order; gift_points: number }> {
    return this.http
      .post<ApiResponse<{ order: Order; gift_points: number }>>(`${this.baseUrl}/checkout/place-order`, payload)
      .pipe(map((res) => res.data));
  }

  // ---- Orders ----
  getOrders(): Observable<Order[]> {
    return this.http.get<ApiResponse<Order[]>>(`${this.baseUrl}/orders`).pipe(map((res) => res.data));
  }

  getBuyAgain(): Observable<Product[]> {
    return this.http.get<ApiResponse<Product[]>>(`${this.baseUrl}/orders/buy-again`).pipe(map((res) => res.data));
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<ApiResponse<Order>>(`${this.baseUrl}/orders/${id}`).pipe(map((res) => res.data));
  }

  cancelOrder(id: number): Observable<Order> {
    return this.http.post<ApiResponse<Order>>(`${this.baseUrl}/orders/${id}/cancel`, {}).pipe(map((res) => res.data));
  }

  reorder(id: number): Observable<void> {
    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/orders/${id}/reorder`, {}).pipe(map(() => undefined));
  }

  // ---- Wishlist ----
  getWishlist(): Observable<Product[]> {
    return this.http.get<ApiResponse<Product[]>>(`${this.baseUrl}/wishlist`).pipe(map((res) => res.data));
  }

  addToWishlist(productId: number): Observable<Product[]> {
    return this.http
      .post<ApiResponse<Product[]>>(`${this.baseUrl}/wishlist`, { product_id: productId })
      .pipe(map((res) => res.data));
  }

  removeFromWishlist(productId: number): Observable<Product[]> {
    return this.http.delete<ApiResponse<Product[]>>(`${this.baseUrl}/wishlist/${productId}`).pipe(map((res) => res.data));
  }

  // ---- Writers ----
  getWriters(search?: string): Observable<Writer[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<ApiResponse<Writer[]>>(`${this.baseUrl}/writers`, { params }).pipe(map((res) => res.data));
  }

  getMyWriters(): Observable<Writer[]> {
    return this.http.get<ApiResponse<Writer[]>>(`${this.baseUrl}/writers/me`).pipe(map((res) => res.data));
  }

  getWriter(id: number): Observable<WriterDetail> {
    return this.http.get<ApiResponse<WriterDetail>>(`${this.baseUrl}/writers/${id}`).pipe(map((res) => res.data));
  }

  followWriter(id: number): Observable<Writer> {
    return this.http.post<ApiResponse<Writer>>(`${this.baseUrl}/writers/${id}/follow`, {}).pipe(map((res) => res.data));
  }

  unfollowWriter(id: number): Observable<Writer> {
    return this.http.delete<ApiResponse<Writer>>(`${this.baseUrl}/writers/${id}/follow`).pipe(map((res) => res.data));
  }
}
