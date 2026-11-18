import { Component, OnInit, inject, DestroyRef, computed, signal } from '@angular/core';
import { AuthService, ClientApiService, Product, FilterAndSearchService } from '../../../shared/services';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly clientApi = inject(ClientApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly filterService = inject(FilterAndSearchService);
  readonly isLoggedIn = inject(AuthService).isLoggedIn;

  readonly products = signal<Product[]>([]);

  readonly recommendedBooks = computed(() => this.bySection('recommended'));
  readonly bestsellers = computed(() => this.bySection('bestseller'));
  readonly newLaunches = computed(() => this.bySection('new-launch'));

  ngOnInit(): void {
    this.getProducts();
  }

  /* get Products Data */
  getProducts(): void {
    this.clientApi
      .getProducts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (products) => {
          console.log('Products fetched from API:', products);

          this.products.set(products);
        },
        error: (err) => console.error('Failed to fetch products', err),
      });
  }

  /** Price ranges keyed by the dropdown option value: [min inclusive, max exclusive]. */
  private readonly priceRanges: Record<string, [number, number]> = {
    'Under ₹100': [0, 100],
    '₹100 - ₹250': [100, 250],
    '₹250 - ₹500': [250, 500],
    'Over ₹500': [500, Infinity],
  };

  private matchesPriceRange(price: number, range: string): boolean {
    const bounds = this.priceRanges[range];
    return !bounds || (price >= bounds[0] && price < bounds[1]);
  }

  private bySection(section: string): Product[] {
    const filtered = this.filterProducts(this.products().filter((p) => p.section === section));
    return this.sortProducts(filtered, this.filterService.filters().sortBy);
  }

  /** Sorts a copy of the list; 'Relevance' keeps the API order. */
  private sortProducts(list: Product[], sortBy: string): Product[] {
    const sorted = [...list];
    switch (sortBy) {
      case 'Popularity':
        return sorted.sort((a, b) => b.popularity - a.popularity);
      case 'Newest':
        return sorted.sort((a, b) =>
          (b.published_date ?? '').localeCompare(a.published_date ?? ''),
        );
      case 'Price: Low to High':
        return sorted.sort((a, b) => a.price - b.price);
      case 'Price: High to Low':
        return sorted.sort((a, b) => b.price - a.price);
      default:
        return sorted;
    }
  }

  /** Lowercases and strips hyphens/spaces so 'E-Book' and 'eBook' compare equal. */
  private normalize(value: string): string {
    return value.toLowerCase().replace(/[-\s]/g, '');
  }

  private filterProducts(list: Product[]): Product[] {
    const state = this.filterService.filters();
    // console.log('State==>>', state);

    return list.filter((book) => {
      // Search matching
      const matchesSearch =
        !state.search ||
        book.title.toLowerCase().includes(state.search.toLowerCase()) ||
        book.author.toLowerCase().includes(state.search.toLowerCase());

      // Category matching (sidebar)
      const matchesCategory =
        state.category === 'All' || this.normalize(book.category) === this.normalize(state.category);

      // Format matching
      const matchesFormat =
        state.format === 'All' || this.normalize(book.format) === this.normalize(state.format);

      // Price Range matching ('All' has no entry, so it passes)
      const matchesPrice = this.matchesPriceRange(book.price, state.priceRange);

      return matchesSearch && matchesCategory && matchesFormat && matchesPrice;
    });
  }
}
