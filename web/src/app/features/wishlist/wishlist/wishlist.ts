import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartService, ClientApiService, Product, apiErrorMessage } from '../../../shared/services';

@Component({
  selector: 'app-wishlist',
  standalone: false,
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss',
})
export class Wishlist implements OnInit {
  private readonly api = inject(ClientApiService);
  private readonly cartService = inject(CartService);
  private readonly destroyRef = inject(DestroyRef);

  readonly books = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly message = signal('');
  readonly isError = signal(false);

  ngOnInit(): void {
    this.api
      .getWishlist()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (books) => {
          this.books.set(books);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.show(apiErrorMessage(err), true);
        },
      });
  }

  remove(book: Product): void {
    this.api
      .removeFromWishlist(book.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (books) => {
          this.books.set(books);
          this.show(`"${book.title}" removed from your wishlist.`, false);
        },
        error: (err) => this.show(apiErrorMessage(err), true),
      });
  }

  addToCart(book: Product): void {
    this.cartService
      .add(book.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.show(`"${book.title}" added to your cart.`, false),
        error: (err) => this.show(apiErrorMessage(err), true),
      });
  }

  private show(text: string, isError: boolean): void {
    this.message.set(text);
    this.isError.set(isError);
  }
}
