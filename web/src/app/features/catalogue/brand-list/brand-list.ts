import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, switchMap, tap } from 'rxjs';
import { ClientApiService, Product } from '../../../shared/services';

@Component({
  selector: 'app-brand-list',
  standalone: false,
  templateUrl: './brand-list.html',
  styleUrl: './brand-list.scss',
})
export class BrandList {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ClientApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly category = signal('');
  readonly brands = signal<string[]>([]);
  readonly selectedBrand = signal<string | null>(null);
  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);

  constructor() {
    // Route: /catalogue/categories/:categoryId/brands?brand=  (categoryId is the category name)
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(
        tap(([params, query]) => {
          this.loading.set(true);
          this.category.set(params.get('categoryId') ?? '');
          this.selectedBrand.set(query.get('brand'));
        }),
        switchMap(([params, query]) =>
          combineLatest([
            this.api.getBrands(params.get('categoryId') ?? undefined),
            this.api.getProducts({
              category: params.get('categoryId') ?? undefined,
              brand: query.get('brand') ?? undefined,
            }),
          ]),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ([brands, products]) => {
          this.brands.set(brands);
          this.products.set(products);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
