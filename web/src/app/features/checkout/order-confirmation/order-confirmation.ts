import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { AuthService, ClientApiService, Order, apiErrorMessage } from '../../../shared/services';

@Component({
  selector: 'app-order-confirmation',
  standalone: false,
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.scss',
})
export class OrderConfirmation {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ClientApiService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly order = signal<Order | null>(null);
  readonly error = signal('');
  readonly cancelling = signal(false);

  constructor() {
    this.route.paramMap
      .pipe(
        switchMap((p) => this.api.getOrder(Number(p.get('id')))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (order) => this.order.set(order),
        error: (err) => this.error.set(apiErrorMessage(err)),
      });
  }

  hideImage(event: Event): void {
    (event.target as HTMLImageElement).style.visibility = 'hidden';
  }

  cancel(): void {
    const order = this.order();
    if (!order) return;
    this.cancelling.set(true);
    this.error.set('');
    this.api
      .cancelOrder(order.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.order.set(updated);
          this.auth.refreshUser();
          this.cancelling.set(false);
        },
        error: (err) => {
          this.error.set(apiErrorMessage(err));
          this.cancelling.set(false);
        },
      });
  }
}
