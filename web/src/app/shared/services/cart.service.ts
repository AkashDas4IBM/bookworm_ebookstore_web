import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { Cart, ClientApiService } from './client-api.service';

/** Holds the basket in a signal so the header badge and cart pages stay in sync. */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = inject(ClientApiService);
  private readonly auth = inject(AuthService);

  readonly cart = signal<Cart | null>(null);
  readonly itemCount = computed(() => this.cart()?.summary.item_count ?? 0);

  constructor() {
    // Load the basket on login, clear it on logout
    effect(() => {
      if (this.auth.isLoggedIn()) {
        this.refresh();
      } else {
        this.cart.set(null);
      }
    });
  }

  refresh(): void {
    this.api.getCart().subscribe({ next: (cart) => this.cart.set(cart), error: () => undefined });
  }

  add(productId: number, quantity = 1): Observable<Cart> {
    return this.api.addToCart(productId, quantity).pipe(tap((cart) => this.cart.set(cart)));
  }

  setQuantity(productId: number, quantity: number): Observable<Cart> {
    return this.api.updateCartItem(productId, quantity).pipe(tap((cart) => this.cart.set(cart)));
  }

  remove(productId: number): Observable<Cart> {
    return this.api.removeCartItem(productId).pipe(tap((cart) => this.cart.set(cart)));
  }
}
