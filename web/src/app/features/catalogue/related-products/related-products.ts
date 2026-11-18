import { Component, DestroyRef, Input, OnChanges, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClientApiService, Product } from '../../../shared/services';

@Component({
  selector: 'app-related-products',
  standalone: false,
  templateUrl: './related-products.html',
  styleUrl: './related-products.scss',
})
export class RelatedProducts implements OnChanges {
  private readonly api = inject(ClientApiService);
  private readonly destroyRef = inject(DestroyRef);

  @Input({ required: true }) bookId!: number;
  @Input() limit = 3;

  readonly related = signal<Product[]>([]);
  readonly loaded = signal(false);

  ngOnChanges(): void {
    this.loaded.set(false);
    this.api
      .getRelatedProducts(this.bookId, this.limit)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (books) => {
          this.related.set(books);
          this.loaded.set(true);
        },
        error: () => {
          this.related.set([]);
          this.loaded.set(true);
        },
      });
  }

  hideImage(event: Event): void {
    (event.target as HTMLImageElement).style.visibility = 'hidden';
  }
}
