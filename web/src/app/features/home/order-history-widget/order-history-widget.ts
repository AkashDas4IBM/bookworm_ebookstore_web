import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClientApiService, Product } from '../../../shared/services';

/** "Buy it again": books from the customer's past orders. */
@Component({
  selector: 'app-order-history-widget',
  standalone: false,
  templateUrl: './order-history-widget.html',
  styleUrl: './order-history-widget.scss',
})
export class OrderHistoryWidget implements OnInit {
  private readonly api = inject(ClientApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly books = signal<Product[]>([]);

  ngOnInit(): void {
    this.api
      .getBuyAgain()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (books) => this.books.set(books), error: () => this.books.set([]) });
  }
}
