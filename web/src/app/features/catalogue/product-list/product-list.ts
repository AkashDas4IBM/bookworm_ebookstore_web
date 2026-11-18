import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, tap } from 'rxjs';
import { ClientApiService, Product } from '../../../shared/services';

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ClientApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly title = signal('All Books');

  constructor() {
    // Re-fetch whenever ?category=, ?brand=, ?genre_group= or ?search= change
    this.route.queryParamMap
      .pipe(
        tap((q) => {
          this.loading.set(true);
          this.title.set(
            [q.get('brand'), q.get('category'), q.get('genre_group'), q.get('search') && `"${q.get('search')}"`]
              .filter(Boolean)
              .join(' · ') || 'All Books',
          );
        }),
        switchMap((q) =>
          this.api.getProducts({
            category: q.get('category') ?? undefined,
            brand: q.get('brand') ?? undefined,
            genre_group: q.get('genre_group') ?? undefined,
            search: q.get('search') ?? undefined,
          }),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (products) => {
          this.products.set(products);
          this.loading.set(false);
        },
        error: () => {
          this.products.set([]);
          this.loading.set(false);
        },
      });
  }
}
