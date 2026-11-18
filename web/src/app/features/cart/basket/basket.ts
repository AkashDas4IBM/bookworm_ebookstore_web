import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartService, apiErrorMessage } from '../../../shared/services';

@Component({
  selector: 'app-basket',
  standalone: false,
  templateUrl: './basket.html',
  styleUrl: './basket.scss',
})
export class Basket implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly destroyRef = inject(DestroyRef);

  readonly cart = this.cartService.cart;
  readonly error = signal('');

  ngOnInit(): void {
    this.cartService.refresh();
  }

  change(productId: number, quantity: number): void {
    this.run(
      quantity < 1 ? this.cartService.remove(productId) : this.cartService.setQuantity(productId, quantity),
    );
  }

  remove(productId: number): void {
    this.run(this.cartService.remove(productId));
  }

  hideImage(event: Event): void {
    (event.target as HTMLImageElement).style.visibility = 'hidden';
  }

  private run(call: ReturnType<CartService['remove']>): void {
    this.error.set('');
    call.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      error: (err) => this.error.set(apiErrorMessage(err)),
    });
  }
}
