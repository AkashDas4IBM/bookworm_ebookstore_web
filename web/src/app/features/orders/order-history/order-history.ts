import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService, CartService, ClientApiService, Order, apiErrorMessage } from '../../../shared/services';

@Component({
  selector: 'app-order-history',
  standalone: false,
  templateUrl: './order-history.html',
  styleUrl: './order-history.scss',
})
export class OrderHistory implements OnInit {
  private readonly api = inject(ClientApiService);
  private readonly cartService = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly orders = signal<Order[]>([]);
  readonly loading = signal(true);
  readonly message = signal('');
  readonly isError = signal(false);

  ngOnInit(): void {
    this.api
      .getOrders()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (orders) => {
          this.orders.set(orders);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  /** "Buy again": puts the books from an old order back in the cart. */
  buyAgain(orderId: number): void {
    this.api
      .reorder(orderId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.cartService.refresh();
          this.show('Books added to your cart.', false);
        },
        error: (err) => this.show(apiErrorMessage(err), true),
      });
  }

  cancel(orderId: number): void {
    this.api
      .cancelOrder(orderId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.orders.update((list) => list.map((o) => (o.id === updated.id ? updated : o)));
          this.auth.refreshUser();
          this.show(`Order #${updated.id} cancelled.`, false);
        },
        error: (err) => this.show(apiErrorMessage(err), true),
      });
  }

  private show(text: string, isError: boolean): void {
    this.message.set(text);
    this.isError.set(isError);
  }
}
