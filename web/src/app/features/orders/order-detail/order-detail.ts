import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { AuthService, ClientApiService, Order, apiErrorMessage } from '../../../shared/services';

@Component({
  selector: 'app-order-detail',
  standalone: false,
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
})
export class OrderDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ClientApiService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly order = signal<Order | null>(null);
  readonly error = signal('');

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

  cancel(): void {
    const order = this.order();
    if (!order) return;
    this.error.set('');
    this.api
      .cancelOrder(order.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.order.set(updated);
          this.auth.refreshUser();
        },
        error: (err) => this.error.set(apiErrorMessage(err)),
      });
  }
}
